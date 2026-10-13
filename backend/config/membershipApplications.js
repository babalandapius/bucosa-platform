import db from './db.js';

export const ensureMembershipApplicationsTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS membership_applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id VARCHAR(100) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      year_of_study INT NULL,
      course INT NOT NULL,
      activation_code_hash CHAR(64) NOT NULL UNIQUE,
      status ENUM('pending', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
      submitted_by INT NULL,
      reviewed_by INT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      reviewed_at TIMESTAMP NULL DEFAULT NULL,
      INDEX idx_membership_applications_status_created (status, created_at),
      INDEX idx_membership_applications_student (student_id, email)
    )
  `);
};
