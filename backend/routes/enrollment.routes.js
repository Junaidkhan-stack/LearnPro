const express = require("express");
const router = express.Router();

const { protect , authorize} = require("../middleware/auth.middleware");
const { getProgress ,
    countEnrollmentsByCourse,
    getStudentCourseDetails,
    getCourseStudents,
    getUserEnrollments
} = require("../controllers/enrollment.controller");


/* ================= GET PROGRESS ================= */
router.get("/progress/:courseId", protect, getProgress);
router.get("/count/:courseId", protect, countEnrollmentsByCourse);
router.get(
  "/courses/:courseId/students/:studentId",
  protect,
  getStudentCourseDetails
);
router.get(
  "/courses/:courseId/students",
  protect,
  getCourseStudents
);

router.get(
  "/user/:userId",
  protect,
  getUserEnrollments
);

module.exports = router;