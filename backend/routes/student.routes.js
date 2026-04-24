const express = require("express");
const router = express.Router();

const {
  getCourses,
  enrollCourse,
  getLessons,
  updateLessonProgress,
} = require("../controllers/student.controller");

const { protect, authorize } = require("../middleware/auth.middleware");

/* =====================================
   Apply auth middleware to all routes
===================================== */
router.use(protect, authorize("student"));

/* =====================================
   GET ALL AVAILABLE COURSES
===================================== */
router.get("/courses", getCourses);

/* =====================================
   ENROLL IN A COURSE
===================================== */
router.post("/courses/:courseId/enroll", enrollCourse);

/* =====================================
   GET LESSONS OF ENROLLED COURSE
===================================== */
router.get("/courses/:courseId/lessons", getLessons);

/* =====================================
   UPDATE LESSON PROGRESS (90% RULE)
===================================== */
router.post("/lessons/:lessonId/progress", updateLessonProgress);

module.exports = router;