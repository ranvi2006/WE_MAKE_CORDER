const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Otp = require("../models/Otp");
const { sendOtpEmail } = require("../utils/emailService");
const { rateLimit } = require("express-rate-limit");

const router = express.Router();

// Rate limiter for OTP requests (prevent abuse)
const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Max 3 requests per 15 minutes
  message: "Too many OTP requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for resend OTP (cooldown period)
const resendOtpRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1, // Max 1 request per minute
  message: "Please wait before requesting a new OTP.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * CHECK EMAIL
 * POST /api/users/auth/check-email
 */
router.post("/check-email", async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    res.status(200).json({
      message: "Email is available",
      available: true,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * SEND OTP (BACKEND ONLY - Generates and sends OTP)
 * POST /api/users/auth/send-otp
 */
router.post(
  "/send-otp",
  otpRateLimiter,
  [body("email").isEmail().normalizeEmail().withMessage("Invalid email")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      // Check if email already exists
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({
          message: "Email already registered",
        });
      }

      // Generate secure 6-digit numeric OTP (BACKEND ONLY)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Delete any existing unused OTP for this email
      await Otp.deleteMany({ email: normalizedEmail, used: false });

      // Create new OTP with 5-minute expiration
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      await Otp.create({
        email: normalizedEmail,
        otp,
        expiresAt,
        lastSentAt: new Date(),
      });

      // Send OTP email (BACKEND ONLY)
      try {
        await sendOtpEmail(normalizedEmail, otp);
      } catch (emailError) {
        console.error("Failed to send OTP email:", emailError);
        // Delete the OTP if email sending fails
        await Otp.deleteOne({ email: normalizedEmail, otp });
        return res.status(500).json({
          message: "Failed to send OTP email. Please try again.",
        });
      }

      res.status(200).json({
        message: "OTP sent successfully to your email",
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * VERIFY OTP (BACKEND ONLY - Verifies OTP and marks email as verified)
 * POST /api/users/auth/verify-otp
 */
router.post(
  "/verify-otp",
  [
    body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .matches(/^\d+$/)
      .withMessage("OTP must be 6 digits"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, otp } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      // Find OTP record
      const otpRecord = await Otp.findOne({
        email: normalizedEmail,
        otp,
        used: false,
      });

      if (!otpRecord) {
        return res.status(400).json({
          message: "Invalid OTP",
        });
      }

      // Check if OTP expired
      if (new Date() > otpRecord.expiresAt) {
        await Otp.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({
          message: "OTP has expired. Please request a new one.",
        });
      }

      // Mark OTP as used and verified
      otpRecord.used = true;
      otpRecord.verified = true;
      await otpRecord.save();

      res.status(200).json({
        message: "OTP verified successfully",
        verified: true,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * RESEND OTP (BACKEND ONLY - Generates new OTP and sends email)
 * POST /api/users/auth/resend-otp
 */
router.post(
  "/resend-otp",
  resendOtpRateLimiter,
  [body("email").isEmail().normalizeEmail().withMessage("Invalid email")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      // Check if email already exists
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({
          message: "Email already registered",
        });
      }

      // Delete old OTP for this email
      await Otp.deleteMany({ email: normalizedEmail });

      // Generate new secure 6-digit numeric OTP (BACKEND ONLY)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Create new OTP with 5-minute expiration
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      await Otp.create({
        email: normalizedEmail,
        otp,
        expiresAt,
        lastSentAt: new Date(),
      });

      // Send new OTP email (BACKEND ONLY)
      try {
        await sendOtpEmail(normalizedEmail, otp);
      } catch (emailError) {
        console.error("Failed to send OTP email:", emailError);
        // Delete the OTP if email sending fails
        await Otp.deleteOne({ email: normalizedEmail, otp });
        return res.status(500).json({
          message: "Failed to send OTP email. Please try again.",
        });
      }

      res.status(200).json({
        message: "New OTP sent successfully to your email",
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * COMPLETE REGISTRATION (After OTP verification)
 * POST /api/users/auth/register
 */
router.post(
  "/register",
  [
    body("name").notEmpty().trim().withMessage("Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
    body("phone")
      .isLength({ min: 10, max: 10 })
      .matches(/^\d+$/)
      .withMessage("Phone must be exactly 10 digits"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { name, email, phone, password } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({
          message: "Email already registered",
        });
      }

      const existingUserByPhone = await User.findOne({ phone });
      if (existingUserByPhone) {
        return res.status(400).json({
          message: "Phone number already registered",
        });
      }

      // Verify that OTP was verified for this email
      const verifiedOtp = await Otp.findOne({
        email: normalizedEmail,
        verified: true,
        used: true,
      });

      if (!verifiedOtp) {
        return res.status(400).json({
          message: "Email not verified. Please verify OTP first.",
        });
      }

      // Hash password (BACKEND ONLY)
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone,
      });

      // Delete verified OTP after successful registration
      await Otp.deleteOne({ _id: verifiedOtp._id });

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user._id,
          role: "user",
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: "user",
        },
        message: "Thank you, your account has been created successfully!",
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * USER LOGIN
 * POST /api/users/auth/login
 */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: "user",
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
