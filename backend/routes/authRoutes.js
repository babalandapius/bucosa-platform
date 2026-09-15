import express from 'express';
import {
  adminLogin,
  registerAdmin,
  studentLogin,
  registerStudent,
  getCurrentUser,
  deleteUser,
  getUsers
} from '../controllers/authController.js';
import { protectAdmin, protectStudent } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Authentication
router.post('/student/signup', registerStudent);
router.post('/student/login', studentLogin);
router.post('/admin/login', adminLogin);

// Protected Admin Creation (Admin Only)
router.post('/admin/signup', protectAdmin, registerAdmin);

// Session Check (Accessible by both Admins and Students)
router.get('/me', protectAdmin, protectStudent, getCurrentUser);

router.get('/users', protectAdmin, getUsers);
router.delete('/users/:id', protectAdmin, deleteUser);

export default router;