const Course = require("../models/Course");
const User = require("../models/User");
const Quiz = require("../models/Quiz");
const Enrollment = require("../models/Enrollment");

exports.getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user._id;

    /* ================= COURSES ================= */
    const courses = await Course.find({ teacher: teacherId });
    const courseIds = courses.map((c) => c._id);

    const totalCourses = courses.length;

    /* ================= STUDENTS (ONLY TEACHER COURSES) ================= */
    const totalStudents = await Enrollment.countDocuments({
      course: { $in: courseIds },
    });

    /* ================= QUIZZES (BY COURSE) ================= */
    const totalQuizzes = await Quiz.countDocuments({
      course: { $in: courseIds },
    });

    res.json({
      totalCourses,
      totalStudents,
      totalQuizzes,
    });
  } catch (error) {
    console.log("Dashboard error:", error);
    res.status(500).json({ message: error.message });
  }
};