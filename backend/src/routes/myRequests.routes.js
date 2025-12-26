const express = require("express");
const CounselingRequest = require("../models/CounselingRequest");
const InterviewPracticeRequest = require("../models/InterviewPracticeRequest");

const router = express.Router();

/**
 * GET USER REQUESTS (COUNSELING + INTERVIEW)
 * GET /api/my-requests?email=
 */
router.get("/my-requests", async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        message: "Email query parameter is required",
      });
    }

    // Counseling requests
    const counselingRequests = await CounselingRequest.find({ email })
      .sort({ createdAt: -1 })
      .select("status createdAt");

    // Interview practice requests
    const interviewPracticeRequests =
      await InterviewPracticeRequest.find({ email })
        .sort({ createdAt: -1 })
        .select("status meetingDateTime meetingLink createdAt");

    // Normalize for frontend
    const normalized = [
      ...counselingRequests.map((r) => ({
        id: r._id,
        type: "Counseling",
        status: r.status,
        meetingDate: null,
        meetingLink: null,
        createdAt: r.createdAt,
      })),
      ...interviewPracticeRequests.map((r) => ({
        id: r._id,
        type: "Interview",
        status: r.status,
        meetingDate: r.meetingDateTime,
        meetingLink: r.meetingLink || null,
        createdAt: r.createdAt,
      })),
    ];

    res.status(200).json(normalized);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
