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
      // Update Pritam user password
      db.run(
        `UPDATE users SET password = ? WHERE username = ? AND role = ?`,
        [pritamHash, 'Pritam', 'User'],
        function(err) {
          if (err) {
            console.error('Error updating Pritam password:', err);
          } else if (this.changes > 0) {
            console.log('✓ Pritam account updated!');
            console.log('  Username: Pritam');
            console.log('  Password: pritam123');
            console.log('  Role: User');
          } else {
            console.log('⚠ Pritam account not found');
          }
        }
      );

      // Update Admin account password
      db.run(
        `UPDATE users SET password = ? WHERE username = ? AND role = ?`,
        [adminHash, 'Admin', 'Admin'],
        function(err) {
          if (err) {
            console.error('Error updating Admin password:', err);
          } else if (this.changes > 0) {
            console.log('✓ Admin account updated!');
            console.log('  Username: Admin');
            console.log('  Password: admin123');
            console.log('  Role: Admin');
          } else {
            console.log('⚠ Admin account not found');
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
        console.log('\n✅ Credentials updated with bcrypt hashing!');
        console.log('\nYou can now login with:');
        console.log('  Username: Pritam  | Password: pritam123');
        console.log('  Username: Admin   | Password: admin123');
        process.exit(0);
      });
    }, 1000);
  } catch (error) {
    console.error('Error hashing passwords:', error);
    process.exit(1);
  }
};

updateCredentials();
