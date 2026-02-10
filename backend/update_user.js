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
      // Update testuser123 to Pritam with hashed password
      db.run(
        `UPDATE users SET username = ?, password = ? WHERE username = ? AND role = ?`,
        ['Pritam', pritamHash, 'testuser123', 'User'],
        function(err) {
          if (err) {
            console.error('Error updating Pritam user:', err);
          } else if (this.changes > 0) {
            console.log('✓ User "Pritam" updated successfully!');
            console.log('  Username: Pritam');
            console.log('  Password: pritam123');
            console.log('  Role: User');
          } else {
            console.log('⚠ No user found to update for Pritam');
          }
        }
      );

      // Update admin123 to Admin with hashed password
      db.run(
        `UPDATE users SET username = ?, password = ? WHERE username = ? AND role = ?`,
        ['Admin', adminHash, 'admin123', 'Admin'],
        function(err) {
          if (err) {
            console.error('Error updating Admin user:', err);
          } else if (this.changes > 0) {
            console.log('✓ User "Admin" updated successfully!');
            console.log('  Username: Admin');
            console.log('  Password: admin123');
            console.log('  Role: Admin');
          } else {
            console.log('⚠ No admin user found to update');
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
        console.log('\n✅ All credentials updated with bcrypt hashing!');
        process.exit(0);
      });
    }, 1000);
  } catch (error) {
    console.error('Error hashing passwords:', error);
    process.exit(1);
  }
};

updateCredentials();
