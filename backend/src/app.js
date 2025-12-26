const express = require("express");
const cors = require("cors");

// =======================
// ROUTES
// =======================

// Admin
const adminAuthRoutes = require("./routes/adminAuth.routes");
const adminRoutes = require("./routes/admin.routes");

// Public
const counselingRoutes = require("./routes/counseling.routes");
const interviewPracticeRoutes = require("./routes/interviewPractice.routes");
const courseRoutes = require("./routes/course.routes");
const myRequestsRoutes = require("./routes/myRequests.routes");

// User
const userAuthRoutes = require("./routes/userAuth.routes");
const userRoutes = require("./routes/user.routes");
// const userCoursesRoutes = require("./routes/userCourses.routes");

// Health
const healthRoutes = require("./routes/health.routes");

// Error middleware
const errorHandler = require("./middleware/error.middleware");

const app = express();

// =======================
// CORS CONFIG
// =======================
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// =======================
// GLOBAL MIDDLEWARE
// =======================
app.use(express.json());

// =======================
// PUBLIC ROUTES
// =======================
app.use("/api", counselingRoutes);
app.use("/api", interviewPracticeRoutes);
app.use("/api", courseRoutes);
app.use("/api", myRequestsRoutes);

// =======================
// USER ROUTES
// =======================
app.use("/api/users/auth", userAuthRoutes);
app.use("/api/users", userRoutes);
// app.use("/api/users", userCoursesRoutes);

// =======================
// ADMIN ROUTES
// =======================
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);

// =======================
// HEALTH CHECK
// =======================
app.use("/health", healthRoutes);

// =======================
// 404 HANDLER
// =======================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// =======================
// GLOBAL ERROR HANDLER
// (MUST BE LAST)
// =======================
app.use(errorHandler);

module.exports = app;
