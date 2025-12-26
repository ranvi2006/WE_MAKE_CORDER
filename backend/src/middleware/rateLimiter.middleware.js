const rateLimit = require("express-rate-limit");

/**
 * Admin login rate limiter
 * Prevents brute-force attacks
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again later.",
  },
});

/**
 * Counseling request limiter
 */
const counselingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many counseling requests. Please try again later.",
  },
});

/**
 * Interview practice request limiter
 */
const interviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many interview practice requests. Please try again later.",
  },
});

module.exports = {
  loginLimiter,
  counselingLimiter,
  interviewLimiter,
};
