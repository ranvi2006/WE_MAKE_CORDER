const mongoose = require("mongoose");

const interviewPracticeRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  availability: {
    type: String,
    required: true,
  },
  meetingLink: {
    type: String,
  },
  meetingTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["Pending", "Scheduled", "Completed", "Cancelled"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "InterviewPracticeRequest",
  interviewPracticeRequestSchema
);
