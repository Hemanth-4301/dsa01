# DSA01 — DSA Learning Platform

This repository is a small DSA (Data Structures & Algorithms) learning platform with:

- A React + Vite frontend (`frontend/`) that displays coding questions, lets users mark progress, and shows related questions.
- An Express + Mongoose backend (`server/`) serving REST APIs for auth, questions, progress and admin features.
- A lightweight Python Flask microservice (`python/`) that provides a simple tag-based KNN-like recommender (Jaccard similarity on tags) to suggest similar questions.

This README documents how the project is organized, how the pieces work, and how to run and integrate the recommender.

## Table of contents

- Project structure
- Key components & how they interact
- Data model (MongoDB schemas)
- How to run locally (frontend, backend, recommender)
- API summary
- How the recommender works (algorithm details)
- Frontend integration (what changed)
- Troubleshooting & next steps

## Project structure

Top-level folders

- `frontend/` — React (Vite) app. Main entry `src/main.jsx`. Uses `react-query`, `react-router`, and Tailwind.
- `server/` — Node/Express backend. Entry `server/index.js`. Uses Mongoose to talk to MongoDB and contains route modules in `server/routes/` and models in `server/models/`.
- `python/` — Small Flask service implementing the KNN-style recommender. Files:
  - `app.py` — Flask API with `/recommend/<question_id>` and `/reload` endpoints.
  - `recommender.py` — KNN-style recommender (Jaccard on tags).
  - `requirements.txt` — Python dependencies.
  - `README.md` — quick guide for the python service.

## Key components & how they interact

1. Frontend requests question details from the Express backend at `/api/questions/:id`.
2. Backend returns the question document (including `tags`), and also exposes `/api/questions/:id/related` to fetch related questions using a simple tag/category match.
3. Additionally (new), the frontend can query the Python recommender service at `/recommend/:id?n=3` to get top-k similar questions using a KNN-like approach over tags.
4. The frontend renders recommended questions using the existing `RelatedQuestions` component.

## Data model (MongoDB)

The main schemas (see `server/models`):

- `Question` (`server/models/Question.js`):

  - Fields: `category` (enum), `problem` (text), `leetcodeLink`, `difficulty` (Easy/Medium/Hard), `tags` (array of strings), `description`, `examples`, `constraints`, `bruteForce`, `optimal`, `createdAt`.
  - Full-text index on `problem` and `description` for search.

- `User` (`server/models/User.js`): stores user profile, auth provider, hashed password, admin flag and tokens.

- `UserProgress` (`server/models/UserProgress.js`): per-user per-question progress with `status` (solved/attempted/unsolved), starred flag and attempts array.

## How to run locally

Prerequisites

- Node.js (v16+ recommended)
- Python 3.10+ and pip
- MongoDB running locally or accessible via URI

1. Start MongoDB (local or remote) and ensure you have a `questions` collection populated. The server seeds an admin user on startup.

2. Backend (Express)

```powershell
cd server
npm install
# set env MONGODB_URI in .env (or rely on default mongodb://127.0.0.1:27017/dsa01)
npm run dev
```

Default: server listens on PORT env or 5000.

3. Frontend (Vite)

```powershell
cd frontend
npm install
npm run dev
```

Default Vite dev server runs on http://localhost:5173.

4. Python recommender microservice

```powershell
cd python
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# copy .env if you want to override defaults (python/.env example exists inside python/)
python app.py
```

Default: recommender runs on port 8000 (see `python/app.py`). It loads all documents in the configured `questions` collection at startup.

Important ports summary

- Frontend: 5173
- Backend (Express): 5000 (default) — env: PORT
- Recommender (Flask): 8000 (default) — env: PORT

If your deployment uses different ports, update the frontend code for the recommender URL (see below) or proxy requests.

## API Summary

Backend (Express) highlights (see `server/routes`):

- `GET /api/questions` — list questions (filters: category, difficulty, tags, search, pagination).
- `GET /api/questions/:id` — get single question.
- `GET /api/questions/:id/related` — built-in related finder (tag/category/difficulty scoring).
- Auth and progress endpoints available under `/api/auth` and `/api/progress`.

Python recommender endpoints (Flask):

- `GET /recommend/<question_id>?n=3` — returns top-n recommendations ordered by Jaccard similarity over tags.
  Response format:
  ```json
  {"recommendations": [ {"_id":"...","problem":"...","tags":[],"matchingTags":[],"difficulty":"...","category":"...","relevanceScore":0.5}, ... ] }
  ```
- `POST /reload` — reloads in-memory index from MongoDB (useful after changes to questions/tags).

## How the recommender works (algorithm details)

- The Python recommender reads all questions and builds a tag set per question.
- Similarity metric: Jaccard similarity between two questions' tag sets (|A∩B| / |A∪B|).
- KNN-style: for a queried question ID, it computes Jaccard similarities to all other questions and returns the top-k.
- Score range: 0.0 (no shared tags) to 1.0 (identical tag sets).

This is intentionally simple and explainable — good for beginners and lightweight deployment.

## Frontend integration (what changed)

- `frontend/src/pages/QuestionDetail.jsx` was updated to call the recommender service at `http://localhost:8000/recommend/:id?n=3` after it loads the question details. If the existing server-provided `/api/questions/:id/related` returns results, the app still prefers that; otherwise it falls back to the recommender results.
- Recommendations are displayed using the existing `RelatedQuestions` component. Each recommended item contains `matchingTags` (tags matched to the current question) and `relevanceScore`.

If you want to always prefer the Python recommender, adjust the rendering logic in `QuestionDetail.jsx`.

## Troubleshooting

- If recommender returns 404 for a question id, ensure the id matches the `_id` stored in MongoDB (ObjectId string).
- If the recommender returns no recommendations, confirm the question has tags and other questions share tags.
- Mongo connection errors: verify `MONGO_URI` env var in `python/.env` or system env.

## Next steps and improvements

- Scale: For >10k documents, replace brute-force similarity with an inverted index by tag or an ANN library.
- Weighting: combine Jaccard with category/difficulty heuristics (e.g., same category gets +score).
- UI: show reasons for recommendation (matchingTags highlighted) — already available as `matchingTags`.
- Endpoint security: place recommender behind internal network or add rate limits/auth if exposed publicly.

---

If you want, I can:

- Start the recommender and show a live demo using data from your MongoDB.
- Add a simple test script to call `/recommend` for a few sample IDs.
- Add a lightweight Dockerfile for the Python service for easier deployment.

Tell me which of these you'd like next.
