const express = require("express");
const cors = require("cors");

// Routes
const adminAuthRoutes = require("./routes/adminAuth.routes");
const adminRoutes = require("./routes/admin.routes");
const counselingRoutes = require("./routes/counseling.routes");
const interviewPracticeRoutes = require("./routes/interviewPractice.routes");
const courseRoutes = require("./routes/course.routes");
const myRequestsRoutes = require("./routes/myRequests.routes");
const healthRoutes = require("./routes/health.routes");

// Error middleware
const errorHandler = require("./middleware/error.middleware");

const app = express();

// CORS configuration
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";

// Middleware
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api", counselingRoutes);
app.use("/api", interviewPracticeRoutes);
app.use("/api", courseRoutes);
app.use("/api", myRequestsRoutes);

app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);

app.use("/health", healthRoutes);

// 404 handler (optional but recommended)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler (MUST be last)
app.use(errorHandler);

module.exports = app;
