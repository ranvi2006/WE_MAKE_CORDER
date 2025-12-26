const express = require("express");
const { body } = require("express-validator");

const authMiddleware = require("../middleware/auth.middleware");
const {
  getPublishedCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/course.controller");

const router = express.Router();

/**
 * Public
 */
router.get("/courses", getPublishedCourses);

/**
 * Admin (protected)
 */
router.post(
  "/admin/courses",
  authMiddleware,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("duration").notEmpty().withMessage("Duration is required"),
    body("level")
      .isIn(["Beginner", "Intermediate", "Advanced"])
      .withMessage("Invalid level"),
    body("published").optional().isBoolean(),
  ],
  createCourse
);

router.put(
  "/admin/courses/:id",
  authMiddleware,
  [
    body("title").optional().notEmpty(),
    body("description").optional().notEmpty(),
    body("duration").optional().notEmpty(),
    body("level")
      .optional()
      .isIn(["Beginner", "Intermediate", "Advanced"]),
    body("published").optional().isBoolean(),
  ],
  updateCourse
);

router.delete(
  "/admin/courses/:id",
  authMiddleware,
  deleteCourse
);

module.exports = router;
