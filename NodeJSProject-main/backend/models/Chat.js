const db = require('../config/db');

const Chat = {
  async create(userId, title) {
    const sql = `INSERT INTO chats (user_id, title) VALUES (?, ?)`;
    const [result] = await db.execute(sql, [userId, title]);
    return result;
  },
  async getByUserId(userId) {
    const sql = `SELECT * FROM chats WHERE user_id = ? ORDER BY created_at DESC`;
    const [rows] = await db.execute(sql, [userId]);
    return rows;
  },
  async getById(chatId, userId) {
    const sql = `SELECT * FROM chats WHERE id = ? AND user_id = ?`;
    const [rows] = await db.execute(sql, [chatId, userId]);
    return rows[0];
  },
  async updateTitle(chatId, userId, newTitle) {
    const sql = `UPDATE chats SET title = ? WHERE id = ? AND user_id = ?`;
    const [result] = await db.execute(sql, [newTitle, chatId, userId]);
    return result;
  },
  async delete(chatId, userId) {
    const sql = `DELETE FROM chats WHERE id = ? AND user_id = ?`;
    const [result] = await db.execute(sql, [chatId, userId]);
    return result;
  }
};

module.exports = Chat;
