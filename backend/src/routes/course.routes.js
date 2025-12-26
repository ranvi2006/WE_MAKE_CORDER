const express = require("express");
const { body, validationResult } = require("express-validator");

const Course = require("../models/Course");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/* ================================
   PUBLIC: GET PUBLISHED COURSES
   GET /api/courses
================================ */
router.get("/courses", async (req, res, next) => {
  try {
    const courses = await Course.find({ published: true })
      .sort({ createdAt: -1 });

    res.status(200).json(courses);
  } catch (error) {
    next(error);
  }
});

/* ================================
   ADMIN: CREATE COURSE
   POST /api/admin/courses
================================ */
router.post(
  "/admin/courses",
  authMiddleware,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("duration").optional(),
    body("level").optional(),
    body("published").optional().isBoolean(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const course = await Course.create(req.body);

      res.status(201).json(course);
    } catch (error) {
      next(error);
    }
  }
);

/* ================================
   ADMIN: UPDATE COURSE
   PUT /api/admin/courses/:id
================================ */
router.put(
  "/admin/courses/:id",
  authMiddleware,
  async (req, res, next) => {
    try {
      const updated = await Course.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }
);

/* ================================
   ADMIN: DELETE COURSE
   DELETE /api/admin/courses/:id
================================ */
router.delete(
  "/admin/courses/:id",
  authMiddleware,
  async (req, res, next) => {
    try {
      const deleted = await Course.findByIdAndDelete(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      res.status(200).json({
        message: "Course deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
