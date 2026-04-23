-- ============================================================
-- AI Chat Backend System - Database Schema
-- Run these commands in MySQL Workbench or terminal
-- ============================================================

-- Step 1: Create the database
CREATE DATABASE IF NOT EXISTS ai_chat_db;

-- Step 2: Select the database to use
USE ai_chat_db;

-- ============================================================
-- TABLE 1: users
-- Stores registered user accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,     -- Unique ID (auto-increments)
  username   VARCHAR(30)  NOT NULL UNIQUE,        -- Username (must be unique)
  email      VARCHAR(100) NOT NULL UNIQUE,        -- Email (must be unique)
  password   VARCHAR(255) NOT NULL,               -- Hashed password (bcrypt)
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  -- When account was created
);

-- ============================================================
-- TABLE 2: messages
-- Stores all chat messages
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id         INT AUTO_INCREMENT PRIMARY KEY,     -- Unique message ID
  user_id    INT          NOT NULL,              -- Which user sent this message
  content    TEXT         NOT NULL,              -- The actual message text
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,  -- When message was sent
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- ON UPDATE CURRENT_TIMESTAMP = auto-updates when message is edited

  -- FOREIGN KEY: user_id must exist in users.id
  -- ON DELETE CASCADE = if a user is deleted, their messages are also deleted
  CONSTRAINT fk_user_id FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- ============================================================
-- INDEXES for better query performance
-- ============================================================
-- Index on user_id helps when fetching messages by user
CREATE INDEX idx_messages_user_id ON messages(user_id);

-- Index on created_at helps when ordering messages by time
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- ============================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================
-- Note: Passwords below are bcrypt hashes of "password123"

INSERT INTO users (username, email, password) VALUES
  ('yasasri', 'yasasri@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  ('student2', 'student2@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

INSERT INTO messages (user_id, content) VALUES
  (1, 'Hello! Welcome to the AI Chat System!'),
  (2, 'Hi there! This is a test message.'),
  (1, 'Full CRUD operations are working perfectly!');

-- ============================================================
-- VERIFY TABLES
-- Run these to check if tables were created correctly
-- ============================================================
-- DESCRIBE users;
-- DESCRIBE messages;
-- SELECT * FROM users;
-- SELECT * FROM messages;
