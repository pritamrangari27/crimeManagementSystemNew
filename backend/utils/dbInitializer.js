const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = './db_crime.sqlite';

// Initialize database tables and test data
async function initializeDatabase(db) {
  return new Promise((resolve, reject) => {
    // Check if database has data
    db.get("SELECT COUNT(*) as count FROM users", async (err, row) => {
      if (err) {
        console.log('Creating tables...');
        createTables(db, async (tableErr) => {
          if (tableErr) return reject(tableErr);
          await runMigrations(db);
          insertTestData(db, (dataErr) => {
            if (dataErr) return reject(dataErr);
            resolve();
          });
        });
      } else if (row && row.count === 0) {
        console.log('Tables exist but empty. Seeding data...');
        await runMigrations(db);
        insertTestData(db, (err) => {
          if (err) return reject(err);
          resolve();
        });
      } else {
        console.log('✓ Database already initialized with data');
        await runMigrations(db);
        resolve();
      }
    });
  });
}

// Run database migrations
async function runMigrations(db) {
  return new Promise((resolve) => {
    // Add user_id column to firs table if it doesn't exist
    db.all("PRAGMA table_info(firs)", (err, columns) => {
      if (err) {
        console.log('Could not check FIRs table structure');
        resolve();
        return;
      }

      const hasUserIdColumn = columns && columns.some(col => col.name === 'user_id');
      
      if (!hasUserIdColumn) {
        console.log('Adding user_id column to firs table...');
        db.run('ALTER TABLE firs ADD COLUMN user_id INTEGER', (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.log('Note:', err);
          } else if (!err) {
            console.log('✓ Added user_id column to firs table');
          }
          resolve();
        });
      } else {
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
      user_id INTEGER,
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
        { username: 'police001', email: 'police1@station.gov', password: hashedPolicePassword, role: 'Police', phone: '9111111111', station_id: 1 },
        { username: 'police002', email: 'police2@station.gov', password: hashedPolicePassword, role: 'Police', phone: '9111111112', station_id: 1 },
        { username: 'police003', email: 'police3@station.gov', password: hashedPolicePassword, role: 'Police', phone: '9222222222', station_id: 2 },
        { username: 'user002', email: 'user2@example.com', password: hashedUserPassword, role: 'User', phone: '8888888887' },
        { username: 'user003', email: 'user3@example.com', password: hashedUserPassword, role: 'User', phone: '8888888886' }
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
        { station_name: 'North Police Station', station_code: 'NPS001', address: '456 North Ave', city: 'Mumbai', state: 'Maharashtra', phone: '9222222222', email: 'north@police.gov', in_charge: 'Inspector Smith' },
        { station_name: 'South Police Station', station_code: 'SPS001', address: '789 South Blvd', city: 'Mumbai', state: 'Maharashtra', phone: '9333333333', email: 'south@police.gov', in_charge: 'Inspector Williams' },
        { station_name: 'East Police Station', station_code: 'EPS001', address: '321 East Road', city: 'Mumbai', state: 'Maharashtra', phone: '9444444444', email: 'east@police.gov', in_charge: 'Inspector Brown' }
      ];

      stations.forEach(station => {
        db.run(
          `INSERT OR IGNORE INTO police_station (station_name, station_code, address, city, state, phone, email, in_charge) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [station.station_name, station.station_code, station.address, station.city, station.state, station.phone, station.email, station.in_charge],
          (err) => {
            if (err) console.error('Insert station error:', err);
          }
        );
      });

      // Insert test police officers
      const policeOfficers = [
        { police_id: 'POL001', name: 'Ramesh Kumar', crime_type: 'Theft', station_name: 'Central Police Station', station_id: '1', email: 'ramesh@police.gov', phone: '9111111111', address: '123 Main St' },
        { police_id: 'POL002', name: 'Priya Singh', crime_type: 'Robbery', station_name: 'Central Police Station', station_id: '1', email: 'priya@police.gov', phone: '9111111112', address: '123 Main St' },
        { police_id: 'POL003', name: 'Amit Patel', crime_type: 'Burglary', station_name: 'North Police Station', station_id: '2', email: 'amit@police.gov', phone: '9222222222', address: '456 North Ave' },
        { police_id: 'POL004', name: 'Kavya Reddy', crime_type: 'Assault', station_name: 'South Police Station', station_id: '3', email: 'kavya@police.gov', phone: '9333333333', address: '789 South Blvd' },
        { police_id: 'POL005', name: 'Rajesh Verma', crime_type: 'Fraud', station_name: 'East Police Station', station_id: '4', email: 'rajesh@police.gov', phone: '9444444444', address: '321 East Road' }
      ];

      policeOfficers.forEach(officer => {
        db.run(
          `INSERT OR IGNORE INTO police (police_id, name, crime_type, station_name, station_id, email, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [officer.police_id, officer.name, officer.crime_type, officer.station_name, officer.station_id, officer.email, officer.phone, officer.address],
          (err) => {
            if (err) console.error('Insert police error:', err);
          }
        );
      });

      // Insert test criminals
      const criminals = [
        { station_name: 'Central Police Station', station_id: '1', crime_type: 'Theft', crime_date: '2026-02-15', crime_time: '14:30', Prison_name: 'Mumbai Central Jail', Court_name: 'High Court Mumbai', Criminal_name: 'Vikram Singh', contact: '9876543210', DateOfBirth: '1990-05-10', email: 'vikram@email.com', state: 'Maharashtra', status: 'Active' },
        { station_name: 'Central Police Station', station_id: '1', crime_type: 'Robbery', crime_date: '2026-02-10', crime_time: '22:15', Prison_name: 'Mumbai Central Jail', Court_name: 'Sessions Court', Criminal_name: 'Ravi Kapoor', contact: '9876543211', DateOfBirth: '1992-03-20', email: 'ravi@email.com', state: 'Maharashtra', status: 'Active' },
        { station_name: 'North Police Station', station_id: '2', crime_type: 'Burglary', crime_date: '2026-01-25', crime_time: '03:00', Prison_name: 'Yerwada Prison', Court_name: 'District Court', Criminal_name: 'Deepak Yadav', contact: '9876543212', DateOfBirth: '1988-07-15', email: 'deepak@email.com', state: 'Maharashtra', status: 'Active' },
        { station_name: 'South Police Station', station_id: '3', crime_type: 'Assault', crime_date: '2026-02-20', crime_time: '18:45', Prison_name: 'Nashik Prison', Court_name: 'Civil Court', Criminal_name: 'Arjun Nair', contact: '9876543213', DateOfBirth: '1995-11-08', email: 'arjun@email.com', state: 'Maharashtra', status: 'Inactive' },
        { station_name: 'East Police Station', station_id: '4', crime_type: 'Fraud', crime_date: '2026-02-01', crime_time: '10:30', Prison_name: 'Nagpur Prison', Court_name: 'Economic Court', Criminal_name: 'Nikhil Sharma', contact: '9876543214', DateOfBirth: '1991-09-25', email: 'nikhil@email.com', state: 'Maharashtra', status: 'Active' }
      ];

      criminals.forEach(criminal => {
        db.run(
          `INSERT OR IGNORE INTO criminals (station_name, station_id, crime_type, crime_date, crime_time, Prison_name, Court_name, Criminal_name, contact, DateOfBirth, email, state, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [criminal.station_name, criminal.station_id, criminal.crime_type, criminal.crime_date, criminal.crime_time, criminal.Prison_name, criminal.Court_name, criminal.Criminal_name, criminal.contact, criminal.DateOfBirth, criminal.email, criminal.state, criminal.status],
          (err) => {
            if (err) console.error('Insert criminal error:', err);
          }
        );
      });

      // Insert test FIRs
      const firs = [
        { fir_number: 'FIR001/2026', station_id: '1', station_name: 'Central Police Station', complainant_name: 'Testuser123', complainant_phone: '8888888888', crime_type: 'Theft', crime_description: 'Mobile phone stolen from home', crime_date: '2026-02-18', crime_time: '19:30', location: 'Bandra East, Mumbai', evidence: 'CCTV footage available', status: 'Registered', assigned_police_id: 'POL001', user_id: 2 },
        { fir_number: 'FIR002/2026', station_id: '1', station_name: 'Central Police Station', complainant_name: 'Testuser123', complainant_phone: '8888888888', crime_type: 'Robbery', crime_description: 'Bag snatched on street', crime_date: '2026-02-19', crime_time: '22:00', location: 'Dadar, Mumbai', evidence: 'Eyewitness statements', status: 'Under Investigation', assigned_police_id: 'POL002', user_id: 2 },
        { fir_number: 'FIR003/2026', station_id: '2', station_name: 'North Police Station', complainant_name: 'User002', complainant_phone: '8888888887', crime_type: 'Burglary', crime_description: 'House break-in', crime_date: '2026-02-15', crime_time: '02:00', location: 'Bhal North, Mumbai', evidence: 'Fingerprints collected', status: 'Registered', assigned_police_id: 'POL003', user_id: 6 },
        { fir_number: 'FIR004/2026', station_id: '3', station_name: 'South Police Station', complainant_name: 'User003', complainant_phone: '8888888886', crime_type: 'Assault', crime_description: 'Physical altercation', crime_date: '2026-02-17', crime_time: '17:15', location: 'Fort, Mumbai', evidence: 'Medical report', status: 'Under Investigation', assigned_police_id: 'POL004', user_id: 7 },
        { fir_number: 'FIR005/2026', station_id: '4', station_name: 'East Police Station', complainant_name: 'Testuser123', complainant_phone: '8888888888', crime_type: 'Fraud', crime_description: 'Online money fraud', crime_date: '2026-02-16', crime_time: '11:00', location: 'Online', evidence: 'Bank transaction records', status: 'Registered', assigned_police_id: 'POL005', user_id: 2 }
      ];

      firs.forEach(fir => {
        db.run(
          `INSERT OR IGNORE INTO firs (fir_number, station_id, station_name, complainant_name, complainant_phone, crime_type, crime_description, crime_date, crime_time, location, evidence, status, assigned_police_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [fir.fir_number, fir.station_id, fir.station_name, fir.complainant_name, fir.complainant_phone, fir.crime_type, fir.crime_description, fir.crime_date, fir.crime_time, fir.location, fir.evidence, fir.status, fir.assigned_police_id, fir.user_id],
          (err) => {
            if (err) console.error('Insert FIR error:', err);
          }
        );
      });

      console.log('✓ All test data inserted successfully');
      console.log('\n📊 Sample Data Added:');
      console.log('  ✓ 7 Users (3 police, 3 regular users, 1 admin)');
      console.log('  ✓ 4 Police Stations');
      console.log('  ✓ 5 Police Officers');
      console.log('  ✓ 5 Criminals');
      console.log('  ✓ 5 FIRs (First Information Reports)');
      console.log('\n📝 Test Credentials:');
      console.log('  Admin: admin123 / password');
      console.log('  User: testuser123 / password (has 3 FIRs)');
      console.log('  Police: police001 / password\n');
      callback(null);
    });
  } catch (err) {
    callback(err);
  }
}

module.exports = { initializeDatabase };
