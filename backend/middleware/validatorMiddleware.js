import { body, validationResult } from 'express-validator';

// Helper to evaluate validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({ field: err.path, message: err.msg })),
    });
  }
  next();
};

// Validation Rules Set for Admin/Student Login
export const loginValidationRules = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Validation Rules Set for Public Contact Form
export const contactValidationRules = [
  body('full_name').trim().notEmpty().withMessage('Full name is required').escape(),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('subject').trim().notEmpty().withMessage('Subject is required').escape(),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters long').escape(),
];