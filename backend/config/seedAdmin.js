import bcrypt from 'bcryptjs';
import db from './db.js';

const seedSuperAdmin = async () => {
  const username = 'admin';
  const email = 'bucosa.busitema@gmail.com';
  const rawPassword = 'AdminPassword2026!'; 

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
    console.log(`🔑 Password: ${rawPassword}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedSuperAdmin();