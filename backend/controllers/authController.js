import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { generateMembershipCard } from '../utils/generateCard.js';

// Helper function to generate JWT Token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

// ==========================================
// 1. ADMIN / EXECUTIVE AUTHENTICATION LOGIC
// ==========================================

// @desc    Register a new Admin/Executive (Protected: Admin Only)
// @route   POST /api/v1/auth/admin/signup
export const registerAdmin = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide username, email, and password.' });
  }

  try {
    const [existing] = await db.query(
      'SELECT id FROM admin_users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Admin username or email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const adminRole = role || 'executive';

    const [result] = await db.query(
      'INSERT INTO admin_users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, adminRole]
    );

    const newId = result.insertId;
    const token = generateToken({ id: newId, role: adminRole, userType: 'admin' });

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully.',
      token,
      user: { id: newId, username, email, role: adminRole, userType: 'admin' }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during admin registration.', error: error.message });
  }
};

// @desc    Admin / Executive Login
// @route   POST /api/v1/auth/admin/login
export const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Please provide username/email and password.' });
  }

  try {
    const [users] = await db.query(
      'SELECT * FROM admin_users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const admin = users[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const token = generateToken({ id: admin.id, role: admin.role, userType: 'admin' });

    res.status(200).json({
      success: true,
      message: 'Admin login successful.',
      token,
      user: { id: admin.id, username: admin.username, email: admin.email, role: admin.role, userType: 'admin' }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during admin login.', error: error.message });
  }
};

// ==========================================
// 2. STUDENT MEMBER AUTHENTICATION LOGIC
// ==========================================

// @desc    Register a new Student Member (Public)
// @route   POST /api/v1/auth/student/signup
export const registerStudent = async (req, res) => {
  const { student_no, full_name, email, password, year_of_study } = req.body;

  if (!student_no || !full_name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
  }

  try {
    const [existing] = await db.query(
      'SELECT id FROM students WHERE student_no = ? OR email = ?',
      [student_no, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Student number or email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      'INSERT INTO students (student_no, full_name, email, password_hash, year_of_study) VALUES (?, ?, ?, ?, ?)',
      [student_no, full_name, email, passwordHash, year_of_study || 1]
    );

    const newId = result.insertId;
    const token = generateToken({ id: newId, userType: 'student' });

    res.status(201).json({
      success: true,
      message: 'BUCoSA student registration successful.',
      token,
      user: { id: newId, student_no, full_name, email, year_of_study: year_of_study || 1, userType: 'student' }
    });
      // 5. Generate Automated PDF Membership Card
    const cardUrl = await generateMembershipCard(studentData);

    // 6. Update Database Record with card_url Path
    await db.query('UPDATE students SET card_url = ? WHERE id = ?', [cardUrl, result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Student account created and membership card generated successfully.',
      data: {
        ...studentData,
        email,
        card_url: cardUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during student registration.', error: error.message });
  }
}

// @desc    Student Member Login
// @route   POST /api/v1/auth/student/login
export const studentLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password.' });
  }

  try {
    const [students] = await db.query('SELECT * FROM students WHERE email = ?', [email]);

    if (students.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid student credentials.' });
    }

    const student = students[0];
    const isMatch = await bcrypt.compare(password, student.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid student credentials.' });
    }

    const token = generateToken({ id: student.id, userType: 'student' });

    res.status(200).json({
      success: true,
      message: 'Student login successful.',
      token,
      user: {
        id: student.id,
        student_no: student.student_no,
        full_name: student.full_name,
        email: student.email,
        year_of_study: student.year_of_study,
        userType: 'student'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during student login.', error: error.message });
  }
};


export const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
};


export const deleteUser = async (req, res, next) => {
  const { id } = req.params;
  const role = req.query.role || 'student'; // 'student' or 'admin'

  try {
    // 1. Prevent an Admin from deleting their own account
    if (role === 'admin' && parseInt(id, 10) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Action denied: You cannot delete your own admin account while logged in.',
      });
    }

    // 2. Determine target table based on role
    const tableName = role === 'admin' ? 'admin_users' : 'students';

    // 3. Verify user existence
    const [existingUser] = await db.query(`SELECT id FROM ${tableName} WHERE id = ?`, [id]);

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} account with ID ${id} not found.`,
      });
    }

    // 4. Delete the user
    await db.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);

    res.status(200).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} user account deleted successfully.`,
      data: { deleted_id: id, role },
    });
  } catch (error) {
    next(error); // Pass error to global errorHandler middleware
  }
};


export const getUsers = async (req, res, next) => {
  const role = req.query.role || 'student'; // 'student' or 'admin'
  const search = req.query.search || '';
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  try {
    const tableName = role === 'admin' ? 'admin_users' : 'students';
    const fields =
      role === 'admin'
        ? 'id, username, email, role, created_at'
        : 'id, student_id, full_name, email, course, year_of_study, created_at';

    let countQuery = `SELECT COUNT(*) as total FROM ${tableName} WHERE 1=1`;
    let dataQuery = `SELECT ${fields} FROM ${tableName} WHERE 1=1`;
    const params = [];

    // Apply Search Filter across fields
    if (search) {
      if (role === 'admin') {
        countQuery += ' AND (username LIKE ? OR email LIKE ?)';
        dataQuery += ' AND (username LIKE ? OR email LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      } else {
        countQuery += ' AND (full_name LIKE ? OR email LIKE ? OR student_id LIKE ?)';
        dataQuery += ' AND (full_name LIKE ? OR email LIKE ? OR student_id LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
    }

    // Append Sorting & Pagination
    dataQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

    // 1. Get Total Count
    const [countResult] = await db.query(countQuery, params);
    const totalItems = countResult[0].total;

    // 2. Fetch Paginated Records
    const [users] = await db.query(dataQuery, [...params, limit, offset]);

    // 3. Construct Pagination Metadata
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        total_items: totalItems,
        total_pages: totalPages,
        current_page: page,
        limit,
        has_next_page: page < totalPages,
        has_prev_page: page > 1,
      },
      data: users,
    });
  } catch (error) {
    next(error);
  }
};