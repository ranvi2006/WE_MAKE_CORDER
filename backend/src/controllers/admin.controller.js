const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const CounselingRequest = require("../models/CounselingRequest");
const InterviewPracticeRequest = require("../models/InterviewPracticeRequest");

/**
 * POST /api/admin/register
 */
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Admin registration failed" });
  }
};

/**
 * POST /api/admin/login
 */
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

/**
 * GET /api/admin/stats (Protected)
 */
exports.getAdminStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      counselingCount,
      interviewCount,
      todaysRequests,
      scheduledMeetings,
    ] = await Promise.all([
      CounselingRequest.countDocuments(),
      InterviewPracticeRequest.countDocuments(),
      CounselingRequest.countDocuments({
        createdAt: { $gte: startOfToday },
      }),
      InterviewPracticeRequest.countDocuments({
        status: "Scheduled",
      }),
    ]);

    res.json({
      counselingRequests: counselingCount,
      interviewRequests: interviewCount,
      todaysRequests,
      scheduledMeetings,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};
