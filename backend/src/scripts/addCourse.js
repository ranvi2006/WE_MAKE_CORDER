require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("../models/Course");

async function addCourse() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const course = await Course.create({
      title: "Node.js Backend Mastery",
      description: "Learn Express, MongoDB, JWT, and production backend patterns",
      duration: "8 weeks",
      level: "Intermediate",
      published: true,
    });

    console.log("Course added successfully:");
    console.log(course);

    process.exit(0);
  } catch (error) {
    console.error("Error adding course:", error);
    process.exit(1);
  }
}

addCourse();
