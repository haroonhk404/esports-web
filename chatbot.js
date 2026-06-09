/* ============================================================
   CHATBOT.JS — Shared Chatbot Logic with Gemini AI
   Saari pages isko include karti hain
   
   Features:
   - Real Gemini AI responses (via backend PHP)
   - Fallback to local keyword responses if API fails
   - Typing indicator animation
   ============================================================ */

// ============================================================
// FALLBACK RESPONSES (Agar API fail ho ya XAMPP off ho)
// ============================================================
function fallbackReply(q) {
  const lower = q.toLowerCase();
  if (/register|join|sign.?up|enlist/.test(lower))
    return 'Squad enlist karne ke liye:<br>1️⃣ Register page par jaao<br>2️⃣ Form bharo + MetaMask sign<br>3️⃣ NFT Squad Pass mint hoga FREE mein! ✅';
  if (/prize|paisa|reward|payout|inaam/.test(lower))
    return 'Prize Pool: <b>5.0 ETH</b><br>🥇 1st: 2.5 ETH<br>🥈 2nd: 1.5 ETH<br>🥉 3rd: 1.0 ETH';
  if (/rule|nizam|qanoon/.test(lower))
    return 'Rules: TPP Squad mode, Asia server, 12 matches, points = kills + placement bonus. Cheating = instant DQ. ⚠️';
  if (/metamask|wallet|crypto/.test(lower))
    return 'MetaMask install karo from <b>metamask.io</b>, phir top-right "CONNECT WALLET" click karo. NFT mint FREE hai (no gas needed)! 🦊';
  if (/date|kab|schedule|when/.test(lower))
    return 'Drop date: <b>15 June 2026, 18:00 PKT</b>. Registration 7 din pehle close hoti hai. 📅';
  if (/map|where|battleground/.test(lower))
    return '🌾 Erangel (4 matches)<br>🏜️ Miramar (4 matches)<br>🌴 Sanhok (4 matches)<br>Total 12 matches.';
  if (/salam|hello|hi|hey|asalam/.test(lower))
    return 'Walaikum Assalam, soldier! 🎯 Kya help chahiye?';
  if (/thank|shukria|thanks/.test(lower))
    return 'Welcome bhai! 🔥 Tournament mein WP karna!';
  if (/contact|support|help/.test(lower))
    return 'Support:<br>📱 Discord: discord.gg/aupubg<br>📧 Email: support@aupubg.io<br>Response in 24 hours.';
  return 'Topics jo main help kar sakta hoon:<br>▸ Registration<br>▸ Prize pool<br>▸ Rules<br>▸ MetaMask<br>▸ Schedule<br>▸ Maps<br>▸ Contact';
}

// ============================================================
// MAIN CHATBOT INITIALIZATION
// ============================================================
function initChatbot() {
  const chatbot = document.getElementById('chatbot');
  const chatToggle = document.getElementById('chatToggle');
  const chatBadge = document.getElementById('chatBadge');
  const cbBody = document.getElementById('cbBody');
  const cbInput = document.getElementById('cbInput');
  const cbSend = document.getElementById('cbSend');
  const cbClose = document.getElementById('cbClose');

  if (!chatbot || !chatToggle) return;

  // Toggle chatbot
  function toggleChat() {
    chatbot.classList.toggle('open');
    if (chatBadge) {
      chatBadge.style.display = chatbot.classList.contains('open') ? 'none' : 'grid';
    }
  }
  chatToggle.addEventListener('click', toggleChat);
  if (cbClose) cbClose.addEventListener('click', toggleChat);

  // Add message
  function addMsg(text, type) {
    const m = document.createElement('div');
    m.className = 'msg ' + type;
    m.innerHTML = text;
    cbBody.appendChild(m);
    cbBody.scrollTop = cbBody.scrollHeight;
    return m;
  }

  // Typing indicator
  function showTyping() {
    const m = document.createElement('div');
    m.className = 'msg bot msg-typing';
    m.id = 'typingIndicator';
    m.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    cbBody.appendChild(m);
    cbBody.scrollTop = cbBody.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById('typingIndicator');
    if (t) t.remove();
  }

  // Call backend Gemini API
  async function getAIReply(userMessage) {
    try {
      const response = await fetch('https://aupubg.rf.gd/backend/chatbot_api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      const result = await response.json();

      if (result.success && result.reply) {
        let reply = result.reply
          .replace(/\n\n/g, '<br><br>')
          .replace(/\n/g, '<br>')
          .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        return reply;
      } else {
        console.log('AI API fallback:', result.error);
        return fallbackReply(userMessage);
      }
    } catch (error) {
      console.log('Backend not reachable, using fallback:', error);
      return fallbackReply(userMessage);
    }
  }

  // Send message
  async function sendMessage() {
    const q = cbInput.value.trim();
    if (!q) return;

    addMsg(q, 'user');
    cbInput.value = '';
    cbInput.disabled = true;

    showTyping();
    const reply = await getAIReply(q);
    removeTyping();
    addMsg(reply, 'bot');

    cbInput.disabled = false;
    cbInput.focus();
  }

  if (cbSend) cbSend.addEventListener('click', sendMessage);
  if (cbInput) {
    cbInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  document.querySelectorAll('.suggest-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      cbInput.value = btn.dataset.q;
      sendMessage();
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatbot);
} else {
  initChatbot();
}



