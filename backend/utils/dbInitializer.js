const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = './db_crime.sqlite';

// Initialize database tables and test data
async function initializeDatabase(db) {
  return new Promise((resolve, reject) => {
    // Check if database has data
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
      if (err) {
        console.log('Creating tables...');
        createTables(db, (tableErr) => {
          if (tableErr) return reject(tableErr);
          insertTestData(db, (dataErr) => {
            if (dataErr) return reject(dataErr);
            resolve();
          });
        });
      } else if (row && row.count === 0) {
        console.log('Tables exist but empty. Seeding data...');
        insertTestData(db, (err) => {
          if (err) return reject(err);
          resolve();
        });
      } else {
        console.log('✓ Database already initialized with data');
        resolve();
      }
    });
  });
}

function createTables(db, callback) {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL CHECK(role IN ('Admin', 'Police', 'User')),
      station_id INTEGER,
      profile_pic TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Police table
    db.run(`CREATE TABLE IF NOT EXISTS police (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      police_id TEXT UNIQUE,
      name TEXT NOT NULL,
      crime_type TEXT,
      station_name TEXT,
      station_id TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Police Stations table
    db.run(`CREATE TABLE IF NOT EXISTS police_station (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_name TEXT NOT NULL,
      station_code TEXT UNIQUE,
      address TEXT NOT NULL,
      city TEXT,
      state TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      in_charge TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Criminals table
    db.run(`CREATE TABLE IF NOT EXISTS criminals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_name TEXT,
      station_id TEXT,
      crime_type TEXT NOT NULL,
      crime_date TEXT,
      crime_time TEXT,
      Prison_name TEXT,
      Court_name TEXT,
      Criminal_name TEXT NOT NULL,
      contact TEXT,
      DateOfBirth TEXT,
      email TEXT,
      state TEXT,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // FIRs table
    db.run(`CREATE TABLE IF NOT EXISTS firs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fir_number TEXT UNIQUE NOT NULL,
      station_id TEXT,
      station_name TEXT,
      complainant_name TEXT NOT NULL,
      complainant_phone TEXT,
      crime_type TEXT NOT NULL,
      crime_description TEXT,
      crime_date TEXT,
      crime_time TEXT,
      location TEXT,
      evidence TEXT,
      status TEXT DEFAULT 'Registered',
      assigned_police_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) return callback(err);
      console.log('✓ All tables created successfully');
      callback(null);
    });
  });
}

async function insertTestData(db, callback) {
  try {
    const hashedAdminPassword = await bcrypt.hash('password', 10);
    const hashedPolicePassword = await bcrypt.hash('password', 10);
    const hashedUserPassword = await bcrypt.hash('password', 10);

    db.serialize(() => {
      // Insert test users
      const users = [
        { username: 'admin123', email: 'admin@crime.gov', password: hashedAdminPassword, role: 'Admin', phone: '9999999999' },
        { username: 'testuser123', email: 'user@example.com', password: hashedUserPassword, role: 'User', phone: '8888888888' },
        { username: 'police001', email: 'police@station.gov', password: hashedPolicePassword, role: 'Police', phone: '7777777777', station_id: 1 }
      ];

      users.forEach(user => {
        db.run(
          `INSERT OR IGNORE INTO users (username, email, password, phone, role, station_id) VALUES (?, ?, ?, ?, ?, ?)`,
          [user.username, user.email, user.password, user.phone, user.role, user.station_id],
          (err) => {
            if (err) console.error('Insert user error:', err);
          }
        );
      });

      // Insert test police stations
      const stations = [
        { station_name: 'Central Police Station', station_code: 'CPS001', address: '123 Main St', city: 'Mumbai', state: 'Maharashtra', phone: '9111111111', email: 'central@police.gov', in_charge: 'Inspector John' },
        { station_name: 'North Police Station', station_code: 'NPS001', address: '456 North Ave', city: 'Mumbai', state: 'Maharashtra', phone: '9222222222', email: 'north@police.gov', in_charge: 'Inspector Smith' }
      ];

      stations.forEach(station => {
        db.run(
          `INSERT OR IGNORE INTO police_station (station_name, station_code, address, city, state, phone, email, in_charge) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [station.station_name, station.station_code, station.address, station.city, station.state, station.phone, station.email, station.in_charge]
        );
      });

      db.run(`SELECT last_insert_rowid() as id FROM police_station LIMIT 1`, (err, row) => {
        if (err) console.error('Error:', err);
        
        console.log('✓ Test data inserted successfully');
        console.log('\n📝 Test Credentials:');
        console.log('  Admin: admin123 / password');
        console.log('  User: testuser123 / password');
        console.log('  Police: police001 / password\n');
        callback(null);
      });
    });
  } catch (err) {
    callback(err);
  }
}

module.exports = { initializeDatabase };
