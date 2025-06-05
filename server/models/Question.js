import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: [
      "arrays",
      "string",
      "dynamic-programming-1d",
      "dynamic-programming-2d",
      "trees",
      "graphs",
      "linked-list",
      "two-pointer",
      "sliding-window",
      "binary-search",
      "backtracking",
      "greedy",
      "heap",
      "stack",
      "trie",
      "bit-manipulation",
      "miscellaneous",
    ],
    required: true,
    index: true,
  },
  problem: {
    type: String,
    required: true,
    index: "text",
  },
  leetcodeLink: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
    index: true,
  },
  tags: [
    {
      type: String,
      index: true,
    },
  ],
  description: {
    type: String,
    required: true,
  },
  examples: [
    {
      input: String,
      output: String,
      explanation: String,
    },
  ],
  constraints: [String],
  bruteForce: {
    code: {
      java: String,
      python: String,
      cpp: String,
    },
    complexity: {
      time: String,
      space: String,
    },
    explanation: String,
  },
  optimal: {
    code: {
      java: String,
      python: String,
      cpp: String,
    },
    complexity: {
      time: String,
      space: String,
    },
    explanation: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Text index for search
questionSchema.index({ problem: "text", description: "text" });

export default mongoose.model("Question", questionSchema);
