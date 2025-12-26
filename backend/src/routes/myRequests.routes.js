const express = require("express");
const { query } = require("express-validator");
const { validationResult } = require("express-validator");

const {
  getMyRequests,
} = require("../controllers/myRequests.controller");

const router = express.Router();

/**
 * GET /api/my-requests
 */
router.get(
  "/my-requests",
  [
    query("email")
      .isEmail()
      .withMessage("Valid email is required"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  getMyRequests
);

module.exports = router;
