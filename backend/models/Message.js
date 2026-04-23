// models/Message.js
// This is the Message MODEL - handles all database operations for chat messages
// Full CRUD: Create, Read, Update, Delete

const db = require('../config/db');

const Message = {

  // ─── CREATE: Save a new message to database ────────────────────────────────
  async create(chatId, userId, content) {
    const sql = `
      INSERT INTO messages (chat_id, user_id, content)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.execute(sql, [chatId, userId, content]);
    return result;
  },

  // ─── READ: Get all messages by a specific chat ─────────────────────────────
  async getByChatId(chatId) {
    const sql = `
      SELECT
        messages.id,
        messages.content,
        messages.created_at,
        messages.updated_at,
        COALESCE(users.username, 'Unknown User') as username,
        messages.user_id
      FROM messages
      LEFT JOIN users ON messages.user_id = users.id
      WHERE messages.chat_id = ?
      ORDER BY messages.created_at ASC
    `;
    const [rows] = await db.execute(sql, [chatId]);
    return rows;
  },

  // ─── READ ONE: Get a single message by its ID ──────────────────────────────
  async getById(messageId) {
    const sql = `
      SELECT
        messages.id,
        messages.content,
        messages.created_at,
        messages.updated_at,
        COALESCE(users.username, 'Unknown User') as username,
        messages.user_id
      FROM messages
      LEFT JOIN users ON messages.user_id = users.id
      WHERE messages.id = ?
    `;
    const [rows] = await db.execute(sql, [messageId]);
    return rows[0]; // Returns single message or undefined
  },

  // ─── READ: Get all messages by a specific user ─────────────────────────────
  async getByUserId(userId) {
    const sql = `
      SELECT
        messages.id,
        messages.content,
        messages.created_at,
        messages.updated_at,
        users.username
      FROM messages
      INNER JOIN users ON messages.user_id = users.id
      WHERE messages.user_id = ?
      ORDER BY messages.created_at ASC
    `;
    const [rows] = await db.execute(sql, [userId]);
    return rows;
  },

  // ─── UPDATE: Edit an existing message ─────────────────────────────────────
  // Also checks that the message belongs to the requesting user (authorization)
  async update(messageId, userId, newContent) {
    const sql = `
      UPDATE messages
      SET content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;
    // WHERE id = ? AND user_id = ? ensures users can only edit THEIR OWN messages
    const [result] = await db.execute(sql, [newContent, messageId, userId]);
    return result; // result.affectedRows will be 0 if not found or not owner
  },

  // ─── DELETE: Remove a message ──────────────────────────────────────────────
  // Also checks ownership so users can only delete their own messages
  async delete(messageId, userId) {
    const sql = `
      DELETE FROM messages
      WHERE id = ? AND user_id = ?
    `;
    const [result] = await db.execute(sql, [messageId, userId]);
    return result; // result.affectedRows will be 0 if not found or not owner
  }

};

module.exports = Message;
