import express from 'express';
import { getPastPapers, uploadPastPaper, downloadPastPaper } from '../controllers/pastPaperController.js';
import { protectAdmin, protectStudent } from '../middleware/authMiddleware.js';
import { uploadDocument } from '../middleware/documentUpload.js';

const router = express.Router();

// Fetch papers (Accessible by students or admins)
router.get('/', protectStudent, getPastPapers);

// Download paper file
router.get('/download/:id', protectStudent, downloadPastPaper);

// Upload new paper (Admin/Executive only)
router.post('/', protectAdmin, uploadDocument.single('document'), uploadPastPaper);

export default router;