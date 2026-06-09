/* ============================================================
   WALLET.JS — Shared Wallet Connection Logic
   Saari pages isko include karti hain
   
   Features:
   - localStorage mein wallet save karta hai (pages switch karne par yaad rahe)
   - MetaMask installed na ho to proper error dialog
   - User reject kare to proper error dialog
   - NO demo wallet auto-generate (jo pehle problem thi)
   ============================================================ */

const WALLET_STORAGE_KEY = 'aupubg_wallet_address';

// ============================================================
// MAIN WALLET STATE
// ============================================================
window.walletAddress = localStorage.getItem(WALLET_STORAGE_KEY) || null;

// ============================================================
// DIALOG MODAL — Show error/info messages
// ============================================================
function showWalletDialog(options) {
  // Remove existing dialog if any
  const existing = document.getElementById('walletDialog');
  if (existing) existing.remove();

  const {
    icon = '⚠️',
    title = 'WALLET REQUIRED',
    message = 'Please connect your MetaMask wallet to continue.',
    primaryBtn = 'CONNECT WALLET',
    secondaryBtn = 'CANCEL',
    onPrimary = null,
    onSecondary = null,
    type = 'warning' // warning, error, success, info
  } = options;

  const colors = {
    warning: '#f2a900',
    error:   '#c8102e',
    success: '#00d26a',
    info:    '#00b8d9'
  };
  const accentColor = colors[type] || colors.warning;

  const dialog = document.createElement('div');
  dialog.id = 'walletDialog';
  dialog.innerHTML = `
    <div class="wd-overlay">
      <div class="wd-box" style="border-color:${accentColor};border-top-color:${accentColor};">
        <div class="wd-corners" style="border-color:${accentColor};"></div>
        <div class="wd-icon" style="filter:drop-shadow(0 0 20px ${accentColor});">${icon}</div>
        <h3 class="wd-title" style="color:${accentColor};">${title}</h3>
        <p class="wd-message">${message}</p>
        <div class="wd-actions">
          ${secondaryBtn ? `<button class="wd-btn wd-btn-ghost" id="wdSecondary">${secondaryBtn}</button>` : ''}
          <button class="wd-btn wd-btn-primary" id="wdPrimary" style="background:${accentColor};">${primaryBtn}</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);

  // Animate in
  setTimeout(() => dialog.classList.add('wd-open'), 10);

  // Button handlers
  const closeDialog = () => {
    dialog.classList.remove('wd-open');
    setTimeout(() => dialog.remove(), 250);
  };

  document.getElementById('wdPrimary').addEventListener('click', async () => {
    closeDialog();
    if (onPrimary) await onPrimary();
  });

  if (secondaryBtn) {
    document.getElementById('wdSecondary').addEventListener('click', () => {
      closeDialog();
      if (onSecondary) onSecondary();
    });
  }

  // Click outside to close
  dialog.querySelector('.wd-overlay').addEventListener('click', (e) => {
    if (e.target.classList.contains('wd-overlay')) {
      closeDialog();
      if (onSecondary) onSecondary();
    }
  });
}

// ============================================================
// CONNECT WALLET — Strict mode, NO demo wallet
// ============================================================
async function connectWallet() {
  // Check MetaMask installed
  if (typeof window.ethereum === 'undefined') {
    showWalletDialog({
      icon: '🦊',
      title: 'METAMASK NOT INSTALLED',
      message: 'MetaMask extension required hai wallet connect karne ke liye.<br><br>Install karein from:<br><b style="color:#f2a900;">metamask.io</b><br><br>Install hone ke baad browser refresh karke wapas aaiye.',
      primaryBtn: 'GO TO METAMASK.IO',
      secondaryBtn: 'CLOSE',
      type: 'error',
      onPrimary: () => window.open('https://metamask.io/download/', '_blank')
    });
    return null;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts');
    }

    // Save to state + localStorage
    window.walletAddress = accounts[0];
    localStorage.setItem(WALLET_STORAGE_KEY, accounts[0]);
    
    // Update UI everywhere
    updateWalletUI();
    
    return accounts[0];

  } catch (error) {
    // User rejected
    if (error.code === 4001 || error.message?.includes('reject')) {
      showWalletDialog({
        icon: '✋',
        title: 'CONNECTION REJECTED',
        message: 'Aap ne wallet connection cancel kar di.<br><br>Continue karne ke liye MetaMask mein <b style="color:#f2a900;">"Connect"</b> click karna padega.',
        primaryBtn: 'TRY AGAIN',
        secondaryBtn: 'CANCEL',
        type: 'warning',
        onPrimary: () => connectWallet()
      });
    } else {
      // Other errors
      showWalletDialog({
        icon: '❌',
        title: 'CONNECTION FAILED',
        message: `Wallet connect nahi ho sakaa.<br><br>Error: <code style="color:#c8102e;font-size:12px;">${error.message || 'Unknown'}</code><br><br>Make sure MetaMask unlocked hai.`,
        primaryBtn: 'TRY AGAIN',
        secondaryBtn: 'CLOSE',
        type: 'error',
        onPrimary: () => connectWallet()
      });
    }
    return null;
  }
}

// ============================================================
// DISCONNECT WALLET
// ============================================================
function disconnectWallet() {
  window.walletAddress = null;
  localStorage.removeItem(WALLET_STORAGE_KEY);
  updateWalletUI();
}

// ============================================================
// UPDATE UI — Wallet button on every page
// ============================================================
function updateWalletUI() {
  const btn = document.getElementById('walletBtn');
  const textEl = document.getElementById('walletText');
  if (!btn || !textEl) return;

  if (window.walletAddress) {
    const short = window.walletAddress.slice(0, 6) + '...' + window.walletAddress.slice(-4);
    textEl.innerText = short.toUpperCase();
    btn.classList.add('connected');
  } else {
    textEl.innerText = 'CONNECT WALLET';
    btn.classList.remove('connected');
  }
}

// ============================================================
// REQUIRE WALLET — Use this before actions that need wallet
// Returns true if connected, false if not (and shows dialog)
// ============================================================
async function requireWallet() {
  if (window.walletAddress) {
    // Verify wallet still connected in MetaMask
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0 && accounts[0].toLowerCase() === window.walletAddress.toLowerCase()) {
          return true; // Still connected
        } else {
          // Wallet disconnected in MetaMask, clear storage
          disconnectWallet();
        }
      } catch (e) {
        // continue to show dialog
      }
    }
  }
  
  // Show dialog asking to connect
  return new Promise((resolve) => {
    showWalletDialog({
      icon: '🦊',
      title: 'WALLET CONNECTION REQUIRED',
      message: 'Iss action ke liye MetaMask wallet connect honi zaroori hai.<br><br>"Connect Wallet" click karke MetaMask se connect karein.',
      primaryBtn: 'CONNECT NOW',
      secondaryBtn: 'CANCEL',
      type: 'warning',
      onPrimary: async () => {
        const result = await connectWallet();
        resolve(!!result);
      },
      onSecondary: () => resolve(false)
    });
  });
}

// ============================================================
// AUTO-INIT — On page load
// ============================================================
async function initWallet() {
  // Update UI from localStorage
  updateWalletUI();

  // Verify wallet still connected in MetaMask
  if (window.walletAddress && typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0 || accounts[0].toLowerCase() !== window.walletAddress.toLowerCase()) {
        // MetaMask disconnected — clear our storage
        disconnectWallet();
      }
    } catch (e) {
      // Silent fail
    }
  }

  // Wallet button click handler
  const btn = document.getElementById('walletBtn');
  if (btn) {
    btn.addEventListener('click', async () => {
      if (window.walletAddress) {
        // Already connected — show disconnect option
        showWalletDialog({
          icon: '✅',
          title: 'WALLET CONNECTED',
          message: `Aap ka wallet connected hai:<br><br><code style="color:#f2a900;font-size:13px;word-break:break-all;">${window.walletAddress}</code><br><br>Kya disconnect karna chahte ho?`,
          primaryBtn: 'DISCONNECT',
          secondaryBtn: 'KEEP CONNECTED',
          type: 'success',
          onPrimary: () => disconnectWallet()
        });
      } else {
        await connectWallet();
      }
    });
  }

  // Listen for account changes from MetaMask
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        window.walletAddress = accounts[0];
        localStorage.setItem(WALLET_STORAGE_KEY, accounts[0]);
        updateWalletUI();
      }
    });
  }
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWallet);
} else {
  initWallet();
}



