const jwt = require("jsonwebtoken");

/**
 * USER AUTH MIDDLEWARE
 * Protects routes for logged-in users only
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check Authorization header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authorization token missing",
    });
  }

  try {
    const token = authHeader.split(" ")[1];

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure token belongs to a USER (not admin)
    if (decoded.role !== "user") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    // Attach user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
