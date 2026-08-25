

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";


const SYSTEM_INSTRUCTION = `You are "GLB Assistant", the friendly help chatbot for GLB Mafia, ` +
  `a website where students share and find study resources (Notes, Assignments, PYQs, ` +
  `Syllabus, and Lab Manuals) organised by Year, Branch, Subject and Unit. ` +
  `You also know about the Faculty page and the Fee Structure page. ` +
  `Help users navigate the site (e.g. "Home > Add Resource" to upload a file, ` +
  `or Year -> Branch -> Resource Type -> Subject -> Unit to browse), answer study ` +
  `related questions, and be concise, friendly, and encouraging. ` +
  `If you don't know something about this specific website, say so honestly ` +
  `instead of making it up.`;

/**
 * Send a chat message to Gemini and get a text reply back.
 *
 * @param {string} message - The latest user message.
 * @param {Array<{role: "user"|"model", text: string}>} history - Prior turns (optional).
 * @returns {Promise<string>} The model's reply text.
 */
async function askGemini(message, history = []) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const err = new Error(
      "GEMINI_API_KEY is not set. Add it to your .env file to enable the chatbot."
    );
    err.code = "NO_API_KEY";
    throw err;
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;


  const contents = [];

  for (const turn of history) {
    if (!turn || !turn.text) continue;
    const role = turn.role === "model" ? "model" : "user";
    contents.push({ role, parts: [{ text: String(turn.text) }] });
  }

  contents.push({ role: "user", parts: [{ text: String(message) }] });

  const body = {
    contents,
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
    },
  };

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    const err = new Error(`Could not reach Gemini API: ${networkErr.message}`);
    err.code = "NETWORK_ERROR";
    throw err;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const apiMessage = data?.error?.message || `HTTP ${response.status}`;
    const err = new Error(`Gemini API error: ${apiMessage}`);
    err.code = "API_ERROR";
    err.status = response.status;
    throw err;
  }

  const candidate = data?.candidates?.[0];

  if (!candidate) {
    const blockReason = data?.promptFeedback?.blockReason;
    if (blockReason) {
      return "I can't respond to that. Could you rephrase your question?";
    }
    const err = new Error("Gemini API returned no candidates");
    err.code = "EMPTY_RESPONSE";
    throw err;
  }

  const text = candidate?.content?.parts?.map((p) => p.text || "").join("").trim();

  if (!text) {
    return "Sorry, I couldn't generate a response for that. Could you try rephrasing?";
  }

  return text;
}

module.exports = { askGemini };
