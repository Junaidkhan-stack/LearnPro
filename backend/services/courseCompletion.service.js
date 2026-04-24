const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const LessonProgress = require("../models/LessonProgress");
const Assignment = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");

class CourseCompletionService {
  static async evaluate(enrollmentId) {
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) return;

    const courseId = enrollment.course;
    const studentId = enrollment.student;

    const [lessonDone, assignmentDone, quizDone] = await Promise.all([
      this.checkLessons(courseId, studentId),
      this.checkAssignments(courseId, studentId),
      this.checkQuizzes(courseId, studentId),
    ]);

    const isCompleted = lessonDone && assignmentDone && quizDone;

    if (isCompleted && enrollment.status !== "completed") {
      enrollment.status = "completed";
      enrollment.completedAt = new Date();

      // optional safety reset
      enrollment.overallProgress = 100;

      await enrollment.save();
    }

    return isCompleted;
  }

  /* ================= LESSON RULE ================= */
  static async checkLessons(courseId, studentId) {
    const lessons = await Lesson.find({ course: courseId });

    const progress = await LessonProgress.find({
      student: studentId,
      lesson: { $in: lessons.map((l) => l._id) },
    });

    if (lessons.length === 0) return true;

    return lessons.every((lesson) =>
      progress.some(
        (p) =>
          p.lesson.toString() === lesson._id.toString() &&
          p.completed === true
      )
    );
  }

  /* ================= ASSIGNMENT RULE ================= */
  static async checkAssignments(courseId, studentId) {
    const assignments = await Assignment.find({ course: courseId });

    for (let a of assignments) {
      const submission = await AssignmentSubmission.findOne({
        assignment: a._id,
        student: studentId,
      });

      const isSubmitted = !!submission;
      const isDeadlinePassed =
        a.deadline && new Date() > new Date(a.deadline);

      if (!isSubmitted && !isDeadlinePassed) {
        return false;
      }
    }

    return true;
  }

  /* ================= QUIZ RULE ================= */
  static async checkQuizzes(courseId, studentId) {
    const quizzes = await Quiz.find({ course: courseId });

    for (let q of quizzes) {
      const attempt = await QuizAttempt.findOne({
        quiz: q._id,
        student: studentId,
        completed: true,
      });

      const isAttempted = !!attempt;
      const isDeadlinePassed =
        q.deadline && new Date() > new Date(q.deadline);

      if (!isAttempted && !isDeadlinePassed) {
        return false;
      }
    }

    return true;
  }
}

module.exports = CourseCompletionService;