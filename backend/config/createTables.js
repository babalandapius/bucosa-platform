import db from './db.js';

const createAuthTables = async () => {
  try {
    await db.query(`
  CREATE TABLE IF NOT EXISTS news_articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  category ENUM('Announcement', 'Tech News', 'Workshop', 'General') DEFAULT 'General',
  content TEXT NOT NULL,
  cover_image VARCHAR(255),
  author_id INT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES admin_users(id) ON DELETE SET NULL
);
`);

    console.log('✅ news_articles tables created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    process.exit(1);
  }
};

createAuthTables();