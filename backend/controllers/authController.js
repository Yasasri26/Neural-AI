const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// ─── REGISTER ─────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // 🔹 Check if email exists
    const emailTaken = await User.emailExists(email);
    if (emailTaken) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // 🔹 Check if username exists
    const usernameTaken = await User.usernameExists(username);
    if (usernameTaken) {
      return res.status(409).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // 🔹 Create user
    const result = await User.create(username, email, password);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: {
        userId: result.insertId,
        username,
        email
      }
    });

  } catch (error) {

    // 🔥 HANDLE DATABASE UNIQUE ERROR (VERY IMPORTANT)
    if (error.code === 'SQLITE_CONSTRAINT' || error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Username or Email already exists'
      });
    }

    next(error);
  }
};

// ─── LOGIN ────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// ─── PROFILE ──────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile };