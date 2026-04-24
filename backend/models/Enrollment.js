const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // ===== SRDS Progress Structure =====

    videoProgress: {
      type: Number,
      default: 0, // 50% weight
    },

    quizProgress: {
      type: Number,
      default: 0, // 30% weight (future)
    },

    assignmentProgress: {
      type: Number,
      default: 0, // 20% weight (future)
    },

    overallProgress: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
  },
  { timestamps: true }
);

// Prevent duplicate enrollment
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);