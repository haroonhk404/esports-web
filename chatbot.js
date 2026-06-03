// ===== Arena Bot — self-contained chat widget =====
// Har page pe include karo:  <script src="chatbot.js"></script>
// Backend endpoint: /.netlify/functions/chatbot
(function () {
  if (window.__arenaBotLoaded) return;
  window.__arenaBotLoaded = true;

  const ENDPOINT = "/.netlify/functions/chatbot";
  const BOT_NAME = "Arena Bot";
  const GREETING = "GG! 👋 Main Arena Bot hoon. Tournaments, registration ya leaderboard — kuch bhi poochho!";

  // ---------- Styles ----------
  const style = document.createElement("style");
  style.textContent = `
  .ebot-launcher{position:fixed;right:24px;bottom:24px;width:62px;height:62px;border:none;border-radius:50%;cursor:pointer;z-index:99998;background:linear-gradient(135deg,#00e0ff,#5b6cff);box-shadow:0 8px 30px rgba(0,224,255,.45);display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s}
  .ebot-launcher:hover{transform:scale(1.08);box-shadow:0 10px 40px rgba(0,224,255,.65)}
  .ebot-launcher svg{width:28px;height:28px}
  .ebot-launcher.ebot-hide{transform:scale(0);opacity:0;pointer-events:none}
  .ebot-panel{position:fixed;right:24px;bottom:24px;width:370px;max-width:calc(100vw - 32px);height:540px;max-height:calc(100vh - 48px);background:#0f1018;border:1px solid rgba(0,224,255,.25);border-radius:18px;z-index:99999;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.6);font-family:'Inter',system-ui,Arial,sans-serif;opacity:0;transform:translateY(20px) scale(.98);pointer-events:none;transition:opacity .25s,transform .25s}
  .ebot-panel.ebot-open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}
  .ebot-header{display:flex;align-items:center;gap:10px;padding:14px 16px;background:linear-gradient(135deg,rgba(0,224,255,.14),rgba(91,108,255,.14));border-bottom:1px solid rgba(255,255,255,.06)}
  .ebot-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#00e0ff,#5b6cff);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
  .ebot-title{font-weight:700;color:#fff;font-size:15px;letter-spacing:.5px;line-height:1.1}
  .ebot-status{font-size:11px;color:#7CFFB2;display:flex;align-items:center;gap:5px;margin-top:3px}
  .ebot-dot{width:7px;height:7px;border-radius:50%;background:#22e07b;box-shadow:0 0 8px #22e07b;animation:ebot-pulse 1.6s infinite}
  @keyframes ebot-pulse{0%,100%{opacity:1}50%{opacity:.4}}
  .ebot-close{margin-left:auto;background:none;border:none;color:#9aa;cursor:pointer;font-size:22px;line-height:1;padding:2px 6px;border-radius:8px}
  .ebot-close:hover{color:#fff;background:rgba(255,255,255,.08)}
  .ebot-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;background:#0b0c12}
  .ebot-body::-webkit-scrollbar{width:6px}
  .ebot-body::-webkit-scrollbar-thumb{background:rgba(0,224,255,.3);border-radius:3px}
  .ebot-msg{max-width:82%;padding:10px 13px;border-radius:14px;font-size:14px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}
  .ebot-bot{align-self:flex-start;background:#1a1c28;color:#e6e8f0;border-bottom-left-radius:4px}
  .ebot-user{align-self:flex-end;background:linear-gradient(135deg,#00e0ff,#5b6cff);color:#06121a;font-weight:500;border-bottom-right-radius:4px}
  .ebot-typing{align-self:flex-start;background:#1a1c28;padding:13px 15px;border-radius:14px;display:flex;gap:5px}
  .ebot-typing span{width:7px;height:7px;border-radius:50%;background:#5b6cff;animation:ebot-bounce 1.2s infinite}
  .ebot-typing span:nth-child(2){animation-delay:.2s}
  .ebot-typing span:nth-child(3){animation-delay:.4s}
  @keyframes ebot-bounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-5px);opacity:1}}
  .ebot-footer{display:flex;gap:8px;padding:12px;border-top:1px solid rgba(255,255,255,.06);background:#0f1018}
  .ebot-input{flex:1;background:#191b26;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:11px 13px;color:#fff;font-size:14px;outline:none;resize:none;font-family:inherit;max-height:90px;line-height:1.4}
  .ebot-input:focus{border-color:rgba(0,224,255,.5)}
  .ebot-send{background:linear-gradient(135deg,#00e0ff,#5b6cff);border:none;border-radius:12px;width:46px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .ebot-send:hover{filter:brightness(1.12)}
  .ebot-send:disabled{opacity:.5;cursor:not-allowed}
  .ebot-send svg{width:20px;height:20px}
  @media(max-width:480px){.ebot-panel{right:8px;bottom:8px;width:calc(100vw - 16px);height:calc(100vh - 90px)}.ebot-launcher{right:16px;bottom:16px}}
  `;
  document.head.appendChild(style);

  // ---------- DOM ----------
  const launcher = document.createElement("button");
  launcher.className = "ebot-launcher";
  launcher.setAttribute("aria-label", "Chat kholo");
  launcher.innerHTML = `<svg viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.9-.9L3 21l1.9-5.6A8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" stroke="#06121a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const panel = document.createElement("div");
  panel.className = "ebot-panel";
  panel.innerHTML = `
    <div class="ebot-header">
      <div class="ebot-avatar">🎮</div>
      <div>
        <div class="ebot-title">${BOT_NAME}</div>
        <div class="ebot-status"><span class="ebot-dot"></span>Online</div>
      </div>
      <button class="ebot-close" aria-label="Band karo">&times;</button>
    </div>
    <div class="ebot-body" id="ebot-body"></div>
    <div class="ebot-footer">
      <textarea class="ebot-input" id="ebot-input" rows="1" placeholder="Apna message likho..."></textarea>
      <button class="ebot-send" id="ebot-send" aria-label="Bhejo">
        <svg viewBox="0 0 24 24" fill="none"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#06121a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>`;

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  const body = panel.querySelector("#ebot-body");
  const input = panel.querySelector("#ebot-input");
  const sendBtn = panel.querySelector("#ebot-send");
  let greeted = false;

  // ---------- Helpers ----------
  function scrollDown() { body.scrollTop = body.scrollHeight; }

  function addMessage(text, who) {
    const div = document.createElement("div");
    div.className = "ebot-msg " + (who === "user" ? "ebot-user" : "ebot-bot");
    div.textContent = text;
    body.appendChild(div);
    scrollDown();
  }

  function showTyping() {
    const t = document.createElement("div");
    t.className = "ebot-typing";
    t.id = "ebot-typing";
    t.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(t);
    scrollDown();
  }
  function hideTyping() {
    const t = document.getElementById("ebot-typing");
    if (t) t.remove();
  }

  async function send() {
    const msg = input.value.trim();
    if (!msg) return;
    addMessage(msg, "user");
    input.value = "";
    input.style.height = "auto";
    sendBtn.disabled = true;
    showTyping();

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      hideTyping();
      addMessage(data.reply || data.error || "Kuch gadbad ho gayi.", "bot");
    } catch (e) {
      hideTyping();
      addMessage("Network error — dobara try karo.", "bot");
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }

  function openPanel() {
    panel.classList.add("ebot-open");
    launcher.classList.add("ebot-hide");
    if (!greeted) { addMessage(GREETING, "bot"); greeted = true; }
    input.focus();
  }
  function closePanel() {
    panel.classList.remove("ebot-open");
    launcher.classList.remove("ebot-hide");
  }

  // ---------- Events ----------
  launcher.addEventListener("click", openPanel);
  panel.querySelector(".ebot-close").addEventListener("click", closePanel);
  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  });
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 90) + "px";
  });
})();