import express from 'express';
import {
  submitContactMessage,
  getContactMessages,
  updateMessageStatus,
} from '../controllers/contactController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { contactValidationRules, validate } from '../middleware/validatorMiddleware.js';

const router = express.Router();

// Public route: Submit contact form
router.post('/', submitContactMessage);
router.post('/', contactValidationRules, validate, submitContactMessage);

// Admin-protected routes: View & manage inquiries
router.get('/', protectAdmin, getContactMessages);
router.patch('/:id/status', protectAdmin, updateMessageStatus);

export default router;