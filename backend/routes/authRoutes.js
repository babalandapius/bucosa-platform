import express from 'express';
import { 
  protectAny, 
  protectAdmin, 
  requireAdminApprover,
} from '../middleware/authMiddleware.js';
import {
  adminLogin,
  registerAdmin,
  studentLogin,
  registerStudent,
  createAdminMembershipApplication,
  getMembershipApplications,
  reviewMembershipApplication,
  getMembershipApplicationStatus,
  completeStudentRegistration,
  getCurrentUser,
  deleteUser,
  getUsers
} from '../controllers/authController.js';

const router = express.Router();

// Public Authentication
router.post('/student/signup', registerStudent);
router.post('/student/login', studentLogin);
router.post('/student/application-status', getMembershipApplicationStatus);
router.post('/student/complete-registration', completeStudentRegistration);
router.post('/admin/login', adminLogin);

// Protected Admin Creation (Admin Only)
router.post('/admin/signup', protectAdmin, registerAdmin);
router.post('/admin/applications', protectAdmin, createAdminMembershipApplication);
router.get('/admin/applications', protectAdmin, requireAdminApprover, getMembershipApplications);
router.patch('/admin/applications/:id', protectAdmin, requireAdminApprover, reviewMembershipApplication);

// Session Check (Accessible by both Admins and Students)
router.get('/me', protectAny, getCurrentUser);

// Admin Management
router.get('/users', protectAdmin, getUsers);
router.delete('/users/:id', protectAdmin, deleteUser);

export default router;