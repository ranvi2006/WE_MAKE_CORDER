const express = require("express");
const User = require("./User");
const userAuth = require("../middleware/userAuth.middleware");

const router = express.Router();

// GET courses for logged-in user
router.get("/my-courses", userAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("enrolledCourses");

    res.json(user?.enrolledCourses || []);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
