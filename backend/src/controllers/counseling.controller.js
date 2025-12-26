const CounselingRequest = require("../models/CounselingRequest");
const { validationResult } = require("express-validator");

// POST /api/counseling-requests
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
  } catch (err) {
    res.status(500).json({ message: "Failed to submit counseling request" });
  }
};

// GET /api/admin/counseling
exports.getAllCounselingRequests = async (req, res) => {
  try {
    const requests = await CounselingRequest.find().sort({ createdAt: -1 });

    const formatted = requests.map((r) => ({
      id: r._id,
      name: r.name,
      email: r.email,
      goal: r.goal,
      message: r.message,
      status: r.status,
      notes: r.notes,
      createdAt: r.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch counseling requests" });
  }
};

// PUT /api/admin/counseling/:id
exports.updateCounselingRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updated = await CounselingRequest.findByIdAndUpdate(
      id,
      { status, notes },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({
      id: updated._id,
      status: updated.status,
      notes: updated.notes,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update counseling request" });
  }
};
