// controllers/messageController.js
// MESSAGE CONTROLLER - handles all CRUD operations for chat messages
// All routes here are PROTECTED (require valid JWT token)

const Message = require('../models/Message');
const Groq = require('groq-sdk');
const db = require('../config/db');

// ─── CREATE: POST /api/messages ───────────────────────────────────────────────
// Send a new chat message
const createMessage = async (req, res, next) => {
  try {
    const { content, chatId } = req.body;
    const userId = req.user.id;

    if (!chatId) return res.status(400).json({success:false, message:"chatId is required"});

    // 1. Save user message
    const result = await Message.create(chatId, userId, content);
    
    // SQLite result.insertId handling
    const insertId = result.insertId;
    const newMessage = await Message.getById(insertId);

    // 2. Call Groq AI
    let aiMessageData = null;
    try {
      if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'YOUR_GROQ_API_KEY_HERE') {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        const allMsgs = await Message.getByChatId(chatId);
        const history = allMsgs.map(m => ({
            role: m.username === 'NeuralChat AI' ? 'assistant' : 'user',
            content: m.content
        }));
        const recentHistory = history.slice(-15); // keep context window small

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are NeuralChat AI. You provide helpful, intelligent, and concise responses. Do not use formatting like markdown that cannot be rendered in simple text environments, keep it readable."
                },
                ...recentHistory
            ],
            model: "llama-3.1-8b-instant", // Updated model suitable for chat
        });

        const aiResponseContent = chatCompletion.choices[0]?.message?.content || "I couldn't process that.";
        
        // Find AI user ID
        const [rows] = await db.execute("SELECT id FROM users WHERE username = 'NeuralChat AI'");
        const aiUserId = rows[0].id;
        
        const aiResult = await Message.create(chatId, aiUserId, aiResponseContent);
        const aiInsertId = aiResult.insertId;
        aiMessageData = await Message.getById(aiInsertId);
      }
    } catch (aiError) {
        console.error("Groq AI Error:", aiError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      data: newMessage,
      ai_message: aiMessageData // Returned for frontend to display immediately
    });

  } catch (error) {
    next(error);
  }
};

// ─── READ CHAT MESSAGES: GET /api/messages?chatId=1 ──────────────────────────────
const getAllMessages = async (req, res, next) => {
  try {
    const chatId = req.query.chatId;
    if (!chatId) return res.status(400).json({success:false, message: "chatId query parameter required"});
    
    const messages = await Message.getByChatId(chatId);

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });

  } catch (error) {
    next(error);
  }
};

// ─── READ ONE: GET /api/messages/:id ──────────────────────────────────────────
// Get a single message by its ID
const getMessageById = async (req, res, next) => {
  try {
    const messageId = req.params.id; // Get :id from the URL
    const message = await Message.getById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: `Message with ID ${messageId} not found`
      });
    }

    res.status(200).json({
      success: true,
      data: message
    });

  } catch (error) {
    next(error);
  }
};

// ─── READ MY MESSAGES: GET /api/messages/my ───────────────────────────────────
// Get only the logged-in user's messages
const getMyMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const messages = await Message.getByUserId(userId);

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });

  } catch (error) {
    next(error);
  }
};

// ─── UPDATE: PUT /api/messages/:id ────────────────────────────────────────────
// Edit an existing message (only the owner can edit their own message)
const updateMessage = async (req, res, next) => {
  try {
    const messageId = req.params.id;
    const userId = req.user.id;
    const { content } = req.body;

    // First check if the message exists
    const existingMessage = await Message.getById(messageId);
    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        message: `Message with ID ${messageId} not found`
      });
    }

    // Check if this message belongs to the logged-in user
    if (existingMessage.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit your own messages'
      });
    }

    // Perform the update
    const result = await Message.update(messageId, userId, content);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'Update failed. No rows were affected.'
      });
    }

    // Fetch and return the updated message
    const updatedMessage = await Message.getById(messageId);

    res.status(200).json({
      success: true,
      message: 'Message updated successfully!',
      data: updatedMessage
    });

  } catch (error) {
    next(error);
  }
};

// ─── DELETE: DELETE /api/messages/:id ─────────────────────────────────────────
// Delete a message (only the owner can delete their own message)
const deleteMessage = async (req, res, next) => {
  try {
    const messageId = req.params.id;
    const userId = req.user.id;

    // First check if the message exists
    const existingMessage = await Message.getById(messageId);
    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        message: `Message with ID ${messageId} not found`
      });
    }

    // Authorization check - user can only delete their OWN messages
    if (existingMessage.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete your own messages'
      });
    }

    // Perform the deletion
    const result = await Message.delete(messageId, userId);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'Delete failed. No rows were affected.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully!',
      data: { deletedId: parseInt(messageId) }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMessage,
  getAllMessages,
  getMessageById,
  getMyMessages,
  updateMessage,
  deleteMessage
};
