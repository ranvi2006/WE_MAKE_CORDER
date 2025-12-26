const express = require("express");
const { body } = require("express-validator");

const authMiddleware = require("../middleware/auth.middleware");
const { publicFormLimiter } = require("../middleware/rateLimiter.middleware");
const {
  createInterviewPracticeRequest,
  getAllInterviewPracticeRequests,
  updateInterviewPracticeRequest,
} = require("../controllers/interviewPractice.controller");

const router = express.Router();

/**
 * PUBLIC: Create interview practice request (rate limited)
 * POST /api/interview-practice-requests
 */
router.post(
  "/interview-practice-requests",
  publicFormLimiter,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("role").notEmpty().withMessage("Role is required"),
    body("experience").notEmpty().withMessage("Experience is required"),
    body("availability").notEmpty().withMessage("Availability is required"),
  ],
  createInterviewPracticeRequest
);

/**
 * ADMIN: Get all interview practice requests (protected)
 * GET /api/admin/interview-practice
 */
router.get(
  "/admin/interview-practice",
  authMiddleware,
  getAllInterviewPracticeRequests
);

/**
 * ADMIN: Update interview practice request (protected)
 * PUT /api/admin/interview-practice/:id
 */
router.put(
  "/admin/interview-practice/:id",
  authMiddleware,
  [
    body("status")
      .optional()
      .isIn(["Pending", "Scheduled", "Completed", "Cancelled"])
      .withMessage("Invalid status"),
    body("meetingTime")
      .optional()
      .isISO8601()
      .withMessage("Invalid meeting time"),
    body("meetingLink")
      .optional()
      .isURL()
      .withMessage("Invalid meeting link"),
  ],
  updateInterviewPracticeRequest
);

module.exports = router;
