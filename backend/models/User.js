const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {

  // ─── CREATE ─────────────────────────────────────────────
  async create(username, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (username, email, password)
      VALUES (?, ?, ?)
    `;

    const [result] = await db.execute(sql, [username, email, hashedPassword]);
    return result;
  },

  // ─── FIND BY EMAIL ──────────────────────────────────────
  async findByEmail(email) {
    const sql = `SELECT * FROM users WHERE email = ? LIMIT 1`;
    const [rows] = await db.execute(sql, [email]);
    return rows[0];
  },

  // ─── FIND BY ID ─────────────────────────────────────────
  async findById(id) {
    const sql = `
      SELECT id, username, email, created_at 
      FROM users 
      WHERE id = ?
    `;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  },

  // ─── CHECK EMAIL ────────────────────────────────────────
  async emailExists(email) {
    const sql = `SELECT id FROM users WHERE email = ? LIMIT 1`;
    const [rows] = await db.execute(sql, [email]);
    return rows.length > 0;
  },

  // 🆕 ─── CHECK USERNAME ─────────────────────────────────
  async usernameExists(username) {
    const sql = `SELECT id FROM users WHERE username = ? LIMIT 1`;
    const [rows] = await db.execute(sql, [username]);
    return rows.length > 0;
  },

  // ─── VERIFY PASSWORD ───────────────────────────────────
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

};

module.exports = User;