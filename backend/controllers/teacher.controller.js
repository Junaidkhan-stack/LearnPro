const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const Enrollment = require("../models/Enrollment");
/* ===============================
   CREATE COURSE
================================= */
exports.createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;

    const course = await Course.create({
      title,
      description,
      teacher: req.user._id, // logged in teacher

      status: "draft",
      isPublished: false,
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   CREATE LESSON
================================= */
exports.createLesson = async (req, res) => {
  try {
    const { title, content } = req.body;
    const { courseId } = req.params;

    const lesson = await Lesson.create({
      title,
      content,
      course: courseId,
    });

    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/* ===============================
   GET MY COURSES (TEACHER ONLY)
================================= */
exports.getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      teacher: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTeacherCourses = async (req, res) => {
  try {
    const { id } = req.params;

    const courses = await Course.find({ teacher: id });

    const result = await Promise.all(
      courses.map(async (course) => {
        const studentCount = await Enrollment.countDocuments({
          course: course._id,
        });

        return {
          _id: course._id,
          title: course.title,
          status: course.status,
          students: studentCount,
        };
      }),
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.updateCourseStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Only allow teacher to submit (draft → pending)
    if (!["pending", "draft"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    course.status = status;
    await course.save();

    res.json({ message: "Course submitted for review", course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.submitCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.status !== "draft") {
      return res
        .status(400)
        .json({ message: "Only draft courses can be submitted" });
    }

    course.status = "pending";
    await course.save();

    res.json({ message: "Course submitted for review", course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
