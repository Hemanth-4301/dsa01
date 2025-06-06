import express from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import crypto from "crypto";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error: {
      message: "Too many authentication attempts, please try again later",
      code: "RATE_LIMIT_EXCEEDED",
    },
  },
});

// OTP rate limiting
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,
  message: {
    error: {
      message: "Too many OTP attempts, please try again later",
      code: "OTP_RATE_LIMIT_EXCEEDED",
    },
  },
});

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

// Generate OTP
const generateOTP = () => {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};

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
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            details: errors.array(),
          },
        });
      }

      const { email, password, name } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          error: {
            message: "User already exists",
            code: "USER_EXISTS",
          },
        });
      }

      // Generate OTP
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      const user = new User({
        email,
        password,
        name,
        authProvider: "email",
        isVerified: false,
        otp,
        otpExpires,
      });

      await user.save();

      // Send OTP email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify Your Email Address(dsa01)",
        html: `
          <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
  <!-- Header with gradient -->
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Welcome to dsa01, ${name}!</h1>
  </div>
  
  <!-- Content area -->
  <div style="padding: 30px 20px; background: #ffffff; line-height: 1.6; color: #333;">
    <p style="font-size: 16px; margin-bottom: 25px;">Thank you for joining us! Please use the following otp to verify:</p>
    
    <!-- OTP Display Card -->
    <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 0 4px 4px 0;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">Your One-Time Password</p>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2 style="margin: 0; font-size: 28px; letter-spacing: 3px; color: #222;">${otp}</h2>
      </div>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-bottom: 25px;">
      <svg style="vertical-align: middle; margin-right: 6px;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      This OTP is valid for <strong>24 hours</strong>. Please don't share it with anyone.
    </p>
    
    <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
      <p style="font-size: 13px; color: #888; margin-bottom: 5px;">Didn't request this email?</p>
      <p style="font-size: 13px; color: #888; margin: 0;">You can safely ignore it. Your account is secure.</p>
    </div>
  </div>
  
  <!-- Footer -->
  <div style="background: #f8f9fa; padding: 15px 20px; text-align: center; font-size: 12px; color: #888;">
    <p style="margin: 0;">© ${new Date().getFullYear()} Our Platform. All rights reserved.</p>
  </div>
</div>
        `,
      };

      await transporter.sendMail(mailOptions);

      res.status(201).json({
        message:
          "User created successfully. Please verify your email with the OTP sent.This email might be there in spam folder please checkout there once",
        userId: user._id,
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({
        error: {
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        },
      });
    }
  }
);

// Verify OTP
router.post(
  "/verify-otp",
  [
    otpLimiter,
    body("userId").isMongoId(),
    body("otp").isLength({ min: 6, max: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            details: errors.array(),
          },
        });
      }

      const { userId, otp } = req.body;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          error: {
            message: "User not found",
            code: "USER_NOT_FOUND",
          },
        });
      }

      if (user.isVerified) {
        return res.status(400).json({
          error: {
            message: "User already verified",
            code: "ALREADY_VERIFIED",
          },
        });
      }

      if (user.otp !== otp || user.otpExpires < Date.now()) {
        return res.status(400).json({
          error: {
            message: "Invalid or expired OTP",
            code: "INVALID_OTP",
          },
        });
      }

      // Verify user
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpires = undefined;

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id);
      user.refreshToken = refreshToken;
      await user.save();

      res.json({
        message: "Email verified successfully",
        user,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({
        error: {
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        },
      });
    }
  }
);

// Resend OTP
router.post(
  "/resend-otp",
  [otpLimiter, body("userId").isMongoId()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            details: errors.array(),
          },
        });
      }

      const { userId } = req.body;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          error: {
            message: "User not found",
            code: "USER_NOT_FOUND",
          },
        });
      }

      if (user.isVerified) {
        return res.status(400).json({
          error: {
            message: "User already verified",
            code: "ALREADY_VERIFIED",
          },
        });
      }

      // Generate new OTP
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();

      // Send OTP email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Verify Your Email Address",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
            <h2>Welcome to Our Platform, ${user.name}!</h2>
            <p>Please use the following OTP to verify your email address:</p>
            <h3 style="font-size: 24px; color: #333;">${otp}</h3>
            <button onclick="navigator.clipboard.writeText('${otp}'); alert('OTP copied to clipboard!');" 
                    style="background-color: #4CAF50; color: white; padding: 10px 20px; border: none; 
                           border-radius: 5px; cursor: pointer; margin: 10px 0;">
              Copy OTP
            </button>
            <p>This OTP is valid for 24 hours.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);

      res.json({
        message: "New OTP sent successfully",
      });
    } catch (error) {
      console.error("Resend OTP error:", error);
      res.status(500).json({
        error: {
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        },
      });
    }
  }
);

// Login
router.post(
  "/login",
  [
    authLimiter,
    body("email").isEmail().normalizeEmail(),
    body("password").exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            details: errors.array(),
          },
        });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email, authProvider: "email" });
      if (!user || !user.isActive) {
        return res.status(401).json({
          error: {
            message: "Invalid credentials",
            code: "INVALID_CREDENTIALS",
          },
        });
      }

      // Check if user is verified
      if (!user.isVerified) {
        return res.status(403).json({
          error: {
            message: "Please verify your email address first",
            code: "EMAIL_NOT_VERIFIED",
          },
        });
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: {
            message: "Invalid credentials",
            code: "INVALID_CREDENTIALS",
          },
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id);

      // Save refresh token
      user.refreshToken = refreshToken;
      await user.save();

      res.json({
        message: "Login successful",
        user,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        error: {
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        },
      });
    }
  }
);

// Refresh token
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: {
          message: "Refresh token required",
          code: "UNAUTHORIZED",
        },
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (
      !user ||
      user.refreshToken !== refreshToken ||
      !user.isActive ||
      !user.isVerified
    ) {
      return res.status(403).json({
        error: {
          message: "Invalid refresh token",
          code: "FORBIDDEN",
        },
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user._id);

    // Update refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({
      error: {
        message: "Invalid refresh token",
        code: "FORBIDDEN",
      },
    });
  }
});

// Get current user
router.get("/user", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Logout
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.refreshToken = null;
    await user.save();

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      error: {
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      },
    });
  }
});

// Schedule cleanup of unverified accounts
setInterval(async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: twentyFourHoursAgo },
    });
  } catch (error) {
    console.error("Error cleaning up unverified accounts:", error);
  }
}, 24 * 60 * 60 * 1000); // Run daily

export default router;
