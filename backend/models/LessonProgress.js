const mongoose = require("mongoose");

const lessonProgressSchema = new mongoose.Schema(
{
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lesson",
    required: true,
  },
  course: {                     // ✅ Added course field
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  watchPercentage: {
    type: Number,
    default: 0,
  },

  completed: {
    type: Boolean,
    default: false,
  },
},
{ timestamps: true }
);

lessonProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model("LessonProgress", lessonProgressSchema);