const express = require("express");
const router = express.Router({ mergeParams: true });
const rateLimit = require("express-rate-limit");

const { sendMessage } = require("../controllers/chatbot.js");
const wrapAsync = require("../utils/wrapAsync.js");


const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many messages -- please slow down and try again shortly." },
});

router.post("/message", chatLimiter, wrapAsync(sendMessage));

module.exports = router;
