const express = require("express");
const { body } = require("express-validator");

const {
  createCounselingRequest,
  getAllCounselingRequests,
  updateCounselingRequest,
} = require("../controllers/counseling.controller");

const authMiddleware = require("../middleware/auth.middleware");
const { counselingLimiter } = require("../middleware/rateLimiter.middleware");

const router = express.Router();

router.post(
  "/counseling-requests",
  counselingLimiter,
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("goal").notEmpty(),
  ],
  createCounselingRequest
);

router.get("/admin/counseling", authMiddleware, getAllCounselingRequests);
router.put(
  "/admin/counseling/:id",  authMiddleware,
  updateCounselingRequest
);

module.exports = router;
