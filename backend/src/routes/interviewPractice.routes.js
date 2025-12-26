const express = require("express");
const multer = require("multer");
const { body, validationResult } = require("express-validator");

const InterviewPracticeRequest = require("../models/InterviewPracticeRequest");
const authMiddleware = require("../middleware/auth.middleware");
const { interviewLimiter } = require("../middleware/rateLimiter.middleware");

const router = express.Router();

/* ================================
   MULTER CONFIG (PDF ONLY)
================================ */
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
});

/* ================================
   PUBLIC: CREATE REQUEST
   POST /api/interview-practice-requests
================================ */
router.post(
  "/interview-practice-requests",
  interviewLimiter,
  upload.single("resume"),
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("role").notEmpty(),
    body("experience").optional(),
    body("availability").optional(),
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

      const {
        name,
        email,
        role,
        experience,
        availability,
      } = req.body;

      const request = await InterviewPracticeRequest.create({
        name,
        email,
        role,
        experience,
        availability,
        resume: req.file
          ? {
              buffer: req.file.buffer,
              filename: req.file.originalname,
              mimetype: req.file.mimetype,
            }
          : null,
      });

      res.status(201).json({
        message: "Interview practice request submitted",
        id: request._id,
      });
    } catch (error) {
      next(error);
    }
  }
);

/* ================================
   ADMIN: GET ALL REQUESTS
   GET /api/admin/interview-practice
================================ */
router.get(
  "/admin/interview-practice",
  authMiddleware,
  async (req, res, next) => {
    try {
      const items = await InterviewPracticeRequest.find()
        .sort({ createdAt: -1 });

      res.status(200).json(items);
    } catch (error) {
      next(error);
    }
  }
);

/* ================================
   ADMIN: UPDATE REQUEST
   PUT /api/admin/interview-practice/:id
================================ */
router.put(
  "/admin/interview-practice/:id",
  authMiddleware,
  async (req, res, next) => {
    try {
      const { status, meetingDateTime, meetingLink } = req.body;

      const updated = await InterviewPracticeRequest.findByIdAndUpdate(
        req.params.id,
        {
          status,
          meetingDateTime,
          meetingLink,
        },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({
          message: "Interview request not found",
        });
      }

      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
