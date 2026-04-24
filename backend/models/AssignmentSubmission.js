const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    fileUrl: { type: String, required: true }, // PDF uploaded by student
    submittedAt: { type: Date, default: Date.now },

  // ✅ NEW: GRADING SYSTEM
    marks: { type: Number, default: null },
    feedback: { type: String, default: "" },
    graded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

submissionSchema.index({ student: 1, assignment: 1 }, { unique: true }); // Prevent resubmission

module.exports = mongoose.model("AssignmentSubmission", submissionSchema);