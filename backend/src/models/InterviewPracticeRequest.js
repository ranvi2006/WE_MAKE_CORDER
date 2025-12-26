const mongoose = require("mongoose");

const interviewPracticeRequestSchema = new mongoose.Schema(
  {
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
      trim: true,
    },

    experience: {
      type: String,
      default: "",
    },

    availability: {
      type: String,
      default: "",
    },

    // Optional resume PDF
    resume: {
      buffer: Buffer,
      filename: String,
      mimetype: String,
    },

    // Admin-controlled fields
    meetingDateTime: {
      type: Date,
      default: null,
    },

    meetingLink: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Scheduled", "Completed", "Closed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "InterviewPracticeRequest",
  interviewPracticeRequestSchema
);
