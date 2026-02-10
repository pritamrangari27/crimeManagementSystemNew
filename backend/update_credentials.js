const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./db_crime.sqlite', (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

const updateCredentials = async () => {
  try {
    // Hash new passwords
    const pritamHash = await bcrypt.hash('pritam123', 10);
    const adminHash = await bcrypt.hash('admin123', 10);

    db.serialize(() => {
      // First, let's check existing users
      db.all('SELECT id, username, role FROM users LIMIT 10', (err, rows) => {
        if (err) {
          console.error('Error fetching users:', err);
        } else {
          console.log('Current users in database:');
          rows.forEach(row => {
            console.log(`  ID: ${row.id}, Username: ${row.username}, Role: ${row.role}`);
          });
          console.log('');
        }
      });

      // Update User role user to Pritam with hashed password
      db.run(
        `UPDATE users SET username = ?, password = ? WHERE role = ? LIMIT 1`,
        ['Pritam', pritamHash, 'User'],
        function(err) {
          if (err) {
            console.error('Error updating User:', err);
          } else if (this.changes > 0) {
            console.log('✓ User account updated!');
            console.log('  New Username: Pritam');
            console.log('  New Password: pritam123');
            console.log('  Role: User');
          } else {
            console.log('⚠ No User role account found');
          }
        }
      );

      // Update Admin role user to Admin with hashed password
      db.run(
        `UPDATE users SET username = ?, password = ? WHERE role = ? LIMIT 1`,
        ['Admin', adminHash, 'Admin'],
        function(err) {
          if (err) {
            console.error('Error updating Admin:', err);
          } else if (this.changes > 0) {
            console.log('✓ Admin account updated!');
            console.log('  New Username: Admin');
            console.log('  New Password: admin123');
            console.log('  Role: Admin');
          } else {
            console.log('⚠ No Admin role account found');
          }
        }
      );
    });

    setTimeout(() => {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
          process.exit(1);
        }
        console.log('\n✅ Credentials updated successfully!');
        console.log('\nYou can now login with:');
        console.log('  - Pritam / pritam123 (User role)');
        console.log('  - Admin / admin123 (Admin role)');
        process.exit(0);
      });
    }, 1500);
  } catch (error) {
    console.error('Error hashing passwords:', error);
    process.exit(1);
  }
};

updateCredentials();
