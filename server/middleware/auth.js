import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({
        error: {
          message: "Access token required",
          code: "UNAUTHORIZED",
        },
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select("-password -refreshToken")

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: {
          message: "Invalid token or user deactivated",
          code: "UNAUTHORIZED",
        },
      })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(403).json({
      error: {
        message: "Invalid or expired token",
        code: "FORBIDDEN",
      },
    })
  }
}

export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      error: {
        message: "Admin access required",
        code: "FORBIDDEN",
      },
    })
  }
  next()
}
