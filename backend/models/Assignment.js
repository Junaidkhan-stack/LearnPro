const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },

    title: { type: String, required: true },
    description: { type: String },

    deadline: { type: Date, required: true },

    totalMarks: { // 🔥 NEW (IMPORTANT)
      type: Number,
      default: 100,
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    fileUrl: { type: String }, // teacher file
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);