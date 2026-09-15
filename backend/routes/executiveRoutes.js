import express from 'express';
import { getExecutives, createExecutive } from '../controllers/executiveController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { uploadExecutivePhoto } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public: View Executive Roster
router.get('/', getExecutives);

// Admin Only: Add Executive with Image Upload
router.post('/', protectAdmin, uploadExecutivePhoto.single('photo'), createExecutive);

export default router;