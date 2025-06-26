import express from "express";
import Question from "../models/Question.js";

const router = express.Router();

// Get all questions with filtering and pagination
router.get("/", async (req, res) => {
  try {
    const {
      category,
      difficulty,
      tags,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    // Build query
    const query = {};

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (tags) {
      const tagArray = tags.split(",");
      query.tags = { $in: tagArray };
    }
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);

    // Execute query
    const questions = await Question.find(query)
      .select("problem category difficulty tags leetcodeLink")
      .skip(skip)
      .limit(Number.parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Question.countDocuments(query);

    res.json({
      questions,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / Number.parseInt(limit)),
        total,
      },
    });
  } catch (error) {
    console.error("Get questions error:", error);
    res.status(500).json({
      error: {
        message: "Failed to fetch questions",
        code: "FETCH_ERROR",
      },
    });
  }
});

// Get single question
router.get("/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        error: {
          message: "Question not found",
          code: "NOT_FOUND",
        },
      });
    }

    res.json({ question });
  } catch (error) {
    console.error("Get question error:", error);
    res.status(500).json({
      error: {
        message: "Failed to fetch question",
        code: "FETCH_ERROR",
      },
    });
  }
});

// Create a new question
router.post("/", async (req, res) => {
  try {
    const questionData = req.body;

    // Validate required fields
    const requiredFields = [
      "problem",
      "category",
      "difficulty",
      "leetcodeLink",
      "description",
    ];
    for (const field of requiredFields) {
      if (!questionData[field]) {
        return res.status(400).json({
          error: {
            message: `Missing required field: ${field}`,
            code: "VALIDATION_ERROR",
          },
        });
      }
    }

    const question = new Question(questionData);
    await question.save();

    res.status(201).json({
      message: "Question created successfully",
      question,
    });
  } catch (error) {
    console.error("Create question error:", error);
    res.status(500).json({
      error: {
        message: "Failed to create question",
        code: "CREATE_ERROR",
      },
    });
  }
});

// Update a question
router.put("/:id", async (req, res) => {
  try {
    const questionData = req.body;

    // Validate required fields
    const requiredFields = [
      "problem",
      "category",
      "difficulty",
      "leetcodeLink",
      "description",
    ];
    for (const field of requiredFields) {
      if (!questionData[field]) {
        return res.status(400).json({
          error: {
            message: `Missing required field: ${field}`,
            code: "VALIDATION_ERROR",
          },
        });
      }
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { $set: questionData },
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        error: {
          message: "Question not found",
          code: "NOT_FOUND",
        },
      });
    }

    res.json({
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    console.error("Update question error:", error);
    res.status(500).json({
      error: {
        message: "Failed to update question",
        code: "UPDATE_ERROR",
      },
    });
  }
});

// Delete a question
router.delete("/:id", async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        error: {
          message: "Question not found",
          code: "NOT_FOUND",
        },
      });
    }

    res.json({
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Delete question error:", error);
    res.status(500).json({
      error: {
        message: "Failed to delete question",
        code: "DELETE_ERROR",
      },
    });
  }
});

// Get categories with counts
router.get("/stats/categories", async (req, res) => {
  try {
    const categories = await Question.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          difficulties: {
            $push: "$difficulty",
          },
        },
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          easy: {
            $size: {
              $filter: {
                input: "$difficulties",
                cond: { $eq: ["$$this", "Easy"] },
              },
            },
          },
          medium: {
            $size: {
              $filter: {
                input: "$difficulties",
                cond: { $eq: ["$$this", "Medium"] },
              },
            },
          },
          hard: {
            $size: {
              $filter: {
                input: "$difficulties",
                cond: { $eq: ["$$this", "Hard"] },
              },
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      error: {
        message: "Failed to fetch categories",
        code: "FETCH_ERROR",
      },
    });
  }
});

export default router;
