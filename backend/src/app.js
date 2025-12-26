const express = require("express");
const cors = require("cors");

// Import adminAuth controller to trigger default admin seed
require("./controllers/adminAuth.controller");

// =======================
// ROUTES
// =======================

// Admin
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
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ["http://localhost:3000", "http://localhost:5173"];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all origins in development
      }
    },
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
