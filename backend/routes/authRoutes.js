// routes/authRoutes.js
// AUTHENTICATION ROUTES
// Maps HTTP methods + URL paths → controller functions

const express = require('express');
const router = express.Router(); // Create a mini-app with its own routes

const { register, login, getProfile } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

// ──────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES (No token needed)
// ──────────────────────────────────────────────────────────────────────────────

// POST /api/auth/register
// Middleware chain: validateRegister → register controller
router.post('/register', validateRegister, register);

// POST /api/auth/login
// Middleware chain: validateLogin → login controller
router.post('/login', validateLogin, login);

// ──────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTES (Token required - authMiddleware runs first)
// ──────────────────────────────────────────────────────────────────────────────

// GET /api/auth/profile
// Middleware chain: authMiddleware → getProfile controller
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
