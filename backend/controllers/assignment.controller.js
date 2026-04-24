const Assignment = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const Enrollment = require("../models/Enrollment");
const mongoose = require("mongoose");
const CourseCompletionService = require("../services/courseCompletion.service");


/* CREATE ASSIGNMENT */
exports.createAssignment = async (req, res) => {
  try {
    const { courseId, lessonId, title, description, deadline, totalMarks } =
      req.body;
    if (!courseId || !title || !deadline)
      return res
        .status(400)
        .json({ message: "courseId, title and deadline required" });

    let fileUrl = req.file?.path || "";

    const assignment = await Assignment.create({
      course: courseId,
      lesson: lessonId || null,
      title,
      description: description || "",
      deadline,
      totalMarks: totalMarks || 100,
      createdBy: req.user.id,
      fileUrl,
    });  
res.status(201).json({ message: "Assignment created successfully", assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET ASSIGNMENTS BY COURSE */
exports.getAssignmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;
    const assignments = await Assignment.find({ course: courseId })
      .sort({ deadline: 1 })
      .lean();

    for (let i = 0; i < assignments.length; i++) {
      const submission = await AssignmentSubmission.findOne({
        assignment: assignments[i]._id,
        student: studentId,
      });
      assignments[i].submission = submission
        ? {
            ...submission.toObject(),
            marks: submission.marks,
            feedback: submission.feedback,
            graded: submission.graded,
          }
        : null;
      const count = await AssignmentSubmission.countDocuments({
        assignment: assignments[i]._id,
      });
      assignments[i].submissionsCount = count;
    }

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* SUBMIT ASSIGNMENT (STUDENT) */
exports.submitAssignment = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "PDF file is required" });
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found" });

    const studentId = new mongoose.Types.ObjectId(req.user._id);

    if (new Date() > assignment.deadline)
      return res.status(400).json({ message: "Deadline has passed" });

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: assignment.course,
    });
    if (!enrollment)
      return res.status(403).json({ message: "Not enrolled in this course" });

    let submission = await AssignmentSubmission.findOne({
      student: studentId,
      assignment: assignmentId,
    });

    if (!submission) {
      submission = await AssignmentSubmission.create({
        student: studentId,
        assignment: assignmentId,
        fileUrl: req.file.path,
      });
    } else {
      if (submission.graded)
        return res
          .status(400)
          .json({ message: "Already graded. Cannot resubmit." });
      submission.fileUrl = req.file.path;
      await submission.save();
    }
    // ✅ ADD THIS LINE
await CourseCompletionService.evaluate(enrollment._id);

res.status(201).json
    ({ message: "Assignment submitted successfully", submission });
  } catch (error) {
    console.error("❌ Assignment error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* GET SUBMISSIONS */
exports.getSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const submissions = await AssignmentSubmission.find({
      assignment: assignmentId,
    }).populate("student", "name email");
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GRADE SUBMISSION */
exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { marks, feedback } = req.body;
    if (marks === undefined || marks === null)
      return res.status(400).json({ message: "Marks are required" });

    const submission =
      await AssignmentSubmission.findById(submissionId).populate("assignment");
    if (!submission)
      return res.status(404).json({ message: "Submission not found" });
    submission.marks = marks;
    submission.feedback = feedback || "";
    submission.graded = true;
    await submission.save();

    const studentId = submission.student;
    const courseId = submission.assignment.course;
    const assignments = await Assignment.find({ course: courseId });
    const assignmentIds = assignments.map((a) => a._id);

    const gradedSubs = await AssignmentSubmission.find({
      student: studentId,
      assignment: { $in: assignmentIds },
      graded: true,
    }).populate("assignment");

    let totalMarks = 0,
      earnedMarks = 0;
    gradedSubs.forEach((sub) => {
      totalMarks += sub.assignment.totalMarks || 100;
      earnedMarks += sub.marks || 0;
    });
    const assignmentProgress =
      totalMarks === 0
        ? 0
        : Number(((earnedMarks / totalMarks) * 20).toFixed(2));

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });
    if (enrollment) {
      enrollment.assignmentProgress = assignmentProgress;
      enrollment.overallProgress = Number(
        (
          enrollment.videoProgress +
          enrollment.quizProgress +
          assignmentProgress
        ).toFixed(2),
      );
      if (enrollment.overallProgress >= 100) enrollment.status = "completed";
      await enrollment.save();
    }

    res.status(200).json({
      message: "Graded & progress updated",
      submission,
      progress: {
        assignmentProgress,
        overallProgress: enrollment?.overallProgress,
      },
    });
  } catch (error) {
    console.error("❌ Grading error:", error);
    res.status(500).json({ message: error.message });
  }
};
/* GET SINGLE ASSIGNMENT */
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/* UPDATE ASSIGNMENT */
exports.updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    let updateData = {
      ...req.body,
    };

    // if new file uploaded
    if (req.file) {
      updateData.fileUrl = req.file.path;
    }

    const updated = await Assignment.findByIdAndUpdate(
      assignmentId,
      updateData,
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const deleted = await Assignment.findByIdAndDelete(assignmentId);

    if (!deleted) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.log("DELETE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

