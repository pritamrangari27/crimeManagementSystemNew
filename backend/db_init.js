const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = './db_crime.sqlite';

// Delete existing database to start fresh
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Old database deleted');
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

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
    station_id TEXT UNIQUE,
    state TEXT,
    address TEXT,
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
    city TEXT,
    address TEXT,
    photo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // FIR table
  db.run(`CREATE TABLE IF NOT EXISTS firs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    station_name TEXT,
    station_id TEXT,
    crime_type TEXT NOT NULL,
    accused TEXT,
    name TEXT,
    age INTEGER,
    number TEXT,
    address TEXT,
    relation TEXT,
    purpose TEXT,
    file TEXT,
    status TEXT DEFAULT 'Sent' CHECK(status IN ('Sent', 'Pending', 'Approved', 'Rejected', 'Investigating', 'Closed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // Crime Analysis table
  db.run(`CREATE TABLE IF NOT EXISTS crime_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period TEXT,
    crime_type TEXT,
    count INTEGER,
    location TEXT,
    severity TEXT,
    trend TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  console.log('✓ Database tables created');

  // Insert test users
  const insertUsers = [
    { username: 'admin123', email: 'admin@crime-system.com', password: 'password123', phone: '9876543210', role: 'Admin' },
    { username: 'testuser123', email: 'user@crime-system.com', password: 'password123', phone: '9123456789', role: 'User' },
    { username: 'police001', email: 'police1@crime-system.com', password: 'password123', phone: '9988776655', role: 'Police', station_id: 1 },
    { username: 'user_001', email: 'user001@crime-system.com', password: 'password123', phone: '9111222333', role: 'User' },
    { username: 'user_002', email: 'user002@crime-system.com', password: 'password123', phone: '9222333444', role: 'User' }
  ];

  insertUsers.forEach(user => {
    const sql = `INSERT OR IGNORE INTO users (username, email, password, phone, role, station_id) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [user.username, user.email, user.password, user.phone, user.role, user.station_id || null], 
      function(err) {
        if (err) {
          console.error(`Error inserting user ${user.username}:`, err);
        } else if (this.changes > 0) {
          console.log(`✓ User inserted: ${user.username}`);
        }
      }
    );
  });

  // Insert police stations
  const insertStations = [
    { station_name: 'Central Police Station', station_id: 'PS001', state: 'Delhi', address: '123 Main Street, Delhi' },
    { station_name: 'North Police Station', station_id: 'PS002', state: 'Delhi', address: '456 North Avenue, Delhi' },
    { station_name: 'South Police Station', station_id: 'PS003', state: 'Delhi', address: '789 South Road, Delhi' },
    { station_name: 'East Police Station', station_id: 'PS004', state: 'Delhi', address: '321 East Lane, Delhi' },
    { station_name: 'West Police Station', station_id: 'PS005', state: 'Delhi', address: '654 West Boulevard, Delhi' },
    { station_name: 'Mumbai Central Police Station', station_id: 'PS006', state: 'Maharashtra', address: '111 Marine Drive, Mumbai' },
    { station_name: 'Bangalore Police Station', station_id: 'PS007', state: 'Karnataka', address: '222 Brigade Road, Bangalore' },
    { station_name: 'Hyderabad Police Station', station_id: 'PS008', state: 'Telangana', address: '333 Secunderabad Road, Hyderabad' }
  ];

  insertStations.forEach(station => {
    const sql = `INSERT OR IGNORE INTO police_station (station_name, station_id, state, address) 
                 VALUES (?, ?, ?, ?)`;
    db.run(sql, [station.station_name, station.station_id, station.state, station.address], 
      function(err) {
        if (err) {
          console.error(`Error inserting station ${station.station_name}:`, err);
        } else if (this.changes > 0) {
          console.log(`✓ Police station inserted: ${station.station_name}`);
        }
      }
    );
  });
});

setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
      process.exit(1);
    }
    console.log('\n✅ Database initialization completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin: admin123 / password123');
    console.log('   User: testuser123 / password123');
    console.log('   Police: police001 / password123');
    process.exit(0);
  });
}, 2000);

