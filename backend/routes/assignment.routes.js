const express = require("express");
const { protect, authorize } = require("../middleware/auth.middleware");
const { pdfParser } = require("../middleware/upload"); // <-- destructure pdfParser
const {
  createAssignment,
  getAssignmentsByCourse,
  submitAssignment,
  getSubmissions,
  getAssignmentById,
  updateAssignment,
  deleteAssignment
} = require("../controllers/assignment.controller");
const { gradeSubmission } = require("../controllers/assignment.controller");

const router = express.Router();

/* TEACHER: Create assignment */
router.post("/create", protect, authorize("teacher"), pdfParser.single("file"), createAssignment);

// Get all assignments for a course (Student)
router.get("/course/:courseId", protect, getAssignmentsByCourse);

/* STUDENT: Submit assignment */
router.post("/submit/:assignmentId", protect, authorize("student"), pdfParser.single("file"), submitAssignment);

/* TEACHER: Get all submissions */
router.get("/:assignmentId/submissions", protect, authorize("teacher"), getSubmissions);

/* TEACHER: Grade submission */
router.put(
  "/grade/:submissionId",
  protect,
  authorize("teacher"),
  gradeSubmission
);

// GET single assignment (for edit screen)
router.get("/:assignmentId", protect, getAssignmentById);

// UPDATE assignment
router.put(
  "/:assignmentId",
  protect,
  authorize("teacher"),
  pdfParser.single("file"),
  updateAssignment
);

router.delete(
  "/:assignmentId",
  protect,
  authorize("teacher"),
  deleteAssignment
);

module.exports = router;