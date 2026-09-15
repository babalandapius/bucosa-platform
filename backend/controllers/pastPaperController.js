import db from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get / Filter Past Papers (Protected: Registered Students & Admins)
// @route   GET /api/v1/past-papers
export const getPastPapers = async (req, res) => {
  const { course_code, year_of_study, semester } = req.query;

  try {
    let query = 'SELECT * FROM past_papers WHERE 1=1';
    const params = [];

    if (course_code) {
      query += ' AND course_code LIKE ?';
      params.push(`%${course_code}%`);
    }

    if (year_of_study) {
      query += ' AND year_of_study = ?';
      params.push(year_of_study);
    }

    if (semester) {
      query += ' AND semester = ?';
      params.push(semester);
    }

    query += ' ORDER BY created_at DESC';

    const [papers] = await db.query(query, params);
    res.status(200).json({ success: true, count: papers.length, data: papers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve past papers.', error: error.message });
  }
};

// @desc    Upload Academic Resource (Admin Only)
// @route   POST /api/v1/past-papers
export const uploadPastPaper = async (req, res) => {
  const { course_code, course_title, academic_year, semester, year_of_study } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please attach a document file (PDF, DOCX, ZIP).' });
  }

  if (!course_code || !course_title || !academic_year || !semester || !year_of_study) {
    return res.status(400).json({ success: false, message: 'All paper metadata fields are required.' });
  }

  const file_url = `/uploads/papers/${req.file.filename}`;

  try {
    const [result] = await db.query(
      `INSERT INTO past_papers (course_code, course_title, academic_year, semester, year_of_study, file_url, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [course_code.toUpperCase(), course_title, academic_year, semester, year_of_study, file_url, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Past paper uploaded successfully.',
      data: {
        id: result.insertId,
        course_code: course_code.toUpperCase(),
        course_title,
        file_url,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record past paper.', error: error.message });
  }
};

// @desc    Secure Document Download Trigger
// @route   GET /api/v1/past-papers/download/:id
export const downloadPastPaper = async (req, res) => {
  try {
    const [papers] = await db.query('SELECT * FROM past_papers WHERE id = ?', [req.params.id]);

    if (papers.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const paper = papers[0];
    const filePath = path.join(__dirname, '..', paper.file_url);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Physical file not found on server.' });
    }

    // Force browser file download with clear filename
    res.download(filePath, `${paper.course_code}_${paper.academic_year}${path.extname(filePath)}`);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error triggering file download.', error: error.message });
  }
};