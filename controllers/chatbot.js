const { askGemini } = require("../utils/gemini.js");

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_TURNS = 12; 

module.exports.sendMessage = async (req, res) => {
  const { message } = req.body;
  let { history } = req.body;

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Please type a message first." });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return res
      .status(400)
      .json({ error: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters).` });
  }

  if (!Array.isArray(history)) {
    history = [];
  }
  history = history
    .filter((h) => h && typeof h.text === "string" && (h.role === "user" || h.role === "model"))
    .slice(-MAX_HISTORY_TURNS);

  try {
    const reply = await askGemini(message.trim(), history);
    return res.json({ reply });
  } catch (err) {
    console.error("Chatbot error:", err.message);

    if (err.code === "NO_API_KEY") {
      return res.status(503).json({
        error:
          "The chatbot isn't configured yet. Ask the site admin to set GEMINI_API_KEY in the .env file.",
      });
    }

    if (err.status === 429) {
      return res.status(429).json({
        error: "The chatbot is getting a lot of requests right now. Please try again in a moment.",
      });
    }

    if (err.status === 400 || err.status === 404) {
      return res.status(502).json({
        error:
          "The chatbot's AI service rejected the request (check GEMINI_API_KEY / GEMINI_MODEL). Try again later.",
      });
    }

    return res.status(502).json({
      error: "Sorry, the chatbot is temporarily unavailable. Please try again later.",
    });
  }
};
