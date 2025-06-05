import express from "express"
import { body, validationResult } from "express-validator"
import rateLimit from "express-rate-limit"
import User from "../models/User.js"
import Question from "../models/Question.js"
import UserProgress from "../models/UserProgress.js"
import AdminLog from "../models/AdminLog.js"
import { authenticateToken, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

// Rate limiting for admin login
const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    error: {
      message: "Too many admin login attempts, please try again later",
      code: "RATE_LIMIT_EXCEEDED",
    },
  },
})

// Admin login (separate from regular auth)
router.post(
  "/login",
  [adminAuthLimiter, body("email").isEmail().normalizeEmail(), body("password").exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            details: errors.array(),
          },
        })
      }

      const { email, password } = req.body

      // Find admin user
      const user = await User.findOne({
        email,
        authProvider: "email",
        isAdmin: true,
        isActive: true,
      })

      if (!user) {
        return res.status(401).json({
          error: {
            message: "Invalid admin credentials",
            code: "INVALID_CREDENTIALS",
          },
        })
      }

      // Check password
      const isValidPassword = await user.comparePassword(password)
      if (!isValidPassword) {
        return res.status(401).json({
          error: {
            message: "Invalid admin credentials",
            code: "INVALID_CREDENTIALS",
          },
        })
      }

      // Generate tokens (same as regular auth)
      const jwt = await import("jsonwebtoken")
      const accessToken = jwt.default.sign({ userId: user._id, role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "15m",
      })

      const refreshToken = jwt.default.sign({ userId: user._id, role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      })

      // Save refresh token
      user.refreshToken = refreshToken
      await user.save()

      // Log admin login
      await AdminLog.create({
        adminId: user._id,
        action: "login",
        details: `Admin login from IP: ${req.ip}`,
      })

      res.json({
        message: "Admin login successful",
        user,
        accessToken,
        refreshToken,
      })
    } catch (error) {
      console.error("Admin login error:", error)
      res.status(500).json({
        error: {
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        },
      })
    }
  },
)

// All other routes require admin authentication
router.use(authenticateToken)
router.use(requireAdmin)

// Get all users
router.get("/users", async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query

    // Build query
    const query = {}
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const users = await User.find(query)
      .select("-password -refreshToken")
      .skip(skip)
      .limit(Number.parseInt(limit))
      .sort({ createdAt: -1 })

    const total = await User.countDocuments(query)

    res.json({
      users,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / Number.parseInt(limit)),
        total,
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({
      error: {
        message: "Failed to fetch users",
        code: "FETCH_ERROR",
      },
    })
  }
})

// Get user progress
router.get("/users/:id/progress", async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findById(id).select("-password -refreshToken")
    if (!user) {
      return res.status(404).json({
        error: {
          message: "User not found",
          code: "NOT_FOUND",
        },
      })
    }

    const progress = await UserProgress.find({ userId: id })
      .populate("questionId", "problem category difficulty")
      .sort({ lastAttempted: -1 })

    // Calculate stats
    const stats = await UserProgress.aggregate([
      { $match: { userId: user._id } },
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

    res.json({
      user,
      progress,
      stats: stats[0] || { totalSolved: 0, totalAttempted: 0, totalStarred: 0 },
    })
  } catch (error) {
    console.error("Get user progress error:", error)
    res.status(500).json({
      error: {
        message: "Failed to fetch user progress",
        code: "FETCH_ERROR",
      },
    })
  }
})

// Update user status
router.patch("/users/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({
        error: {
          message: "User not found",
          code: "NOT_FOUND",
        },
      })
    }

    // Prevent deactivating the main admin
    if (user.email === process.env.ADMIN_EMAIL && isActive === false) {
      return res.status(400).json({
        error: {
          message: "Cannot deactivate main admin account",
          code: "FORBIDDEN_ACTION",
        },
      })
    }

    user.isActive = isActive
    await user.save()

    // Log admin action
    await AdminLog.create({
      adminId: req.user._id,
      action: isActive ? "activate_user" : "deactivate_user",
      details: `${isActive ? "Activated" : "Deactivated"} user: ${user.email}`,
    })

    res.json({
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user: user.toJSON(),
    })
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({
      error: {
        message: "Failed to update user",
        code: "UPDATE_ERROR",
      },
    })
  }
})

// Get platform analytics
router.get("/analytics", async (req, res) => {
  try {
    // Basic stats
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ isActive: true })
    const totalQuestions = await Question.countDocuments()

    // User registration over time (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const userRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // Category popularity
    const categoryStats = await UserProgress.aggregate([
      { $match: { status: "solved" } },
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
          solvedCount: { $sum: 1 },
        },
      },
      { $sort: { solvedCount: -1 } },
    ])

    // Top performers
    const topPerformers = await UserProgress.aggregate([
      { $match: { status: "solved" } },
      {
        $group: {
          _id: "$userId",
          solvedCount: { $sum: 1 },
        },
      },
      { $sort: { solvedCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          name: "$user.name",
          email: "$user.email",
          solvedCount: 1,
        },
      },
    ])

    res.json({
      overview: {
        totalUsers,
        activeUsers,
        totalQuestions,
      },
      userRegistrations,
      categoryStats,
      topPerformers,
    })
  } catch (error) {
    console.error("Get analytics error:", error)
    res.status(500).json({
      error: {
        message: "Failed to fetch analytics",
        code: "FETCH_ERROR",
      },
    })
  }
})

export default router
