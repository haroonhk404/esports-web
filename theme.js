/* ============================================================
   THEME.JS — Light/Dark Theme Manager
   Saari pages isko include karti hain
   
   Features:
   - Light/Dark toggle
   - localStorage persistence (aupubg_theme)
   - Smooth transition
   - Theme button in nav
   ============================================================ */

const THEME_KEY = 'aupubg_theme';

// Apply theme to <html> root
window.applyTheme = function(theme) {
  if (theme !== 'light' && theme !== 'dark') theme = 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  updateThemeButton(theme);
};

function updateThemeButton(theme) {
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.innerText = theme === 'light' ? '☀️' : '🌙';
    btn.setAttribute('title', theme === 'light' ? 'Switch to Dark' : 'Switch to Light');
  }
}

function toggleTheme() {
  const current = localStorage.getItem(THEME_KEY) || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  window.applyTheme(next);
}

// Init — apply saved theme immediately on page load
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  window.applyTheme(saved);
  
  // Bind toggle button
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.addEventListener('click', toggleTheme);
  }
}

// Run as early as possible to avoid flash
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTheme);
} else {
  initTheme();
}

// Apply theme attribute immediately on script load (before DOM ready)
// Prevents "flash of wrong theme"
(function() {
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
})();

/* ============================================================
   ACCOUNT NAV — Session-aware Login/Profile button
   https://aupubg.rf.gd/backend/session_check.php se current user check karta hai.
   Logged-in  -> button "▣ USERNAME" dikhata hai, profile.html pe le jaata hai
   Logged-out -> button "LOGIN" dikhata hai, login.html pe le jaata hai
   (XAMPP localhost pe kaam karta hai; Netlify static pe gracefully LOGIN reh jaata hai)
   ============================================================ */
function initAccountNav() {
  const btn = document.getElementById('navAccountBtn');
  if (!btn) return;

  fetch('https://aupubg.rf.gd/backend/session_check.php', { credentials: 'same-origin' })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      if (data && data.loggedIn && data.user) {
        const name = data.user.full_name || data.user.username || 'PROFILE';
        btn.innerHTML = '▣ ' + name.toUpperCase();
        btn.setAttribute('href', 'profile.html');
        btn.classList.add('logged-in');
      } else {
        btn.innerText = 'LOGIN';
        btn.setAttribute('href', 'login.html');
      }
    })
    .catch(() => {
      // Backend reachable nahi (e.g. Netlify static) — default LOGIN
      btn.innerText = 'LOGIN';
      btn.setAttribute('href', 'login.html');
    });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAccountNav);
} else {
  initAccountNav();
}



