// middleware/validationMiddleware.js
// Validation middleware - checks that incoming request data is correct
// Uses express-validator to define rules and check them

const { body, validationResult } = require('express-validator');

// ─── HELPER: Run validation checks and return errors if any ─────────────────
// This is called at the END of each validation chain
const validate = (req, res, next) => {
  const errors = validationResult(req); // Collect all validation errors
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next(); // No errors → proceed to controller
};

// ─── REGISTRATION VALIDATION RULES ──────────────────────────────────────────
const validateRegister = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, underscores'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(), // Converts to lowercase, removes dots in gmail

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  validate // Run the check at the end
];

// ─── LOGIN VALIDATION RULES ──────────────────────────────────────────────────
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty().withMessage('Password is required'),

  validate
];

// ─── MESSAGE VALIDATION RULES ────────────────────────────────────────────────
const validateMessage = [
  body('content')
    .trim()
    .notEmpty().withMessage('Message content cannot be empty')
    .isLength({ min: 1, max: 1000 }).withMessage('Message must be 1–1000 characters'),

  validate
];

module.exports = { validateRegister, validateLogin, validateMessage };
