const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

exports.generateAIResponse = async (messages) => {
  try {
    console.log("=== GROQ REQUEST START ===");
    console.log("Messages:", messages);

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: messages, // ✅ must be ARRAY of {role, content}
      temperature: 0.7,
      max_tokens: 400,
    });

    const reply = completion.choices[0]?.message?.content;

    console.log("=== GROQ SUCCESS ===");

    return reply;
  } catch (error) {
    console.log("=== GROQ ERROR ===", error.response?.data || error.message);

    return "AI is temporarily unavailable.";
  }
};