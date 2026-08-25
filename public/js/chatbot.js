(function () {
  const toggleBtn = document.getElementById("gemini-chat-toggle");
  const panel = document.getElementById("gemini-chat-panel");
  const closeBtn = document.getElementById("gemini-chat-close");
  const messagesEl = document.getElementById("gemini-chat-messages");
  const form = document.getElementById("gemini-chat-form");
  const input = document.getElementById("gemini-chat-input");
  const sendBtn = document.getElementById("gemini-chat-send");

  if (!toggleBtn || !panel || !form) return;

  // In-memory conversation history for this page session (role: "user"|"model").
  let history = [];
  let isSending = false;

  function appendMessage(text, cssClass) {
    const bubble = document.createElement("div");
    bubble.className = "gemini-msg " + cssClass;
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubble;
  }

  function openPanel() {
    panel.classList.add("open");
    if (messagesEl.children.length === 0) {
      appendMessage(
        "Hi! I'm GLB Assistant \u2014 ask me anything about finding notes, PYQs, the fee structure, or your studies.",
        "bot"
      );
    }
    input.focus();
  }

  function closePanel() {
    panel.classList.remove("open");
  }

  toggleBtn.addEventListener("click", function () {
    if (panel.classList.contains("open")) {
      closePanel();
    } else {
      openPanel();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closePanel);
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || isSending) return;

    appendMessage(text, "user");
    input.value = "";
    isSending = true;
    sendBtn.disabled = true;

    const typingBubble = appendMessage("GLB Assistant is typing...", "typing");

    try {
      const res = await fetch("/chatbot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: history }),
      });

      const data = await res.json().catch(() => ({}));

      typingBubble.remove();

      if (!res.ok) {
        appendMessage(data.error || "Something went wrong. Please try again.", "error");
      } else {
        appendMessage(data.reply, "bot");
        history.push({ role: "user", text: text });
        history.push({ role: "model", text: data.reply });
        // Keep history from growing unbounded on long-lived pages.
        if (history.length > 24) {
          history = history.slice(-24);
        }
      }
    } catch (err) {
      typingBubble.remove();
      appendMessage("Network error \u2014 couldn't reach the chatbot. Please try again.", "error");
    } finally {
      isSending = false;
      sendBtn.disabled = false;
      input.focus();
    }
  });
})();
