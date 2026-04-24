const AIChat = require("../models/AIChat");
const { generateAIResponse } = require("../services/ai.service");

exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    console.log("=== AI CHAT REQUEST ===");
    console.log("User:", userId);
    console.log("Message:", message);

    if (!message) {
      return res.status(400).json({ message: "Message required" });
    }

    // ✅ FIXED: use userId (not user)
    let chat = await AIChat.findOne({ userId });

    if (!chat) {
      chat = new AIChat({
        userId,
        messages: [],
      });
    }

    chat.messages.push({
      role: "user",
      content: message,
    });

    const recentMessages = chat.messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    console.log("Sending to AI:", recentMessages);

    const aiReply = await generateAIResponse(recentMessages);

    chat.messages.push({
      role: "assistant",
      content: aiReply,
    });

    await chat.save();

    res.json({
      reply: aiReply,
      messages: chat.messages,
    });
  } catch (error) {
    console.log("AI ERROR:", error);
    res.status(500).json({ message: "AI failed" });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const chat = await AIChat.findOne({ userId });

    if (!chat) {
      return res.json({ messages: [] });
    }

    return res.json({ messages: chat.messages });
  } catch (error) {
    console.log("GET CHAT ERROR:", error);
    res.status(500).json({ message: "Failed to load chat history" });
  }
};