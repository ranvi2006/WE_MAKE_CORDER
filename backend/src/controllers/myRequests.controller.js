const CounselingRequest = require("../models/CounselingRequest");
const InterviewPracticeRequest = require("../models/InterviewPracticeRequest");

/**
 * GET /api/my-requests?email=
 */
exports.getMyRequests = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        message: "Email query parameter is required",
      });
    }

    const [counseling, interviewPractice] = await Promise.all([
      CounselingRequest.find({ email }).select(
        "goal status notes createdAt"
      ),
      InterviewPracticeRequest.find({ email }).select(
        "role status meetingTime meetingLink createdAt"
      ),
    ]);

    res.json({
      counselingRequests: counseling,
      interviewPracticeRequests: interviewPractice,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch requests",
    });
  }
};
