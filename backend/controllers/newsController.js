import db from '../config/db.js';

// Helper utility to convert titles to URL-friendly slugs (e.g. "BUCoSA Hackathon 2026" -> "bucosa-hackathon-2026")
const createSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

// @desc    Get All Published News & Articles (Public)
// @route   GET /api/v1/news
export const getNewsArticles = async (req, res) => {
  const { category, search } = req.query;

  try {
    let query = `
      SELECT n.*, a.username as author_name 
      FROM news_articles n 
      LEFT JOIN admin_users a ON n.author_id = a.id 
      WHERE n.is_published = TRUE
    `;
    const params = [];

    if (category) {
      query += ' AND n.category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (n.title LIKE ? OR n.content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY n.created_at DESC';

    const [articles] = await db.query(query, params);

    res.status(200).json({ success: true, count: articles.length, data: articles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch news articles.', error: error.message });
  }
};

// @desc    Get Single Article by Slug or ID (Public)
// @route   GET /api/v1/news/:identifier
export const getArticleByIdentifier = async (req, res) => {
  const { identifier } = req.params;

  try {
    const isNumeric = !isNaN(identifier);
    const query = isNumeric
      ? 'SELECT n.*, a.username as author_name FROM news_articles n LEFT JOIN admin_users a ON n.author_id = a.id WHERE n.id = ?'
      : 'SELECT n.*, a.username as author_name FROM news_articles n LEFT JOIN admin_users a ON n.author_id = a.id WHERE n.slug = ?';

    const [articles] = await db.query(query, [identifier]);

    if (articles.length === 0) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    res.status(200).json({ success: true, data: articles[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// @desc    Create News Article (Admin Only)
// @route   POST /api/v1/news
export const createArticle = async (req, res) => {
  const { title, category, content, is_published } = req.body;
  const cover_image = req.file ? `/uploads/news/${req.file.filename}` : null;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required.' });
  }

  const baseSlug = createSlug(title);
  const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

  try {
    const [result] = await db.query(
      `INSERT INTO news_articles (title, slug, category, content, cover_image, author_id, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        uniqueSlug,
        category || 'General',
        content,
        cover_image,
        req.user.id,
        is_published !== undefined ? is_published : true,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Article published successfully.',
      data: {
        id: result.insertId,
        title,
        slug: uniqueSlug,
        cover_image,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create article.', error: error.message });
  }
};

// @desc    Delete Article (Admin Only)
// @route   DELETE /api/v1/news/:id
export const deleteArticle = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM news_articles WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    res.status(200).json({ success: true, message: 'Article deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete article.', error: error.message });
  }
};