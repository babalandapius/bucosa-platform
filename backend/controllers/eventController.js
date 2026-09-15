import db from '../config/db.js';
import { getIO } from '../config/socket.js';

// @desc    Get All Upcoming Events (Public)
// @route   GET /api/v1/events
export const getEvents = async (req, res) => {
  try {
    const [events] = await db.query(
      'SELECT * FROM events ORDER BY event_date ASC'
    );
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch events.', error: error.message });
  }
};

// @desc    Get Single Event by ID (Public)
// @route   GET /api/v1/events/:id
export const getEventById = async (req, res) => {
  try {
    const [events] = await db.query('SELECT * FROM events WHERE id = ?', [req.params.id]);

    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    res.status(200).json({ success: true, data: events[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// @desc    Create New Event & Broadcast Real-Time Alert (Admin Only)
// @route   POST /api/v1/events
export const createEvent = async (req, res) => {
  const { title, description, event_date, venue, organizer } = req.body;
  const banner_url = req.file ? `/uploads/events/${req.file.filename}` : null;

  if (!title || !description || !event_date || !venue) {
    return res.status(400).json({ success: false, message: 'Title, description, date, and venue are required.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO events (title, description, event_date, venue, organizer, banner_url, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, event_date, venue, organizer || 'BUCoSA Executive', banner_url, req.user.id]
    );

    const newEvent = {
      id: result.insertId,
      title,
      description,
      event_date,
      venue,
      organizer: organizer || 'BUCoSA Executive',
      banner_url,
      created_at: new Date(),
    };

    // Real-Time Socket.io Broadcast to all online students
    try {
      const io = getIO();
      io.emit('newEventNotification', {
        message: `📢 New Event Announced: "${title}"`,
        event: newEvent,
      });
    } catch (socketError) {
      console.warn('Socket broadcast skipped:', socketError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Event created and real-time alert sent successfully.',
      data: newEvent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating event.', error: error.message });
  }
};