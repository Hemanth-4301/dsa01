import express from "express"
import UserProgress from "../models/UserProgress.js"
import Question from "../models/Question.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Get user's progress
router.get("/", async (req, res) => {
  try {
    const progress = await UserProgress.find({ userId: req.user._id })
      .populate("questionId", "problem category difficulty tags")
      .sort({ lastAttempted: -1 })

    // Calculate stats
    const stats = await UserProgress.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalSolved: {
            $sum: { $cond: [{ $eq: ["$status", "solved"] }, 1, 0] },
          },
          totalAttempted: {
            $sum: { $cond: [{ $eq: ["$status", "attempted"] }, 1, 0] },
          },
          totalStarred: {
            $sum: { $cond: ["$starred", 1, 0] },
          },
        },
      },
    ])

    // Category-wise progress
    const categoryProgress = await UserProgress.aggregate([
      { $match: { userId: req.user._id } },
      {
        $lookup: {
          from: "questions",
          localField: "questionId",
          foreignField: "_id",
          as: "question",
        },
      },
      { $unwind: "$question" },
      {
        $group: {
          _id: "$question.category",
          solved: {
            $sum: { $cond: [{ $eq: ["$status", "solved"] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
    ])

    res.json({
      progress,
      stats: stats[0] || { totalSolved: 0, totalAttempted: 0, totalStarred: 0 },
      categoryProgress,
    })
  } catch (error) {
    console.error("Get progress error:", error)
    res.status(500).json({
      error: {
        message: "Failed to fetch progress",
        code: "FETCH_ERROR",
      },
    })
  }
})

// Update question progress
router.patch("/:questionId", async (req, res) => {
  try {
    const { questionId } = req.params
    const { status, starred } = req.body

    // Validate question exists
    const question = await Question.findById(questionId)
    if (!question) {
      return res.status(404).json({
        error: {
          message: "Question not found",
          code: "NOT_FOUND",
        },
      })
    }

    // Find or create progress record
    let progress = await UserProgress.findOne({
      userId: req.user._id,
      questionId,
    })

    if (!progress) {
      progress = new UserProgress({
        userId: req.user._id,
        questionId,
      })
    }

    // Update fields
    if (status !== undefined) {
      progress.status = status
      progress.lastAttempted = new Date()

      // Add to attempts history
      progress.attempts.push({
        status: status === "solved" ? "solved" : "attempted",
        timestamp: new Date(),
      })
    }

    if (starred !== undefined) {
      progress.starred = starred
    }

    await progress.save()

    // Populate question data for response
    await progress.populate("questionId", "problem category difficulty")

    res.json({
      message: "Progress updated successfully",
      progress,
    })
  } catch (error) {
    console.error("Update progress error:", error)
    res.status(500).json({
      error: {
        message: "Failed to update progress",
        code: "UPDATE_ERROR",
      },
    })
  }
})

// Get starred questions
router.get("/starred", async (req, res) => {
  try {
    const starredProgress = await UserProgress.find({
      userId: req.user._id,
      starred: true,
    })
      .populate("questionId", "problem category difficulty tags leetcodeLink")
      .sort({ lastAttempted: -1 })

    res.json({ starred: starredProgress })
  } catch (error) {
    console.error("Get starred error:", error)
    res.status(500).json({
      error: {
        message: "Failed to fetch starred questions",
        code: "FETCH_ERROR",
      },
    })
  }
})

export default router
