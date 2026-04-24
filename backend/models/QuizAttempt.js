const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionIndex: Number,
  selectedOption: Number,
});

const quizAttemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    answers: [answerSchema],
    score: {
      type: Number,
      default: 0,
    },
    attemptNumber: {
      type: Number,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);