// frontend/js/chat.js - Premium NeuralChat Logic

const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');

if (!token || !userStr) {
  window.location.href = 'index.html';
}

const currentUser = JSON.parse(userStr);
let currentChatId = null;
let allMessages = [];
let allChats = [];

// DOM Elements
const chatListContainer = document.getElementById('chat-list');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const charCounter = document.getElementById('char-counter');
const btnSend = document.getElementById('btn-send');
const chatHeading = document.getElementById('chat-heading');
const msgCount = document.getElementById('msg-count');
const chatFooter = document.getElementById('chat-footer');

window.onload = () => {
  document.getElementById('sidebar-username').textContent = currentUser.username;
  document.getElementById('user-avatar').textContent = currentUser.username.charAt(0);
  setupInputs();
  loadChats();
};

function setupInputs() {
  messageInput.addEventListener('input', () => {
    const len = messageInput.value.length;
    charCounter.textContent = `${len} / 1000`;
    btnSend.disabled = len === 0 || len > 1000;
    
    // Auto-resize textarea
    messageInput.style.height = 'auto';
    messageInput.style.height = (messageInput.scrollHeight) + 'px';
  });

  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

function handleLogout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

// ============== CHATS (SESSIONS) ==============

async function loadChats() {
  try {
    const res = await fetch('/api/chats', { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    if (data.success) {
      allChats = data.data;
      renderChatSidebar();
    }
  } catch (err) { console.error(err); }
}

function renderChatSidebar() {
  chatListContainer.innerHTML = '';
  if (allChats.length === 0) {
    chatListContainer.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:0.8rem;opacity:0.6;">No conversations yet.</div>';
    return;
  }

  allChats.forEach(chat => {
    const item = document.createElement('div');
    item.className = `nav-item ${chat.id === currentChatId ? 'active' : ''}`;
    
    const label = document.createElement('div');
    label.style.flex = '1';
    label.innerHTML = `<span>💬</span> ${escapeHTML(chat.title)}`;
    label.onclick = () => selectChat(chat.id, chat.title);

    const actions = document.createElement('div');
    actions.className = 'chat-actions';
    actions.innerHTML = `
      <span class="action-icon" onclick="openRenameModal(${chat.id}, '${escapeHTML(chat.title)}')">✏️</span>
      <span class="action-icon" onclick="deleteChat(${chat.id})" style="color:var(--error)">🗑️</span>
    `;

    item.appendChild(label);
    item.appendChild(actions);
    chatListContainer.appendChild(item);
  });
}

async function createNewChat() {
  const title = prompt("Conversation Name:", "New Chat");
  if (!title) return;
  try {
    const res = await fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title })
    });
    const data = await res.json();
    if (data.success) {
      allChats.unshift(data.data);
      selectChat(data.data.id, data.data.title);
    }
  } catch (err) { console.error(err); }
}

function selectChat(id, title) {
  currentChatId = id;
  chatHeading.textContent = title;
  chatFooter.style.display = 'block';
  messageInput.disabled = false;
  messageInput.focus();
  renderChatSidebar();
  loadMessages();
}

// ============== MESSAGES ==============

async function loadMessages() {
  if (!currentChatId) return;
  messagesContainer.innerHTML = '<div class="empty-state"><div class="loading-spinner"></div></div>';
  try {
    const res = await fetch(`/api/messages?chatId=${currentChatId}`, { 
      headers: { 'Authorization': `Bearer ${token}` } 
    });
    const data = await res.json();
    if (data.success) {
      allMessages = data.data;
      renderMessages();
      msgCount.textContent = `${allMessages.length} messages`;
    }
  } catch (err) { console.error(err); }
}

function renderMessages() {
  messagesContainer.innerHTML = '';
  if (allMessages.length === 0) {
    messagesContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✨</div>
        <p>New conversation started.<br>Ask NeuralChat anything.</p>
      </div>`;
    return;
  }

  allMessages.forEach(msg => {
    const isOwn = msg.user_id === currentUser.id;
    const isAI = msg.username === 'NeuralChat AI';
    
    const item = document.createElement('div');
    item.className = `message-item ${isOwn ? 'own-message' : ''} ${isAI ? 'ai-message' : ''}`;
    
    item.innerHTML = `
      <div class="message-meta">
        <span class="message-author">${isAI ? 'NeuralChat AI' : escapeHTML(msg.username)}</span>
        <span class="message-time">${new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
      </div>
      <div class="message-bubble">
        ${isAI ? marked.parse(msg.content) : escapeHTML(msg.content)}
      </div>
    `;
    messagesContainer.appendChild(item);
  });
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function sendMessage() {
  const content = messageInput.value.trim();
  if (!content || !currentChatId) return;
  
  const chatIdAtTime = currentChatId;
  messageInput.value = '';
  messageInput.style.height = 'auto';
  btnSend.disabled = true;

  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ content, chatId: chatIdAtTime })
    });
    const data = await res.json();
    if (data.success) {
      if (currentChatId === chatIdAtTime) {
        if (data.data) allMessages.push(data.data);
        if (data.ai_message) allMessages.push(data.ai_message);
        renderMessages();
        msgCount.textContent = `${allMessages.length} messages`;
      }
    } else {
      alert(data.message || "Message failed");
    }
  } catch (err) {
    console.error(err);
    alert("Connection error. Check if backend is running.");
  } finally {
    btnSend.disabled = false;
  }
}

// ============== RENAME LOGIC ==============

let renameTargetId = null;
function openRenameModal(id, currentTitle) {
  renameTargetId = id;
  document.getElementById('rename-input').value = currentTitle;
  document.getElementById('rename-modal').classList.remove('hidden');
}
function closeRenameModal() {
  document.getElementById('rename-modal').classList.add('hidden');
}
async function confirmRename() {
  const newTitle = document.getElementById('rename-input').value.trim();
  if (!newTitle) return;
  try {
    await fetch(`/api/chats/${renameTargetId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: newTitle })
    });
    closeRenameModal();
    loadChats();
    if (currentChatId === renameTargetId) chatHeading.textContent = newTitle;
  } catch (err) { console.error(err); }
}

async function deleteChat(id) {
  if (!confirm("Delete this conversation?")) return;
  try {
    await fetch(`/api/chats/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (currentChatId === id) {
      currentChatId = null;
      chatHeading.textContent = "Select a Conversation";
      chatFooter.style.display = 'none';
      renderMessages();
    }
    loadChats();
  } catch (err) { console.error(err); }
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Global Exports
window.handleLogout = handleLogout;
window.createNewChat = createNewChat;
window.refreshMessages = loadMessages;
window.sendMessage = sendMessage;
window.openRenameModal = openRenameModal;
window.closeRenameModal = closeRenameModal;
window.confirmRename = confirmRename;
window.deleteChat = deleteChat;
