import bcrypt from 'bcryptjs';
import db from './db.js';

const seedSuperAdmin = async () => {
  const username = process.env.SEED_ADMIN_USERNAME;
  const email = process.env.SEED_ADMIN_EMAIL;
  const rawPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!username || !email || !rawPassword) {
    console.error('Set SEED_ADMIN_USERNAME, SEED_ADMIN_EMAIL, and SEED_ADMIN_PASSWORD in backend/.env before seeding.');
    process.exit(1);
  }

  try {
    const [existing] = await db.query('SELECT * FROM admin_users WHERE username = ? OR email = ?', [username, email]);
    
    if (existing.length > 0) {
      console.log('⚠️ Admin user already exists. Skipping seed.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    await db.query(
      'INSERT INTO admin_users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, 'super_admin']
    );

    console.log('✅ Default Super Admin created successfully!');
    console.log(`👤 Username: ${username}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedSuperAdmin();