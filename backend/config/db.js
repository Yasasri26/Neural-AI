// config/db.js
// This file sets up the SQLite database connection
// We use SQLite instead of MySQL to instantly fix the password login issues

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbConnectionPromise = (async () => {
  const database = await open({
    filename: path.join(__dirname, '../../database/ai_chat.db'),
    driver: sqlite3.Database
  });

  await database.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      username   VARCHAR(30)  NOT NULL UNIQUE,
      email      VARCHAR(100) NOT NULL UNIQUE,
      password   VARCHAR(255) NOT NULL,
      created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chats (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      title      VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id    INTEGER      NOT NULL,
      user_id    INTEGER      NOT NULL,
      content    TEXT         NOT NULL,
      created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Insert AI User if not exists
  const aiExists = await database.get("SELECT id FROM users WHERE username = 'NeuralChat AI'");
  if (!aiExists) {
    await database.run(
      "INSERT INTO users (username, email, password) VALUES ('NeuralChat AI', 'ai@neuralchat.com', 'no-password')"
    );
  }
  
  // Insert Test User so you can login immediately
  const testExists = await database.get("SELECT id FROM users WHERE username = 'student2'");
  if (!testExists) {
    const hashed = await bcrypt.hash('password123', 10);
    await database.run(
      "INSERT INTO users (username, email, password) VALUES ('student2', 'student2@example.com', ?)", [hashed]
    );
  }

  console.log('✅ SQLite Database connected successfully! (No passwords needed)');
  return database;
})();

// Wrapper to make sqlite drop-in compatible with the existing mysql2 code
const db = {
  execute: async (sql, params = []) => {
    const database = await dbConnectionPromise;
    const isSelect = sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('PRAGMA');
    if (isSelect) {
      const rows = await database.all(sql, params);
      return [rows]; // Return array wrapper like mysql2
    } else {
      const result = await database.run(sql, params);
      return [{ insertId: result.lastID, affectedRows: result.changes }];
    }
  }
};

module.exports = db;
