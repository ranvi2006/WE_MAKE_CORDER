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
      .select("goal status createdAt");

    // Interview practice requests
    const interviewPracticeRequests =
      await InterviewPracticeRequest.find({ email })
        .sort({ createdAt: -1 })
        .select("role status meetingDateTime meetingLink createdAt");

    // Return separate arrays as frontend expects
    const formattedCounseling = counselingRequests.map((r) => ({
      _id: r._id,
      goal: r.goal || 'N/A',
      status: r.status,
      createdAt: r.createdAt,
    }));

    const formattedInterview = interviewPracticeRequests.map((r) => ({
      _id: r._id,
      role: r.role || 'N/A',
      status: r.status,
      meetingTime: r.meetingDateTime,
      meetingLink: r.meetingLink || null,
      createdAt: r.createdAt,
    }));

    res.status(200).json({
      counselingRequests: formattedCounseling,
      interviewPracticeRequests: formattedInterview,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
