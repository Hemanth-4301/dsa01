import express from "express"
import jwt from "jsonwebtoken"
import { body, validationResult } from "express-validator"
import rateLimit from "express-rate-limit"
import User from "../models/User.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: {
      message: "Too many authentication attempts, please try again later",
      code: "RATE_LIMIT_EXCEEDED",
    },
  },
})

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" })

  const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" })

  return { accessToken, refreshToken }
}

// Register
router.post(
  "/signup",
  [
    authLimiter,
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("name").trim().isLength({ min: 1, max: 50 }),
  ],
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

      const { email, password, name } = req.body

      // Check if user exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({
          error: {
            message: "User already exists",
            code: "USER_EXISTS",
          },
        })
      }

      // Create user
      const user = new User({
        email,
        password,
        name,
        authProvider: "email",
      })

      await user.save()

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id)

      // Save refresh token
      user.refreshToken = refreshToken
      await user.save()

      res.status(201).json({
        message: "User created successfully",
        user,
        accessToken,
        refreshToken,
      })
    } catch (error) {
      console.error("Signup error:", error)
      res.status(500).json({
        error: {
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        },
      })
    }
  },
)

// Login
router.post(
  "/login",
  [authLimiter, body("email").isEmail().normalizeEmail(), body("password").exists()],
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

      // Find user
      const user = await User.findOne({ email, authProvider: "email" })
      if (!user || !user.isActive) {
        return res.status(401).json({
          error: {
            message: "Invalid credentials",
            code: "INVALID_CREDENTIALS",
          },
        })
      }

      // Check password
      const isValidPassword = await user.comparePassword(password)
      if (!isValidPassword) {
        return res.status(401).json({
          error: {
            message: "Invalid credentials",
            code: "INVALID_CREDENTIALS",
          },
        })
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id)

      // Save refresh token
      user.refreshToken = refreshToken
      await user.save()

      res.json({
        message: "Login successful",
        user,
        accessToken,
        refreshToken,
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({
        error: {
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        },
      })
    }
  },
)

// Refresh token
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        error: {
          message: "Refresh token required",
          code: "UNAUTHORIZED",
        },
      })
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)

    if (!user || user.refreshToken !== refreshToken || !user.isActive) {
      return res.status(403).json({
        error: {
          message: "Invalid refresh token",
          code: "FORBIDDEN",
        },
      })
    }

    // Generate new tokens
    const tokens = generateTokens(user._id)

    // Update refresh token
    user.refreshToken = tokens.refreshToken
    await user.save()

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    })
  } catch (error) {
    console.error("Refresh token error:", error)
    res.status(403).json({
      error: {
        message: "Invalid refresh token",
        code: "FORBIDDEN",
      },
    })
  }
})

// Get current user
router.get("/user", authenticateToken, (req, res) => {
  res.json({ user: req.user })
})

// Logout
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    user.refreshToken = null
    await user.save()

    res.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({
      error: {
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      },
    })
  }
})

export default router
