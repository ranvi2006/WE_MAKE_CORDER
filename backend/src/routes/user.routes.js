const express = require("express");
const User = require("../models/User");
const InterviewPracticeRequest = require("../models/InterviewPracticeRequest");
const Course = require("../models/Course");
const userAuth = require("../middleware/userAuth.middleware");

const router = express.Router();

/**
 * GET LOGGED-IN USER PROFILE
 * GET /api/users/profile
 */
router.get("/profile", userAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email phone createdAt enrolledCourses"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * GET USER ENROLLED COURSES
 * GET /api/users/enrolled-courses
 */
router.get("/enrolled-courses", userAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "enrolledCourses",
      select: "title description duration level createdAt",
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Format response with enrollment info
    const enrolledCourses = (user.enrolledCourses || []).map((course) => ({
      _id: course._id,
      title: course.title,
      description: course.description,
      duration: course.duration,
      level: course.level,
      enrolledAt: course.createdAt, // Using course creation date as enrollment date for now
      status: "Active", // Default status
    }));

    res.status(200).json(enrolledCourses);
  } catch (error) {
    next(error);
  }
});

/**
 * GET USER INTERVIEW PRACTICE HISTORY
 * GET /api/users/interview-practice
 */
router.get("/interview-practice", userAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("email");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Get all interview practice requests for this user
    const requests = await InterviewPracticeRequest.find({ email: user.email })
      .sort({ createdAt: -1 })
      .select("role experience status meetingDateTime meetingLink createdAt");

    // Format response
    const interviewHistory = requests.map((req) => ({
      _id: req._id,
      title: `Interview Practice - ${req.role}`,
      role: req.role,
      experience: req.experience,
      date: req.meetingDateTime || null,
      status: req.status,
      meetingLink: req.meetingLink || null,
      requestedAt: req.createdAt,
    }));

    res.status(200).json(interviewHistory);
  } catch (error) {
    next(error);
  }
});

/**
 * GET USER MY MEETINGS (Interview Practice Bookings)
 * GET /api/users/my-meetings
 */
router.get("/my-meetings", userAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("email");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Get all interview practice requests for this user with meeting details
    const requests = await InterviewPracticeRequest.find({
      email: user.email,
      status: { $in: ["Scheduled", "Completed"] },
      meetingDateTime: { $ne: null },
    })
      .sort({ meetingDateTime: -1 })
      .select("role meetingDateTime meetingLink status createdAt");

    // Format response
    const meetings = requests.map((req) => {
      const meetingDate = req.meetingDateTime ? new Date(req.meetingDateTime) : null;
      return {
        _id: req._id,
        interviewTitle: `Interview Practice - ${req.role}`,
        mentorName: "TBD", // This would come from a Mentor model if you add one
        date: meetingDate ? meetingDate.toISOString().split("T")[0] : null,
        time: meetingDate ? meetingDate.toTimeString().split(" ")[0].slice(0, 5) : null,
        mode: req.meetingLink ? "Online" : "Offline",
        status: req.status,
        bookingId: req._id.toString(),
        meetingLink: req.meetingLink || null,
        createdAt: req.createdAt,
      };
    });

    res.status(200).json(meetings);
  } catch (error) {
    next(error);
  }
});

/**
 * GET USER PROFILE (alias for /me for backwards compatibility)
 * GET /api/users/me
 */
router.get("/me", userAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email phone createdAt enrolledCourses"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
