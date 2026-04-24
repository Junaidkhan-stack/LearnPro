    const Lesson = require("../models/Lesson");
    const LessonProgress = require("../models/LessonProgress");
    const Enrollment = require("../models/Enrollment");
    const CourseCompletionService = require("../services/courseCompletion.service");

/* =====================================
   CREATE LESSON WITH CLOUDINARY VIDEO
===================================== */
exports.createLesson = async (req, res) => {
  try {
    const { courseId, title } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Video file is required",
      });
    }

    // ✅ AUTO ORDER
    const count = await Lesson.countDocuments({
      course: courseId,
    });

    // ✅ AUTO DURATION (if available from upload middleware)
    // multer-cloudinary sometimes gives duration here
    const autoDuration = req.file.duration || 0;

    const lesson = await Lesson.create({
      course: courseId,
      title,
      videoUrl: req.file.path,
      duration: autoDuration,
      order: count + 1,
    });

    res.status(201).json({
      message: "Lesson created successfully",
      lesson,
    });
  } catch (error) {
    console.log("❌ CREATE LESSON ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================
   GET LESSONS FOR A COURSE
===================================== */
exports.getCourseLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({
      course: req.params.courseId,
    }).sort({ order: 1 });

    res.status(200).json(lessons);
  } catch (error) {
    console.log("❌ GET COURSE LESSONS ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================
   GET SINGLE LESSON (FIXED)
===================================== */
exports.getLessonById = async (req, res) => {
  try {
    const { lessonId } = req.params;

    console.log("📌 Requested Lesson ID:", lessonId);

    if (!lessonId || lessonId.length !== 24) {
      return res.status(400).json({
        message: "Invalid lesson ID",
      });
    }

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found",
      });
    }

    console.log("✅ Lesson Found:", lesson);

    res.status(200).json(lesson);
  } catch (error) {
    console.log("❌ GET LESSON ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================
   MARK LESSON COMPLETE
===================================== */
exports.markLessonComplete = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const studentId = req.user._id;

    // 1. Validate lesson
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // 2. Check enrollment
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: lesson.course,
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "Not enrolled in this course",
      });
    }

    // 3. Create or update lesson progress (REAL TRACKING)
    let progress = await LessonProgress.findOne({
      student: studentId,
      lesson: lessonId,
    });

    if (!progress) {
      progress = await LessonProgress.create({
        student: studentId,
        lesson: lessonId,
        course: lesson.course, // IMPORTANT
        watchPercentage: 100,
        completed: true,
      });
    } else {
      progress.watchPercentage = 100;
      progress.completed = true;
      await progress.save();
    }

    // 4. 🔥 KEEP YOUR EXISTING PROGRESS SYSTEM (DO NOT CHANGE LOGIC)
    const lessons = await Lesson.find({ course: lesson.course });

    const completedCount = await LessonProgress.countDocuments({
      student: studentId,
      lesson: { $in: lessons.map((l) => l._id) },
      completed: true,
    });

    const videoProgress =
      lessons.length === 0
        ? 0
        : Number(((completedCount / lessons.length) * 50).toFixed(2));

    enrollment.videoProgress = videoProgress;

    enrollment.overallProgress = Math.round(
      videoProgress +
      enrollment.quizProgress +
      enrollment.assignmentProgress
    );

    await enrollment.save();

    // 5. 🔥 NEW: COMPLETION ENGINE (does NOT affect progress)
    await CourseCompletionService.evaluate(enrollment._id);

    res.status(200).json({
      message: "Lesson marked as complete",
      progress: {
        videoProgress,
        overallProgress: enrollment.overallProgress,
      },
    });
  } catch (error) {
    console.log("❌ COMPLETE LESSON ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE LESSON ================= */
exports.updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const updatedLesson = await Lesson.findByIdAndUpdate(
      lessonId,
      req.body,
      { new: true }
    );

    if (!updatedLesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json(updatedLesson);
  } catch (error) {
    console.log("Update lesson error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ================= DELETE LESSON ================= */
exports.deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findByIdAndDelete(lessonId);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.log("Delete lesson error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE LESSON VIDEO ================= */
exports.updateLessonVideo = async (req, res) => {
  try {
    const { lessonId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No video uploaded" });
    }

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // ✅ UPDATE VIDEO
    lesson.videoUrl = req.file.path;

    // ✅ AUTO UPDATE DURATION (if available)
    if (req.file.duration) {
      lesson.duration = req.file.duration;
    }

    await lesson.save();

    res.json(lesson);
  } catch (error) {
    console.log("Update video error:", error);
    res.status(500).json({ message: error.message });
  }
};