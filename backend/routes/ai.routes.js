const express = require("express");
const router = express.Router();

const { chatWithAI, getChatHistory } = require("../controllers/ai.controller");
const { protect } = require("../middleware/auth.middleware");

// 💬 AI Chat with history
router.post("/chat", protect, chatWithAI);

router.get("/chat", protect, getChatHistory);

module.exports = router;