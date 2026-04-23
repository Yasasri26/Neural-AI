// js/auth.js
// Frontend JavaScript for Login and Register pages
// Handles form submission, API calls, and token storage

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_BASE = '/api';

// ─── TAB SWITCHING ────────────────────────────────────────────────────────────
function switchTab(tab) {
  const loginPanel    = document.getElementById('panel-login');
  const registerPanel = document.getElementById('panel-register');
  const tabLogin      = document.getElementById('tab-login');
  const tabRegister   = document.getElementById('tab-register');
  const indicator     = document.getElementById('tab-indicator');

  if (tab === 'login') {
    loginPanel.classList.remove('hidden');
    registerPanel.classList.add('hidden');
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    indicator.classList.remove('right');
  } else {
    registerPanel.classList.remove('hidden');
    loginPanel.classList.add('hidden');
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    indicator.classList.add('right');
  }
  // Clear alerts when switching
  clearAlerts();
}

// ─── TOGGLE PASSWORD VISIBILITY ───────────────────────────────────────────────
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁';
  }
}

// ─── SHOW / HIDE ALERTS ───────────────────────────────────────────────────────
function showAlert(elementId, message, type = 'error') {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.className = `alert alert-${type}`;
  el.classList.remove('hidden');
}
function clearAlerts() {
  ['login-error','login-success','register-error','register-success']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
}

// ─── SET BUTTON LOADING STATE ─────────────────────────────────────────────────
function setLoading(btnId, isLoading) {
  const btn    = document.getElementById(btnId);
  const text   = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');
  btn.disabled = isLoading;
  if (isLoading) {
    text.classList.add('hidden');
    loader.classList.remove('hidden');
  } else {
    text.classList.remove('hidden');
    loader.classList.add('hidden');
  }
}

// ─── HANDLE LOGIN ─────────────────────────────────────────────────────────────
async function handleLogin() {
  // 1. Get form values
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  // 2. Basic client-side validation
  if (!email || !password) {
    showAlert('login-error', 'Please fill in all fields.');
    return;
  }

  setLoading('btn-login', true);
  clearAlerts();

  try {
    // 3. Send POST request to the login API
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      // Server returned an error (4xx or 5xx)
      showAlert('login-error', data.message || 'Login failed. Please try again.');
      return;
    }

    // 4. Login successful — store the token and user info in localStorage
    // localStorage persists even after the browser tab is closed
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));

    showAlert('login-success', 'Login successful! Redirecting...', 'success');

    // 5. Redirect to chat page after a short delay
    setTimeout(() => {
      window.location.href = '/chat.html';
    }, 800);

  } catch (error) {
    // Network error (server not running, etc.)
    showAlert('login-error', 'Cannot connect to server. Make sure the backend is running on port 5000.');
    console.error('Login error:', error);
  } finally {
    setLoading('btn-login', false);
  }
}

// ─── HANDLE REGISTER ──────────────────────────────────────────────────────────
async function handleRegister() {
  const username = document.getElementById('reg-username').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  // Client-side validation
  if (!username || !email || !password) {
    showAlert('register-error', 'Please fill in all fields.');
    return;
  }
  if (password.length < 6) {
    showAlert('register-error', 'Password must be at least 6 characters.');
    return;
  }

  setLoading('btn-register', true);
  clearAlerts();

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert('register-error', data.message || 'Registration failed.');
      // Show field-level errors if available
      if (data.errors && data.errors.length > 0) {
        const errorMsg = data.errors.map(e => `${e.field}: ${e.message}`).join('\n');
        showAlert('register-error', errorMsg);
      }
      return;
    }

    // Success — show message and switch to login tab
    showAlert('register-success', '✅ Account created! You can now login.', 'success');
    setTimeout(() => switchTab('login'), 1500);

  } catch (error) {
    showAlert('register-error', 'Cannot connect to server. Make sure the backend is running.');
    console.error('Register error:', error);
  } finally {
    setLoading('btn-register', false);
  }
}

// ─── KEYBOARD SHORTCUTS ───────────────────────────────────────────────────────
// Allow pressing Enter to submit forms
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const loginPanel = document.getElementById('panel-login');
    if (!loginPanel.classList.contains('hidden')) {
      handleLogin();
    } else {
      handleRegister();
    }
  }
});

// ─── AUTO-REDIRECT IF ALREADY LOGGED IN ──────────────────────────────────────
// If user already has a valid token, skip login page
window.addEventListener('load', () => {
  const token = localStorage.getItem('token');
  if (token) {
    window.location.href = '/chat.html';
  }
});
