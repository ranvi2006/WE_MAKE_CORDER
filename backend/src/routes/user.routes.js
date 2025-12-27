const express = require("express");
const User = require("../models/user");
const userAuth = require("../middleware/userAuth.middleware");

const router = express.Router();

/**
 * GET LOGGED-IN USER PROFILE
 * GET /api/users/me
 */
router.get("/me", userAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "email createdAt"
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
