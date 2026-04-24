const Enrollment = require("../models/Enrollment");
const Assignment = require("../models/Assignment");
const Quiz = require("../models/Quiz");
const Lesson = require("../models/Lesson");

exports.getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;

    /* ================= ENROLLMENTS ================= */
    const enrollments = await Enrollment.find({ course: courseId });

    const totalStudents = enrollments.length;

    /* ================= COURSE CONTENT ================= */
    const totalAssignments = await Assignment.countDocuments({ course: courseId });
    const totalQuizzes = await Quiz.countDocuments({ course: courseId });
    const totalLessons = await Lesson.countDocuments({ course: courseId });

    /* ================= RAW PROGRESS SUM ================= */
    let lessonSum = 0;
    let quizSum = 0;
    let assignmentSum = 0;

    enrollments.forEach((e) => {
      lessonSum += e.videoProgress || 0;
      quizSum += e.quizProgress || 0;
      assignmentSum += e.assignmentProgress || 0;
    });

    const count = totalStudents || 1;

    /* ================= AVERAGES ================= */
    const lessonAvg = lessonSum / count;
    const quizAvg = quizSum / count;
    const assignmentAvg = assignmentSum / count;

    /* ================= WEIGHTS (50 / 30 / 20) ================= */
    const lessonWeight = 0.5;
    const quizWeight = 0.3;
    const assignmentWeight = 0.2;

    /* ================= OVERALL SCORE ================= */
    const averageScore =
      lessonAvg * lessonWeight +
      quizAvg * quizWeight +
      assignmentAvg * assignmentWeight;

    /* ================= RESPONSE ================= */
    return res.json({
      totalStudents,
      totalLessons,
      totalAssignments,
      totalQuizzes,

      lessonProgress: Math.round(lessonAvg),
      quizAverage: Math.round(quizAvg),
      assignmentCompletion: Math.round(assignmentAvg),

      averageScore: Math.round(averageScore),
    });
  } catch (error) {
    console.log("❌ Analytics error:", error);
    res.status(500).json({ message: error.message });
  }
};