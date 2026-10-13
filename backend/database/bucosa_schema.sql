-- BUCoSA Platform schema for MySQL/MariaDB (Laragon, phpMyAdmin, or MySQL CLI).
-- This creates an empty schema; it cannot restore records lost without a backup.

CREATE DATABASE IF NOT EXISTS bucosa_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bucosa_db;

CREATE TABLE IF NOT EXISTS admin_users (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'executive',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_users_username (username),
  UNIQUE KEY uq_admin_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS students (
  id INT NOT NULL AUTO_INCREMENT,
  student_id VARCHAR(100) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  year_of_study INT NULL,
  course INT NOT NULL,
  membership_id VARCHAR(100) NULL,
  card_url VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_students_student_id (student_id),
  UNIQUE KEY uq_students_email (email),
  UNIQUE KEY uq_students_membership_id (membership_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS membership_applications (
  id INT NOT NULL AUTO_INCREMENT,
  student_id VARCHAR(100) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  year_of_study INT NULL,
  course INT NOT NULL,
  activation_code_hash CHAR(64) NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
  submitted_by INT NULL,
  reviewed_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_membership_applications_activation_code (activation_code_hash),
  KEY idx_membership_applications_status_created (status, created_at),
  KEY idx_membership_applications_student (student_id, email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS events (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  event_date DATETIME NOT NULL,
  venue VARCHAR(255) NOT NULL,
  organizer VARCHAR(255) NOT NULL DEFAULT 'BUCoSA Executive',
  banner_url VARCHAR(500) NULL,
  created_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_events_event_date (event_date),
  KEY idx_events_created_by (created_by),
  CONSTRAINT fk_events_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS executives (
  id INT NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  position VARCHAR(150) NOT NULL,
  academic_year VARCHAR(50) NOT NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(50) NULL,
  bio TEXT NULL,
  photo_url VARCHAR(500) NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_executives_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS past_papers (
  id INT NOT NULL AUTO_INCREMENT,
  course_code VARCHAR(50) NOT NULL,
  course_title VARCHAR(255) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  semester VARCHAR(30) NOT NULL,
  year_of_study INT NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  uploaded_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_past_papers_course_code (course_code),
  KEY idx_past_papers_year_semester (year_of_study, semester),
  KEY idx_past_papers_uploaded_by (uploaded_by),
  CONSTRAINT fk_past_papers_uploaded_by
    FOREIGN KEY (uploaded_by) REFERENCES admin_users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('unread', 'read', 'replied') NOT NULL DEFAULT 'unread',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_contact_messages_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS news_articles (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  category ENUM('Announcement', 'Tech News', 'Workshop', 'General') NOT NULL DEFAULT 'General',
  content TEXT NOT NULL,
  cover_image VARCHAR(500) NULL,
  author_id INT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_news_articles_slug (slug),
  KEY idx_news_articles_author_id (author_id),
  KEY idx_news_articles_published_created (is_published, created_at),
  CONSTRAINT fk_news_articles_author
    FOREIGN KEY (author_id) REFERENCES admin_users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
