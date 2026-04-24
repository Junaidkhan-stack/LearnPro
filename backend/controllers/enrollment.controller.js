const Enrollment = require("../models/Enrollment");
const Assignment = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");

/* =====================================
   GET PROGRESS (PRO LEVEL)
===================================== */
exports.getProgress = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.user._id;

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    /* ================= ASSIGNMENT PROGRESS ================= */
    const assignments = await Assignment.find({ course: courseId }).lean();
    const assignmentIds = assignments.map(a => a._id);

    const submissions = await AssignmentSubmission.find({
      student: studentId,
      assignment: { $in: assignmentIds },
    }).lean();

    let earnedMarks = 0;
    let totalMarks = 0;

    for (let i = 0; i < assignments.length; i++) {
      const assignment = assignments[i];
      totalMarks += assignment.totalMarks || 100;

      const submission = submissions.find(
        s => s.assignment.toString() === assignment._id.toString()
      );

      if (submission && submission.graded) {
        earnedMarks += submission.marks || 0; // graded marks
      } else if (submission && !submission.graded) {
        earnedMarks += 0; // submitted but not graded yet
      } else {
        earnedMarks += 0; // not submitted
      }
    }

const assignmentProgress =
  totalMarks === 0 ? 0 : Number(((earnedMarks / totalMarks) * 20).toFixed(2));

    /* ================= UPDATE ENROLLMENT ================= */
    enrollment.assignmentProgress = assignmentProgress;
    enrollment.overallProgress = Math.round(
  enrollment.videoProgress +
  enrollment.quizProgress +
  assignmentProgress
);

    if (enrollment.overallProgress >= 100) {
      enrollment.status = "completed";
    }

    await enrollment.save();

    console.log("✅ Updated assignmentProgress:", assignmentProgress);

    /* ================= RESPONSE ================= */
    res.status(200).json(enrollment);
  } catch (error) {
    console.error("❌ Progress error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
/* COUNT ENROLLMENTS (TOTAL STUDENTS IN COURSE) */
exports.countEnrollmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const count = await Enrollment.countDocuments({
      course: courseId,
    });

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getStudentCourseDetails = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;

    // 1. Enrollment
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({
        message: "Student is not enrolled in this course",
      });
    }

    // 2. Populate student info
    await enrollment.populate({
  path: "student",
  select: "name email",
});
// 3. Assignments
const assignments = await Assignment.find({ course: courseId });

// 🔥 ADD THIS (FETCH SUBMISSIONS)
const submissions = await AssignmentSubmission.find({
  student: studentId,
  assignment: { $in: assignments.map((a) => a._id) },
});

// 🔥 REPLACE YOUR OLD MAP WITH THIS
const assignmentData = assignments.map((a) => {
  const submission = submissions.find(
    (s) => s.assignment.toString() === a._id.toString()
  );

  return {
    _id: a._id,
    title: a.title,
    totalMarks: a.totalMarks,

    submission: submission
      ? {
          graded: submission.graded,
          marks: submission.marks,
          feedback: submission.feedback,
        }
      : null,
  };
});

    // 4. Quizzes
    const Quiz = require("../models/Quiz");
    const QuizAttempt = require("../models/QuizAttempt");

    const quizzes = await Quiz.find({ course: courseId });

    const quizData = await Promise.all(
      quizzes.map(async (quiz) => {
       const attempt = await QuizAttempt.findOne({
  student: studentId,
  quiz: quiz._id,
}).sort({ createdAt: -1 });

        return {
          _id: quiz._id,
          title: quiz.title,
          total: quiz.totalMarks,
          score: attempt ? attempt.score : 0,
        };
      })
    );

    // 5. LESSONS (NEW PART)
    const Lesson = require("../models/Lesson");
    const LessonProgress = require("../models/LessonProgress");

    const lessons = await Lesson.find({ course: courseId });

    const lessonProgress = await LessonProgress.find({
      student: studentId,
      lesson: { $in: lessons.map((l) => l._id) },
    });

    const lessonData = lessons.map((lesson) => {
      const progress = lessonProgress.find(
        (p) => p.lesson.toString() === lesson._id.toString()
      );

      return {
        _id: lesson._id,
        title: lesson.title,
        duration: lesson.duration,
        watchPercentage: progress ? progress.watchPercentage : 0,
        completed: progress ? progress.completed : false,
      };
    });

    // 6. RESPONSE
    return res.status(200).json({
      name: enrollment.student.name,
      email: enrollment.student.email,

      assignments: assignmentData,
      quizzes: quizData,
      lessons: lessonData,   // ⭐ ADDED

progress: {
  video: Math.round(enrollment.videoProgress),
  quiz: Math.round(enrollment.quizProgress),
  assignment: Math.round(enrollment.assignmentProgress),
  overall: Math.round(enrollment.overallProgress),
},
    });

  } catch (error) {
    console.log("❌ Student Details Error:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;

    const Enrollment = require("../models/Enrollment");

    const students = await Enrollment.find({ course: courseId })
      .populate("student", "name email")
      .select("student");

    const result = students.map((e) => e.student);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/* ================= GET USER ENROLLMENTS (ADMIN) ================= */
exports.getUserEnrollments = async (req, res) => {
  try {
    const { userId } = req.params;

    const requester = req.user;

    // ================= ROLE SECURITY =================
    // Admin can view anyone
    // Student can only view their own
    // Teacher is NOT allowed here (optional rule)

    if (
      requester.role !== "admin" &&
      requester._id.toString() !== userId
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    // ================= FETCH ENROLLMENTS =================
    const enrollments = await Enrollment.find({
      student: userId,
    })
      .populate({
        path: "course",
        select: "title",
        populate: {
          path: "teacher",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    // ================= FORMAT RESPONSE =================
    const result = enrollments.map((enroll) => ({
      _id: enroll._id,
      courseId: enroll.course?._id,
      courseTitle: enroll.course?.title || "Untitled Course",
      teacherName: enroll.course?.teacher?.name || "Unknown",
      videoProgress: enroll.videoProgress || 0,
      quizProgress: enroll.quizProgress || 0,
      assignmentProgress: enroll.assignmentProgress || 0,
      overallProgress: enroll.overallProgress || 0,
      status: enroll.status,
      createdAt: enroll.createdAt,
    }));

    // ================= RESPONSE =================
    res.status(200).json(result);
  } catch (error) {
    console.log("❌ getUserEnrollments error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};
