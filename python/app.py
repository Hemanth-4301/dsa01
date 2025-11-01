import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId

from recommender import Recommender


load_dotenv()

MONGO_URI = os.environ.get("MONGO_URI") or "mongodb://localhost:27017"
DB_NAME = os.environ.get("DB_NAME") or "dsa01"
COLLECTION_NAME = os.environ.get("COLLECTION_NAME") or "questions"
PORT = int(os.environ.get("PORT", 8000))

app = Flask(__name__)
CORS(app)

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

recommender = Recommender()


def load_and_fit():
    # load minimal fields for speed; include tags and problem/title and any metadata we want to return
    docs = list(collection.find({}, {"tags": 1, "problem": 1, "title": 1, "difficulty": 1, "category": 1}))
    # ensure consistent _id representation
    recommender.fit(docs)


@app.route("/reload", methods=["POST"])
def reload_data():
    load_and_fit()
    return jsonify({"status": "ok", "loaded": len(recommender._docs)})


@app.route("/recommend/<question_id>", methods=["GET"])
def recommend(question_id):
    # optional param n
    try:
        n = int(request.args.get("n", 3))
    except Exception:
        n = 3

    # ensure recommender is fitted
    if not recommender._docs:
        load_and_fit()

    # try to find the question in DB to handle both ObjectId and string ids
    query = None
    try:
        query = collection.find_one({"_id": ObjectId(question_id)})
    except Exception:
        query = collection.find_one({"_id": question_id})

    if not query:
        return jsonify({"error": "question not found"}), 404

    # run recommender
    recs = recommender.recommend(str(query.get("_id")), k=n)

    # assemble enriched results
    q_tags = {t.strip().lower() for t in (query.get("tags") or []) if isinstance(t, str)}
    results = []
    for r in recs:
        # original doc may be in recommender._docs with ObjectId or raw; try to fetch from collection if missing
        doc = recommender._docs.get(r["_id"]) or collection.find_one({"_id": ObjectId(r["_id"])}) or {}
        tags = [t for t in (doc.get("tags") or []) if isinstance(t, str)]
        matching = [t for t in tags if t.strip().lower() in q_tags]
        results.append(
            {
                "_id": str(doc.get("_id") or r.get("_id")),
                "problem": doc.get("problem") or doc.get("title") or r.get("problem"),
                "tags": tags,
                "matchingTags": matching,
                "difficulty": doc.get("difficulty"),
                "category": doc.get("category"),
                "relevanceScore": r.get("score", 0.0),
            }
        )

    return jsonify({"recommendations": results})


if __name__ == "__main__":
    print(f"Starting recommender on port {PORT} connecting to {MONGO_URI} ({DB_NAME}.{COLLECTION_NAME})")
    load_and_fit()
    app.run(host="0.0.0.0", port=PORT, debug=True)
