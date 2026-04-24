const express = require("express");
const router = express.Router();

const quizController = require("../controllers/quiz.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

/* ================= QUIZ ROUTES ================= */

router.get("/course/:courseId", protect, quizController.getQuizByCourse);

router.get("/lesson/:lessonId", protect, quizController.getQuizByLesson);

router.post("/start/:quizId", protect, quizController.startQuiz);

router.post("/submit/:quizId", protect, quizController.submitQuiz);

router.post("/create", quizController.createQuiz);
router.post("/add-questions/:quizId", quizController.addQuestions);
router.get("/:quizId", protect, quizController.getQuizById);
router.put("/:quizId", protect, quizController.updateQuiz);
router.delete("/:quizId", protect, quizController.deleteQuiz);
router.put("/:quizId/questions", protect, quizController.updateQuestions);



module.exports = router;
