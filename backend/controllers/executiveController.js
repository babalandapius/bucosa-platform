import db from '../config/db.js';

export const getExecutives = async (req, res) => {
  res.status(201);
}

export const createExecutive = async (req, res) => {
  const { full_name, position, academic_year, email, phone, bio, display_order } = req.body;

  // Multer attaches file details to `req.file`
  // If a file was uploaded, format its web-accessible path; otherwise set null
  const photo_url = req.file ? `/uploads/executives/${req.file.filename}` : null;

  if (!full_name || !position || !academic_year) {
    return res.status(400).json({
      success: false,
      message: 'Full name, position, and academic year are required.',
    });
  }

  try {
    // Save text attributes along with the file path string into MySQL
    const [result] = await db.query(
      `INSERT INTO executives (full_name, position, academic_year, email, phone, bio, photo_url, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        full_name,
        position,
        academic_year,
        email || null,
        phone || null,
        bio || null,
        photo_url,
        display_order || 0,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Executive created successfully.',
      data: {
        id: result.insertId,
        full_name,
        position,
        photo_url, // Return path to frontend for instant UI rendering
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error saving executive profile.',
      error: error.message,
    });
  }
};