const express = require("express");
const { body } = require("express-validator");

const authMiddleware = require("../middleware/auth.middleware");
const { publicFormLimiter } = require("../middleware/rateLimiter.middleware");
const {
  createCounselingRequest,
  getAllCounselingRequests,
  updateCounselingRequest,
} = require("../controllers/counseling.controller");

const router = express.Router();

/**
 * PUBLIC: Create counseling request (rate limited)
 * POST /api/counseling-requests
 */
router.post(
  "/counseling-requests",
  publicFormLimiter,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("goal").notEmpty().withMessage("Goal is required"),
    body("message").notEmpty().withMessage("Message is required"),
  ],
  createCounselingRequest
);

/**
 * ADMIN: Get all counseling requests (protected)
 * GET /api/admin/counseling
 */
router.get(
  "/admin/counseling",
  authMiddleware,
  getAllCounselingRequests
);

/**
 * ADMIN: Update counseling request (protected)
 * PUT /api/admin/counseling/:id
 */
router.put(
  "/admin/counseling/:id",
  authMiddleware,
  [
    body("status")
      .optional()
      .isIn(["Pending", "In Progress", "Completed", "Rejected"])
      .withMessage("Invalid status"),
    body("notes").optional().isString(),
  ],
  updateCounselingRequest
);

module.exports = router;
