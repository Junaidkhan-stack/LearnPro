const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { videoParser } = require("../middleware/upload");

const {
  createLesson,
  getCourseLessons,
  getLessonById,
  markLessonComplete,
  updateLesson,
  deleteLesson,
  updateLessonVideo
} = require("../controllers/lesson.controller");

/* ================= CREATE LESSON ================= */
router.post(
  "/create",
  protect,
  videoParser.single("video"),
  createLesson
);

/* ================= GET COURSE LESSONS ================= */
router.get(
  "/courses/:courseId/lessons",
  protect,
  getCourseLessons
);

/* ================= SINGLE LESSON ================= */
router.get("/:lessonId", getLessonById);

/* ================= COMPLETE LESSON ================= */
router.post("/:lessonId/complete", markLessonComplete);

/* ================= UPDATE LESSON ================= */
router.put("/:lessonId", updateLesson);

/* ================= DELETE LESSON ================= */
router.delete("/:lessonId", deleteLesson);

/* ================= UPDATE VIDEO ================= */
router.put(
  "/:lessonId/video",
  protect,
  videoParser.single("video"),
  updateLessonVideo
);

module.exports = router;