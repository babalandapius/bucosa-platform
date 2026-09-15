import express from 'express';
import { getEvents, getEventById, createEvent } from '../controllers/eventController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { uploadExecutivePhoto } from '../middleware/uploadMiddleware.js'; // Reuse or customize upload middleware

const router = express.Router();

// Public Routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Admin Only Route with Image Banner Upload
router.post('/', protectAdmin, uploadExecutivePhoto.single('banner'), createEvent);

export default router;