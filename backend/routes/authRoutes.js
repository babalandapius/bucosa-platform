import express from 'express';
import { 
  protectAny, 
  protectAdmin, 
  protectStudent 
} from '../middleware/authMiddleware.js';
import {
  adminLogin,
  registerAdmin,
  studentLogin,
  registerStudent,
  getCurrentUser,
  deleteUser,
  getUsers
} from '../controllers/authController.js';

const router = express.Router();

// Public Authentication
router.post('/student/signup', registerStudent);
router.post('/student/login', studentLogin);
router.post('/admin/login', adminLogin);

// Protected Admin Creation (Admin Only)
router.post('/admin/signup', protectAdmin, registerAdmin);

// Session Check (Accessible by both Admins and Students)
router.get('/me', protectAny, getCurrentUser);

// Admin Management
router.get('/users', protectAdmin, getUsers);
router.delete('/users/:id', protectAdmin, deleteUser);

export default router;