// server.js
// ENTRY POINT - This is where the Express app is created and configured
// Run this file with: node server.js  (or: npm run dev for auto-restart)

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Load .env variables first

// ─── Import Routes ────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');

// ─── Import Error Middleware ──────────────────────────────────────────────────
const { errorMiddleware, notFoundMiddleware } = require('./middleware/errorMiddleware');

// ─── Create Express App ───────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── GLOBAL MIDDLEWARE ────────────────────────────────────────────────────────
// These run on EVERY request before routes

// Enable CORS - allows the frontend (on different port) to talk to backend
app.use(cors({
  origin: '*', // In production, restrict this to your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse incoming JSON request bodies (req.body will be available)
app.use(express.json());

// Parse URL-encoded form data (from HTML forms)
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (HTML, CSS, JS) from the frontend folder
// This allows the frontend to be accessed at http://localhost:5000
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── ROUTES ───────────────────────────────────────────────────────────────────
// All auth routes: /api/auth/register, /api/auth/login, /api/auth/profile
app.use('/api/auth', authRoutes);

// All message routes: /api/messages, /api/messages/:id, /api/messages/my
app.use('/api/messages', messageRoutes);

const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chats', chatRoutes);

// Root API health check
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '🚀 AI Chat Backend API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      messages: '/api/messages'
    }
  });
});

// Serve the frontend for any unknown GET requests (SPA behavior)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── ERROR MIDDLEWARE (must be LAST) ─────────────────────────────────────────
// 404 handler - for unknown API routes
app.use('/api/*', notFoundMiddleware);

// Global error handler - catches errors from all controllers
app.use(errorMiddleware);

// ─── START SERVER ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   🤖 AI Chat Backend Server Started     ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║   🌐 Server:  http://localhost:${PORT}     ║`);
  console.log(`║   📡 API:     http://localhost:${PORT}/api  ║`);
  console.log('╚════════════════════════════════════════╝');
  console.log('');
});

module.exports = app;
