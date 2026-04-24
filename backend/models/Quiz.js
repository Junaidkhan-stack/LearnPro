const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [
    {
      type: String,
      required: true,
    },
  ],
  correctAnswer: {
    type: Number,
    required: true,
  },
});

const quizSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: false,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },

    // ✅ PER QUESTION TIME (seconds)
    timeLimit: {
      type: Number,
      default: 30,
    },

    // ✅ ONLY 1 ATTEMPT (production)
    maxAttempts: {
      type: Number,
      default: 1,
    },

    // ✅ TEACHER CONTROL MARKS
    totalMarks: {
      type: Number,
      default: 100,
    },

    deadline: {
      type: Date,
      default: null,
    },

    marks: {
      type: Number,
      default: 1,
    },

    questions: [questionSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Quiz", quizSchema);
