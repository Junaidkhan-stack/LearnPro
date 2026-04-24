const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const Enrollment = require("../models/Enrollment");
const CourseCompletionService = require("../services/courseCompletion.service");

/* =====================================
GET QUIZ BY LESSON
===================================== */
exports.getQuizByLesson = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      lesson: req.params.lessonId,
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================
GET QUIZZES BY COURSE
===================================== */
exports.getQuizByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.user._id;

    if (!courseId || courseId.length !== 24) {
      return res.status(400).json({
        message: "Invalid courseId",
      });
    }

    const quizzes = await Quiz.find({ course: courseId }).lean();

    for (let i = 0; i < quizzes.length; i++) {
      const attempts = await QuizAttempt.find({
        quiz: quizzes[i]._id,
        student: studentId,
      });

      quizzes[i].attemptCount = attempts.length;

      const completedAttempt = attempts.find((a) => a.completed);
      quizzes[i].isCompleted = !!completedAttempt;

      const activeAttempt = attempts.find((a) => !a.completed);
      quizzes[i].hasActiveAttempt = !!activeAttempt;

      quizzes[i].lastScore = completedAttempt
        ? Math.round(completedAttempt.score)
        : null;

      quizzes[i].isExpired =
        quizzes[i].deadline &&
        new Date() > new Date(quizzes[i].deadline);
    }

    return res.json(quizzes);
  } catch (error) {
    console.log("❌ ERROR:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

/* =====================================
🔥 NEW: GET QUIZ BY ID
===================================== */
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================
START QUIZ
===================================== */
exports.startQuiz = async (req, res) => {
  try {
    const quizId = req.params.quizId;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // ✅ deadline check
    if (quiz.deadline && new Date() > new Date(quiz.deadline)) {
      return res.status(403).json({
        message: "Quiz deadline has passed",
      });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: quiz.course,
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "Not enrolled in this course",
      });
    }

    const attempts = await QuizAttempt.countDocuments({
      student: req.user._id,
      quiz: quiz._id,
    });

    if (attempts >= 1) {
      return res.status(400).json({
        message: "You can only attempt this quiz once",
      });
    }

    const attempt = await QuizAttempt.create({
      student: req.user._id,
      quiz: quiz._id,
      attemptNumber: 1,
      startTime: new Date(),
    });

    const questions = quiz.questions.map((q) => ({
      question: q.question,
      options: q.options,
    }));

    const totalTime = quiz.questions.length * (quiz.timeLimit || 30);

    return res.status(200).json({
      attemptId: attempt._id,
      questions,
      timeLimit: totalTime,
      quizId: quiz._id,
      title: quiz.title,
    });
  } catch (error) {
    console.log("❌ START QUIZ ERROR:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

/* =====================================
SUBMIT QUIZ
===================================== */
exports.submitQuiz = async (req, res) => {
  try {
    const { answers, attemptId } = req.body;

    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    if (attempt.completed) {
      return res.status(400).json({
        message: "Quiz already submitted",
      });
    }

    const totalAllowedTime =
      quiz.questions.length * (quiz.timeLimit || 30);

    const timeTaken =
      (new Date() - new Date(attempt.startTime)) / 1000;

    if (timeTaken > totalAllowedTime) {
      attempt.answers = [];
      attempt.score = 0;
      attempt.completed = true;
      await attempt.save();

      return res.json({
        message: "Time exceeded. Auto-submitted.",
        score: 0,
      });
    }

    let correct = 0;

    quiz.questions.forEach((q, index) => {
      const ans = answers.find((a) => a.questionIndex === index);
      if (ans && ans.selectedOption === q.correctAnswer) {
        correct++;
      }
    });

    const rawScore =
      (correct / quiz.questions.length) *
      (quiz.totalMarks || 100);

    const score = Math.round(rawScore);

    attempt.answers = answers;
    attempt.score = score;
    attempt.completed = true;

    await attempt.save();

    const studentId = req.user._id;

    const quizzes = await Quiz.find({ course: quiz.course }).select(
      "_id totalMarks"
    );

    const completedAttempts = await QuizAttempt.find({
      student: studentId,
      quiz: { $in: quizzes.map((q) => q._id) },
      completed: true,
    });

    let totalMarks = 0;
    let earnedMarks = 0;

    quizzes.forEach((q) => {
      totalMarks += q.totalMarks || 100;
      const attempt = completedAttempts.find(
        (a) => a.quiz.toString() === q._id.toString()
      );
      earnedMarks += attempt ? attempt.score || 0 : 0;
    });

    const quizProgress =
      totalMarks === 0
        ? 0
        : Number(((earnedMarks / totalMarks) * 30).toFixed(2));

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: quiz.course,
    });

    if (enrollment) {
      enrollment.quizProgress = quizProgress;

      enrollment.overallProgress = Number(
        (
          enrollment.videoProgress +
          enrollment.assignmentProgress +
          quizProgress
        ).toFixed(2)
      );

      await enrollment.save();
      await CourseCompletionService.evaluate(enrollment._id);
    }

    res.json({
      score,
      correctAnswers: correct,
      totalQuestions: quiz.questions.length,
      progress: {
        quizProgress,
        overallProgress: enrollment?.overallProgress,
      },
    });
  } catch (error) {
    console.log("❌ submit error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================
CREATE QUIZ
===================================== */
exports.createQuiz = async (req, res) => {
  try {
    // 🔥 FIXED: added deadline
    const { courseId, title, timeLimit, totalMarks, deadline } =
      req.body;

    if (!courseId) {
      return res
        .status(400)
        .json({ message: "courseId is required" });
    }

    const quiz = await Quiz.create({
      course: courseId,
      lesson: null,
      title,
      timeLimit: timeLimit || 30,
      totalMarks: totalMarks || 100,
      maxAttempts: 1,
      deadline: deadline ? new Date(deadline) : null, // 🔥 FIXED
      questions: [],
    });

    res.status(201).json({ quiz });
  } catch (error) {
    console.log("CREATE QUIZ ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================
ADD QUESTIONS
===================================== */
exports.addQuestions = async (req, res) => {
  try {
    const { questions } = req.body;
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    quiz.questions.push(...questions);
    await quiz.save();

    res.status(200).json({ quiz });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================
UPDATE QUIZ
===================================== */
exports.updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { title, deadline, timeLimit, totalMarks } = req.body;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (title !== undefined) quiz.title = title;

    if (deadline !== undefined) {
      quiz.deadline =
        deadline && deadline !== ""
          ? new Date(deadline)
          : null;
    }

    if (timeLimit !== undefined) quiz.timeLimit = timeLimit;
    if (totalMarks !== undefined) quiz.totalMarks = totalMarks;

    await quiz.save();

    res.json({
      message: "Quiz updated successfully",
      quiz,
    });
  } catch (error) {
    console.log("❌ UPDATE QUIZ ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================
🔥 NEW: DELETE QUIZ
===================================== */
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    await quiz.deleteOne();

    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================
🔥 NEW: REPLACE QUESTIONS (UPDATE)
===================================== */
exports.updateQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questions } = req.body;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // ✅ replace completely (no duplication)
    quiz.questions = questions.map((q) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      marks: q.marks || 1,
    }));

    // ✅ recalc totalMarks
    quiz.totalMarks = quiz.questions.reduce(
      (sum, q) => sum + (q.marks || 1),
      0
    );

    await quiz.save();

    res.json({ message: "Questions updated", quiz });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
