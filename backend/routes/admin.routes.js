const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth.middleware");

const {
  getUsers,
  changeRole,
  blockUser,
  deleteUser,
  getCourses,
  updateCourseStatus,
  deleteCourse,
  getStats,
  getTeacherCourses,
  adminUserEnrollmentView,
  createUser,
  getCourseLessons,
  getCourseAssignments,
  getCourseQuizzes,
  getQuizById,
  getAssignmentById,
  getAnalytics

} = require("../controllers/admin.controller");

/* ================= USERS ================= */

router.get("/users", protect, authorize("admin"), getUsers);

router.put("/users/:id/role", protect, authorize("admin"), changeRole);

router.put("/users/:id/block", protect, authorize("admin"), blockUser);

router.delete("/users/:id", protect, authorize("admin"), deleteUser);

/* ================= COURSES ================= */

router.get("/courses", protect, authorize("admin"), getCourses);

router.put(
  "/courses/:id/status",
  protect,
  authorize("admin"),
  updateCourseStatus
);

router.delete(
  "/courses/:id",
  protect,
  authorize("admin"),
  deleteCourse
);
router.get("/teacher/:teacherId/courses", protect, getTeacherCourses);
/* ================= STATS ================= */

router.get("/stats", protect, authorize("admin"), getStats);

router.get(
  "/user-enrollment-view/:userId",
  protect,
  authorize("admin"),
  adminUserEnrollmentView
);

router.post(
  "/users/create",
  protect,
  authorize("admin"),
  createUser
);

router.get(
  "/courses/:id/lessons",
  protect,
  authorize("admin"),
  getCourseLessons
);

router.get(
  "/courses/:id/assignments",
  protect,
  authorize("admin"),
  getCourseAssignments
);

router.get(
  "/courses/:id/quizzes",
  protect,
  authorize("admin"),
  getCourseQuizzes
);

router.get(
  "/quizzes/:id",
  protect,
  authorize("admin"),
  getQuizById
);

router.get(
  "/assignments/:id",
  protect,
  authorize("admin"),
  getAssignmentById
);

router.get(
  "/analytics",
  protect,
  authorize("admin"),
  getAnalytics
);

module.exports = router;