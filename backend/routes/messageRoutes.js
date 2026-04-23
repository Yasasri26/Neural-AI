// routes/messageRoutes.js
// MESSAGE ROUTES - all CRUD operations for chat messages
// ALL routes here require a valid JWT token (authMiddleware applied globally below)

const express = require('express');
const router = express.Router();

const {
  createMessage,
  getAllMessages,
  getMessageById,
  getMyMessages,
  updateMessage,
  deleteMessage
} = require('../controllers/messageController');

const authMiddleware = require('../middleware/authMiddleware');
const { validateMessage } = require('../middleware/validationMiddleware');

// Apply authMiddleware to ALL routes in this file
// This means every request to /api/messages/* requires a valid token
router.use(authMiddleware);

// ──────────────────────────────────────────────────────────────────────────────
// ROUTE DEFINITIONS
// ──────────────────────────────────────────────────────────────────────────────

// GET  /api/messages         → Get ALL messages (full chat history)
// POST /api/messages         → Create a NEW message
router
  .route('/')
  .get(getAllMessages)
  .post(validateMessage, createMessage);

// GET /api/messages/my       → Get only the logged-in user's messages
// Must be defined BEFORE /:id so Express doesn't treat "my" as an ID
router.get('/my', getMyMessages);

// GET    /api/messages/:id   → Get ONE message by ID
// PUT    /api/messages/:id   → UPDATE a message by ID
// DELETE /api/messages/:id   → DELETE a message by ID
router
  .route('/:id')
  .get(getMessageById)
  .put(validateMessage, updateMessage)
  .delete(deleteMessage);

module.exports = router;
