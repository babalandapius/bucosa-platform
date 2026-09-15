import jwt from 'jsonwebtoken';
import db from '../config/db.js';

// Protect Admin Routes (Execs & Super Admins Only)
export const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.userType !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied. Admin authorization required.' });
      }

      const [users] = await db.query(
        'SELECT id, username, email, role FROM admin_users WHERE id = ?',
        [decoded.id]
      );

      if (users.length === 0) {
        return res.status(401).json({ success: false, message: 'Admin profile not found.' });
      }

      req.user = { ...users[0], userType: 'admin' };
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'No authorization token provided.' });
  }
};

// Protect Student Routes (Registered Students)
export const protectStudent = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const [students] = await db.query(
        'SELECT id, student_no, full_name, email, year_of_study FROM students WHERE id = ?',
        [decoded.id]
      );

      if (students.length === 0) {
        return res.status(401).json({ success: false, message: 'Student record not found.' });
      }

      req.user = { ...students[0], userType: 'student' };
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'No authorization token provided.' });
  }
};