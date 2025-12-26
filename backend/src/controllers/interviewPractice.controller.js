const InterviewPracticeRequest = require("../models/InterviewPracticeRequest");
const { validationResult } = require("express-validator");

/**
 * POST /api/interview-practice-requests
 */
exports.createInterviewPracticeRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
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
      status: "Pending",
    });

    res.status(201).json({
      message: "Interview practice request submitted successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit interview practice request",
    });
  }
};

/**
 * GET /api/admin/interview-practice
 */
exports.getAllInterviewPracticeRequests = async (req, res) => {
  try {
    const requests = await InterviewPracticeRequest.find().sort({
      createdAt: -1,
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch interview practice requests",
    });
  }
};

/**
 * PUT /api/admin/interview-practice/:id
 */
exports.updateInterviewPracticeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, meetingTime, meetingLink } = req.body;

    const updated = await InterviewPracticeRequest.findByIdAndUpdate(
      id,
      { status, meetingTime, meetingLink },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({
      message: "Interview practice request updated",
      request: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update interview practice request",
    });
  }
};
