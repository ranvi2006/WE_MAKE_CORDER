const CounselingRequest = require("../models/CounselingRequest");
const { validationResult } = require("express-validator");

/**
 * POST /api/counseling-requests
 */
exports.createCounselingRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, goal, message } = req.body;

    const request = await CounselingRequest.create({
      name,
      email,
      goal,
      message,
      status: "Pending",
    });

    res.status(201).json({
      message: "Counseling request submitted successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit counseling request" });
  }
};

/**
 * GET /api/admin/counseling
 */
exports.getAllCounselingRequests = async (req, res) => {
  try {
    const requests = await CounselingRequest.find().sort({
      createdAt: -1,
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch counseling requests" });
  }
};

/**
 * PUT /api/admin/counseling/:id
 */
exports.updateCounselingRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updated = await CounselingRequest.findByIdAndUpdate(
      id,
      { status, notes },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({
      message: "Counseling request updated",
      request: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update counseling request" });
  }
};
