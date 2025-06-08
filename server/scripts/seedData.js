import User from "../models/User.js";
import Question from "../models/Question.js";
import { arrayQuestions } from "./data/arrays.js";
import { twoPointerQuestions } from "./data/twoPointer.js";
import { slidingWindowQuestions } from "./data/slidingWindow.js";
import { binarySearchQuestions } from "./data/binarySearch.js";
import { linkedListQuestions } from "./data/linkedList.js";
import { stringsQuestions } from "./data/string.js";
import { heapQuestions } from "./data/heap.js";
import { stackQuestions } from "./data/stack.js";
import { backtrackingQuestions } from "./data/backtracking.js";
import { dp1dQuestions } from "./data/dp1.js";
import { dp2dQuestions } from "./data/dp2.js";
import { treeQuestions } from "./data/tree.js";
import { graphQuestions } from "./data/graph.js";
import { bitQuestions } from "./data/bit.js";
import { trieQuestions } from "./data/trie.js";
import { greedyQuestions } from "./data/greedy.js";
import { matrixQuestions } from "./data/matrix.js";

export const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";
    await seedQuestions();

    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        email: adminEmail,
        name: "Admin User",
        password: adminPassword,
        authProvider: "email",
        isAdmin: true,
        isActive: true,
      });
      console.log(`Admin user created: ${adminEmail}`);
    }
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
};

export const seedQuestions = async () => {
  try {
    const questionCount = await Question.countDocuments();
    if (questionCount > 0) {
      console.log("Questions already exist, skipping seed");
      return;
    }
    const sampleQuestions = [
      ...arrayQuestions,
      ...twoPointerQuestions,
      ...slidingWindowQuestions,
      ...binarySearchQuestions,
      ...linkedListQuestions,
      ...stringsQuestions,
      ...stackQuestions,
      ...heapQuestions,
      ...backtrackingQuestions,
      ...treeQuestions,
      ...graphQuestions,
      ...bitQuestions,
      ...trieQuestions,
      ...greedyQuestions,
      ...matrixQuestions,
      ...dp1dQuestions,
      ...dp2dQuestions,
    ];

    await Question.insertMany(sampleQuestions);
    console.log(`Seeded ${sampleQuestions.length} questions`);
  } catch (error) {
    console.error("Error seeding questions:", error);
  }
};
