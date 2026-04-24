const express = require("express");
const router = express.Router();

const {
  createCourse,
  createLesson,
  getMyCourses, // ✅ ADD THIS
  getTeacherCourses,
  submitCourse,
  updateCourseStatus
} = require("../controllers/teacher.controller");

const { protect, authorize } = require("../middleware/auth.middleware");

/* Only teacher allowed */
router.use(protect, authorize("teacher" , "admin"));

/* ================= COURSES ================= */
router.post("/courses", createCourse);
router.get("/courses", getMyCourses); // ✅ ADD THIS

/* ================= LESSONS ================= */
router.post("/courses/:courseId/lessons", createLesson);
router.get(
  "/:id/courses",
  protect,
  getTeacherCourses,
);

router.put(
  "/courses/:id/submit",
  protect,
  authorize("teacher"),
  submitCourse
);

router.put(
  "/courses/:id/status",
  protect,
  authorize("teacher"),
  updateCourseStatus
);

module.exports = router;
