const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const user = require("../models/User");
const Lesson = require("../models/Lesson");
const Assignment = require("../models/Assignment");
const Quiz = require("../models/Quiz");

/* ================= USERS ================= */

// GET ALL USERS
exports.getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

// CHANGE ROLE
exports.changeRole = async (req, res) => {
  const user = await User.findById(req.params.id);

  user.role = req.body.role;
  await user.save();

  res.json({ message: "Role updated" });
};

// BLOCK USER
exports.blockUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  user.isBlocked = req.body.isBlocked;
  await user.save();

  res.json({ message: "User updated" });
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};

/* ================= COURSES ================= */

// GET ALL COURSES (ADMIN)
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCourseStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    course.status = status;

    if (status === "approved") {
      course.isPublished = true;
      course.rejectionReason = ""; // clear old reason
    }

    // ✅ HANDLE REJECTION
    if (status === "rejected") {
      course.isPublished = false;
      course.rejectionReason = rejectionReason || "No reason provided";
    }

    await course.save();

    res.json({
      message: "Course status updated successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    course.isDeleted = true;
    course.status = "rejected"; // optional but better UX
    await course.save();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/* ================= STATS ================= */

exports.getStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const students = await User.countDocuments({ role: "student" });
    const teachers = await User.countDocuments({ role: "teacher" });

    const courses = await Course.countDocuments();
    const pendingCourses = await Course.countDocuments({ status: "pending" });
    const approvedCourses = await Course.countDocuments({ status: "approved" });

    const enrollments = await Enrollment.countDocuments();

    res.json({
      users,
      students,
      teachers,
      courses,
      pendingCourses,
      approvedCourses,
      lessons: 0,
      enrollments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// GET TEACHER COURSES
exports.getTeacherCourses = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;

    const courses = await Course.find({ teacher: teacherId });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminUserEnrollmentView = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Student enrollments
    const enrollments = await Enrollment.find({
      student: new mongoose.Types.ObjectId(userId),
    }).populate({
      path: "course",
      select: "title status teacher",
      populate: {
        path: "teacher",
        select: "name",
      },
    });

    // 2. Teacher approved courses
    const courses = await Course.find({
      teacher: userId,
      status: "approved",
      isPublished: true,
    });

    res.json({
      enrollments: enrollments.map((e) => ({
        _id: e._id,
        courseTitle: e.course?.title,
        teacherName: e.course?.teacher?.name || "Unknown",
        status: e.status,
        progress: e.overallProgress,
      })),

      teacherCourses: await Promise.all(
        courses.map(async (c) => {
          const count = await Enrollment.countDocuments({
            course: c._id,
          });

          return {
            _id: c._id,
            title: c.title,
            status: c.status,
            students: count, // ✅ THIS IS WHAT UI NEEDS
          };
        }),
      ),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ HASH PASSWORD (THIS WAS MISSING)
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating user" });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    const result = await Promise.all(
      courses.map(async (course) => {
        const lessonsCount = await Lesson.countDocuments({
          course: course._id,
        });

        const assignmentsCount = await Assignment.countDocuments({
          course: course._id,
        });

        const quizzesCount = await Quiz.countDocuments({
          course: course._id,
        });

        return {
          ...course.toObject(),
          lessonsCount,
          assignmentsCount,
          quizzesCount,
        };
      }),
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/* ================= COURSE CONTENT ================= */

// LESSONS
exports.getCourseLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({ course: req.params.id });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ASSIGNMENTS
exports.getCourseAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.id });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// QUIZZES
exports.getCourseQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.id });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE QUIZ DETAIL (ADMIN VIEW - FULL DATA)
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("course", "title")
      .populate("lesson", "title");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json({
      _id: quiz._id,
      title: quiz.title,
      course: quiz.course,
      lesson: quiz.lesson,
      timeLimit: quiz.timeLimit,
      totalMarks: quiz.totalMarks,
      maxAttempts: quiz.maxAttempts,
      questionsCount: quiz.questions.length,

      questions: quiz.questions.map((q, index) => ({
        index,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer, // ADMIN ONLY
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("course", "title")
      .populate("lesson", "title");

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({
      _id: assignment._id,
      title: assignment.title,
      description: assignment.description,
      totalMarks: assignment.totalMarks,
      deadline: assignment.deadline || assignment.dueDate,
      fileUrl: assignment.fileUrl,
      course: assignment.course,
      lesson: assignment.lesson,
      createdAt: assignment.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const students = await User.countDocuments({ role: "student" });
    const teachers = await User.countDocuments({ role: "teacher" });

    const courses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({
      status: "approved",
    });

    const pendingCourses = await Course.countDocuments({
      status: "pending",
    });

    const enrollments = await Enrollment.countDocuments();

    const lessons = await Lesson.countDocuments();
    const assignments = await Assignment.countDocuments();
    const quizzes = await Quiz.countDocuments();

    res.json({
      users,
      students,
      teachers,
      courses,
      publishedCourses,
      pendingCourses,
      enrollments,
      lessons,
      assignments,
      quizzes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
