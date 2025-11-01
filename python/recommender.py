from typing import List, Dict, Any, Set


def _normalize_tag(tag: str) -> str:
    return tag.strip().lower()


class KNNRecommender:
    """Very small, beginner-friendly KNN-style recommender over tag vectors.

    - Builds a tag vocabulary and binary vectors per question (1 if tag present).
    - Uses Jaccard similarity as the distance metric (1 - Jaccard) to find nearest
      neighbours (higher Jaccard => more similar).
    - No external ML libraries required.

    Expects docs with at least '_id' and 'tags' fields.
    """

    def __init__(self):
        # store originals
        self._docs: Dict[str, Dict[str, Any]] = {}
        # tag sets per question id
        self._tagsets: Dict[str, Set[str]] = {}
        # global tag vocabulary (set)
        self._vocab: Set[str] = set()

    def fit(self, docs: List[Dict[str, Any]]):
        """Load and index docs. This is fast for modest collections.

        docs: list of mongo-like documents. Each doc should contain '_id' and 'tags'.
        """
        self._docs = {}
        self._tagsets = {}
        self._vocab = set()

        for doc in docs:
            _id = doc.get("_id")
            if _id is None:
                continue
            key = str(_id)
            raw_tags = doc.get("tags") or []
            tags = { _normalize_tag(t) for t in raw_tags if isinstance(t, str) }
            self._docs[key] = doc
            self._tagsets[key] = tags
            self._vocab.update(tags)

    def _jaccard(self, a: Set[str], b: Set[str]) -> float:
        if not a and not b:
            return 0.0
        inter = a.intersection(b)
        union = a.union(b)
        return float(len(inter)) / float(len(union)) if union else 0.0

    def recommend(self, question_id: str, k: int = 3) -> List[Dict[str, Any]]:
        """Return top-k neighbours as a list of dicts with score and metadata.

        Score is the Jaccard similarity (0..1). Higher means more similar.
        """
        qid = str(question_id)
        if qid not in self._tagsets:
            return []

        q_tags = self._tagsets[qid]
        if not q_tags:
            # no tags -> nothing to recommend
            return []

        neighbors = []
        for other_id, other_tags in self._tagsets.items():
            if other_id == qid:
                continue
            score = self._jaccard(q_tags, other_tags)
            if score <= 0:
                continue
            doc = self._docs.get(other_id, {})
            neighbors.append({
                "_id": other_id,
                "problem": doc.get("problem") or doc.get("title") or "",
                "tags": list(other_tags),
                "score": round(score, 4),
            })

        # KNN: sort by similarity descending and return top-k
        neighbors.sort(key=lambda x: (-x["score"], x["problem"]))
        return neighbors[:k]


# provide a default class name for backwards compatibility
Recommender = KNNRecommender

