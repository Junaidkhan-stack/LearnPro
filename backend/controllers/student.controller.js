const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const Enrollment = require("../models/Enrollment");
const LessonProgress = require("../models/LessonProgress");

/* =====================================
   GET ALL COURSES
===================================== */
exports.getCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const courses = await Course.find({ status: "approved", }).populate(
      "teacher",
      "name"
    );

    const enrollments = await Enrollment.find({ student: studentId });

    const enrolledCourseIds = enrollments.map((e) =>
      e.course.toString()
    );

    const formatted = courses.map((course) => ({
      id: course._id,
      title: course.title,
      instructor: course.teacher?.name || "Unknown",
      enrolled: enrolledCourseIds.includes(course._id.toString()),
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================
   ENROLL IN COURSE
===================================== */
exports.enrollCourse = async (req, res) => {
  try {
    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: req.params.courseId,
    });

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(400).json({ message: "Already enrolled" });
  }
};

/* =====================================
   GET LESSONS (ONLY IF ENROLLED)
===================================== */
exports.getLessons = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.courseId,
    });

    if (!enrollment) {
      return res.status(403).json({ message: "Not enrolled" });
    }

    const lessons = await Lesson.find({
      course: req.params.courseId,
    }).sort("order");

    const progresses = await LessonProgress.find({
      student: req.user.id,
      lesson: { $in: lessons.map((l) => l._id) },
    });

    const formatted = lessons.map((lesson) => {
      const progress = progresses.find(
        (p) => p.lesson.toString() === lesson._id.toString()
      );

      return {
        id: lesson._id,
        title: lesson.title,
        duration: lesson.duration,
        watchPercentage: progress ? progress.watchPercentage : 0,
        completed: progress ? progress.completed : false,
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================
   UPDATE LESSON PROGRESS (FINAL FIX)
   - NEVER un-complete lesson
   - NEVER decrease progress
   - 90% completion rule
===================================== */
exports.updateLessonProgress = async (req, res) => {
  try {
    const { watchPercentage } = req.body;

    // Validation
    if (
      watchPercentage === undefined ||
      typeof watchPercentage !== "number" ||
      watchPercentage < 0 ||
      watchPercentage > 100
    ) {
      return res.status(400).json({
        message: "watchPercentage must be a number between 0 and 100",
      });
    }

    const lesson = await Lesson.findById(req.params.lessonId);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: lesson.course,
    });

    if (!enrollment) {
      return res.status(403).json({ message: "Not enrolled" });
    }

    /* =====================================
       🔥 FIX: KEEP COMPLETION + MAX PROGRESS
    ===================================== */

    const existingProgress = await LessonProgress.findOne({
      student: req.user.id,
      lesson: lesson._id,
    });

    let completed = false;

    // ✅ NEVER UN-COMPLETE
    if (existingProgress?.completed) {
      completed = true;
    } else {
      completed = watchPercentage >= 90;
    }

    // ✅ NEVER DECREASE %
    const safePercentage = Math.max(
      watchPercentage,
      existingProgress?.watchPercentage || 0
    );

    await LessonProgress.findOneAndUpdate(
      {
        student: req.user.id,
        lesson: lesson._id,
      },
      {
        watchPercentage: safePercentage,
        completed,
      },
      { upsert: true, new: true }
    );

    /* =====================================
       COURSE PROGRESS CALCULATION
    ===================================== */

    const lessons = await Lesson.find({ course: lesson.course });

    if (!lessons || lessons.length === 0) {
      enrollment.videoProgress = 0;
      enrollment.overallProgress =
        enrollment.quizProgress + enrollment.assignmentProgress;

      await enrollment.save();

      return res.json({
        message: "Progress updated",
        lessonCompleted: completed,
        averageVideoPercentage: 0,
        videoContribution: 0,
        overallProgress: enrollment.overallProgress,
      });
    }

    const lessonIds = lessons.map((l) => l._id);

    const progresses = await LessonProgress.find({
      student: req.user.id,
      lesson: { $in: lessonIds },
    });

const totalLessons = lessons.length;

const completedLessons = progresses.filter(
  (p) => p.completed === true
).length;

const videoContribution =
  totalLessons === 0
    ? 0
    : Number(((completedLessons / totalLessons) * 50).toFixed(2));

    enrollment.videoProgress = videoContribution;

    enrollment.overallProgress =
      enrollment.videoProgress +
      enrollment.quizProgress +
      enrollment.assignmentProgress;

    if (enrollment.overallProgress >= 100) {
      enrollment.status = "completed";
    }

    await enrollment.save();

    res.json({
      message: "Progress updated",
      lessonCompleted: completed,
      averageVideoPercentage: Number(
  ((completedLessons / totalLessons) * 100).toFixed(0)
),
      videoContribution,
      overallProgress: enrollment.overallProgress,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};