const express = require("express");
const {
  registerAdmin,
  loginAdmin,
  getAdminStats,
} = require("../controllers/admin.controller");

const authMiddleware = require("../middleware/auth.middleware");
const { loginLimiter } = require("../middleware/rateLimiter.middleware");

const router = express.Router();

// Public
router.post("/login", loginLimiter, loginAdmin);

// Optional: remove in production
router.post("/register", registerAdmin);

// Protected (ALL admin routes)
router.use(authMiddleware);

router.get("/stats", getAdminStats);

module.exports = router;
