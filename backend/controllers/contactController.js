import db from '../config/db.js';

// @desc    Submit a Public Contact Message
// @route   POST /api/v1/contact
// @access  Public
export const submitContactMessage = async (req, res) => {
  const { full_name, email, subject, message } = req.body;

  if (!full_name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: 'Please fill in all required fields (full name, email, subject, message).',
    });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO contact_messages (full_name, email, subject, message)
       VALUES (?, ?, ?, ?)`,
      [full_name, email, subject, message]
    );

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Your message has been sent to the BUCoSA executive team.',
      data: {
        id: result.insertId,
        full_name,
        subject,
        created_at: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact message. Please try again later.',
      error: error.message,
    });
  }
};

// @desc    Get All Contact Messages
// @route   GET /api/v1/contact
// @access  Protected (Admin / Executive Only)
export const getContactMessages = async (req, res) => {
  const { status } = req.query;

  try {
    let query = 'SELECT * FROM contact_messages';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [messages] = await db.query(query, params);

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages.',
      error: error.message,
    });
  }
};

// @desc    Update Message Status (Mark as Read/Replied)
// @route   PATCH /api/v1/contact/:id/status
// @access  Protected (Admin / Executive Only)
export const updateMessageStatus = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!['unread', 'read', 'replied'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status value. Allowed: unread, read, replied.',
    });
  }

  try {
    const [result] = await db.query(
      'UPDATE contact_messages SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Message status updated to "${status}".`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update message status.',
      error: error.message,
    });
  }
};