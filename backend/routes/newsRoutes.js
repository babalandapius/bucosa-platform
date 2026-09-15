import express from 'express';
import {
  getNewsArticles,
  getArticleByIdentifier,
  createArticle,
  deleteArticle,
} from '../controllers/newsController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { uploadNewsImage } from '../middleware/newsUpload.js';

const router = express.Router();

// Public Access
router.get('/', getNewsArticles);
router.get('/:identifier', getArticleByIdentifier);

// Admin Protected Routes
router.post('/', protectAdmin, uploadNewsImage.single('cover_image'), createArticle);
router.delete('/:id', protectAdmin, deleteArticle);

export default router;