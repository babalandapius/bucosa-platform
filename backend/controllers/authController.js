import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

// Helper function to generate JWT Token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

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


export const registerStudent = async (req, res, next) => {
  return createMembershipApplication(req, res, false, next);
};

const createMembershipApplication = async (req, res, createdByStaff, next) => {
  const { student_id, full_name, email, year_of_study, course } = req.body;

  const courseId = Number(course);
  const year = year_of_study ? Number(year_of_study) : null;
  if (
    !String(student_id || '').trim() ||
    !String(full_name || '').trim() ||
    !String(email || '').trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim()) ||
    !Number.isInteger(courseId) ||
    courseId < 1 ||
    (year !== null && (!Number.isInteger(year) || year < 1 || year > 10))
  ) {
    return res.status(400).json({ success: false, message: 'Please provide student ID, full name, email, and course.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const activationCode = randomBytes(32).toString('hex');
  const activationCodeHash = createHash('sha256').update(activationCode).digest('hex');

  try {
    const [existingStudents] = await db.query(
      'SELECT id FROM students WHERE student_id = ? OR email = ?',
      [String(student_id).trim(), normalizedEmail]
    );
    const [existingApplications] = await db.query(
      `SELECT id FROM membership_applications
       WHERE (student_id = ? OR email = ?) AND status IN ('pending', 'approved', 'completed')
       LIMIT 1`,
      [String(student_id).trim(), normalizedEmail]
    );

    if (existingStudents.length || existingApplications.length) {
      return res.status(409).json({
        success: false,
        message: 'An account or active membership application already exists for this student ID or email.',
      });
    }

    const [result] = await db.query(
      `INSERT INTO membership_applications
       (student_id, full_name, email, year_of_study, course, activation_code_hash, submitted_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        String(student_id).trim(),
        String(full_name).trim(),
        normalizedEmail,
        year,
        courseId,
        activationCodeHash,
        createdByStaff ? req.user.id : null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Membership application submitted. An admin must approve it before the student can set a password.',
      applicationId: result.insertId,
      activationCode,
    });
  } catch (error) {
    return next(error);
  }
};

export const createAdminMembershipApplication = (req, res, next) =>
  createMembershipApplication(req, res, true, next);

export const getMembershipApplications = async (req, res, next) => {
  try {
    const [applications] = await db.query(
      `SELECT id, student_id, full_name, email, year_of_study, course, status, created_at
       FROM membership_applications
       WHERE status = 'pending'
       ORDER BY created_at ASC`
    );
    return res.status(200).json({ success: true, applications });
  } catch (error) {
    return next(error);
  }
};

export const reviewMembershipApplication = async (req, res, next) => {
  const applicationId = Number(req.params.id);
  const { decision } = req.body;

  if (!Number.isInteger(applicationId) || applicationId < 1 || !['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ success: false, message: 'Provide a valid application ID and decision.' });
  }

  try {
    const [result] = await db.query(
      `UPDATE membership_applications
       SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = 'pending'`,
      [decision, req.user.id, applicationId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Pending application not found.' });
    }

    return res.status(200).json({ success: true, message: `Application ${decision}.` });
  } catch (error) {
    return next(error);
  }
};

export const getMembershipApplicationStatus = async (req, res, next) => {
  const { activationCode } = req.body;
  if (!activationCode || typeof activationCode !== 'string') {
    return res.status(400).json({ success: false, message: 'Provide your application access code.' });
  }

  try {
    const activationCodeHash = createHash('sha256').update(activationCode).digest('hex');
    const [applications] = await db.query(
      `SELECT status FROM membership_applications WHERE activation_code_hash = ? LIMIT 1`,
      [activationCodeHash]
    );

    if (!applications.length) {
      return res.status(404).json({ success: false, message: 'Application not found. Check your access code.' });
    }

    return res.status(200).json({ success: true, status: applications[0].status });
  } catch (error) {
    return next(error);
  }
};

export const completeStudentRegistration = async (req, res, next) => {
  const { activationCode, password } = req.body;
  if (!activationCode || typeof activationCode !== 'string' || !password || password.length < 8) {
    return res.status(400).json({ success: false, message: 'Provide your access code and a password of at least 8 characters.' });
  }

  const connection = await db.getConnection();
  try {
    const activationCodeHash = createHash('sha256').update(activationCode).digest('hex');
    await connection.beginTransaction();

    const [applications] = await connection.query(
      `SELECT id, student_id, full_name, email, year_of_study, course, status
       FROM membership_applications
       WHERE activation_code_hash = ?
       FOR UPDATE`,
      [activationCodeHash]
    );

    if (!applications.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Application not found. Check your access code.' });
    }

    const application = applications[0];
    if (application.status !== 'approved') {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: application.status === 'pending'
          ? 'Your application is still awaiting admin approval.'
          : 'This application cannot be activated.',
      });
    }

    const [existingStudents] = await connection.query(
      'SELECT id FROM students WHERE student_id = ? OR email = ? LIMIT 1',
      [application.student_id, application.email]
    );
    if (existingStudents.length) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'A student account already exists for this application.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await connection.query(
      `INSERT INTO students (student_id, full_name, email, password_hash, year_of_study, course)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        application.student_id,
        application.full_name,
        application.email,
        passwordHash,
        application.year_of_study,
        application.course,
      ]
    );
    await connection.query(
      `UPDATE membership_applications SET status = 'completed', reviewed_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [application.id]
    );
    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Membership activated successfully.',
      user: {
        id: result.insertId,
        student_id: application.student_id,
        full_name: application.full_name,
        email: application.email,
        year_of_study: application.year_of_study,
        course: application.course,
        userType: 'student',
      },
    });
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }
};

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
        student_id: student.student_id,
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


export const getCurrentUser = async (req, res, next) => {
  try {
    const { id, userType } = req.user; // Extracted from JWT by protectAny

    if (userType === 'student') {
      const [students] = await db.query(
        `SELECT id, student_id, full_name, email, course, year_of_study, created_at 
         FROM students WHERE id = ?`,
        [id]
      );

      if (students.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Student record not found.',
        });
      }

      return res.status(200).json({
        success: true,
        user: { ...students[0], userType: 'student' },
      });
    }

    // Admin lookup fallback
    const [admins] = await db.query(
      `SELECT id, username, email, role FROM admin_users WHERE id = ?`,
      [id]
    );

    if (admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user: { ...admins[0], userType: admins.role },
    });
  } catch (error) {
    next(error);
  }
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