const express = require("express");
const router = express.Router();
const { getCourses } = require("../controllers/course.controller");
const Enrollment = require("../models/Enrollment");
const { getCourseAnalytics } = require("../controllers/analytics.controller");

router.get("/", getCourses);

router.get("/:courseId/enrollments", async (req, res) => {
  try {
    const students = await Enrollment.find({
      course: req.params.courseId,
    }).populate("student", "name email");

    const result = students
      .map((e) => e.student)
      .filter((s) => s); // remove nulls

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/:courseId/analytics", getCourseAnalytics);


module.exports = router;