const bcrypt = require('bcrypt');

/**
 * Database Initializer
 * Supports both PostgreSQL and SQLite.
 * Creates tables, runs migrations, and seeds sample data.
 */

async function initializeDatabase(db) {
  const isPg = db.type === 'pg';
  
  return new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) as count FROM users", [], async (err, row) => {
      if (err) {
        console.log('Creating tables...');
        try {
          await createTables(db, isPg);
          await runMigrations(db, isPg);
          await insertTestData(db, isPg);
          resolve();
        } catch (e) { reject(e); }
      } else if (row && (row.count === 0 || row.count === '0')) {
        console.log('Tables exist but empty. Seeding data...');
        try {
          await runMigrations(db, isPg);
          await insertTestData(db, isPg);
          resolve();
        } catch (e) { reject(e); }
      } else {
        console.log('✓ Database already initialized with data');
        try { await runMigrations(db, isPg); } catch (e) { /* ignore */ }
        resolve();
      }
    });
  });
}

async function runMigrations(db, isPg) {
  return new Promise((resolve) => {
    if (isPg) {
      db.get(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'firs' AND column_name = 'user_id'`,
        [],
        (err, row) => {
          if (err || row) { resolve(); return; }
          console.log('Adding user_id column to firs table...');
          db.run('ALTER TABLE firs ADD COLUMN user_id INTEGER', [], (err) => {
            if (!err) console.log('✓ Added user_id column to firs table');
            resolve();
          });
        }
      );
    } else {
      db.all("PRAGMA table_info(firs)", (err, columns) => {
        if (err) { resolve(); return; }
        const hasUserIdColumn = columns && columns.some(col => col.name === 'user_id');
        if (!hasUserIdColumn) {
          console.log('Adding user_id column to firs table...');
          db.run('ALTER TABLE firs ADD COLUMN user_id INTEGER', [], (err) => {
            if (!err) console.log('✓ Added user_id column to firs table');
            resolve();
          });
        } else { resolve(); }
      });
    }
  });
}

async function createTables(db, isPg) {
  const auto = isPg ? 'SERIAL' : 'INTEGER';
  const autoKey = isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
  const ts = isPg ? 'TIMESTAMP' : 'DATETIME';

  // For PostgreSQL, use quoted names for mixed-case columns
  const criminalsCols = isPg
    ? `"Prison_name" TEXT, "Court_name" TEXT, "Criminal_name" TEXT NOT NULL, contact TEXT, "DateOfBirth" TEXT`
    : `Prison_name TEXT, Court_name TEXT, Criminal_name TEXT NOT NULL, contact TEXT, DateOfBirth TEXT`;

  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id ${autoKey}, username TEXT UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL, phone TEXT, role TEXT NOT NULL CHECK(role IN ('Admin', 'Police', 'User')),
      station_id INTEGER, profile_pic TEXT,
      created_at ${ts} DEFAULT CURRENT_TIMESTAMP, updated_at ${ts} DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS police (
      id ${autoKey}, police_id TEXT UNIQUE, name TEXT NOT NULL,
      crime_type TEXT, station_name TEXT, station_id TEXT, email TEXT, phone TEXT, address TEXT,
      created_at ${ts} DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS police_station (
      id ${autoKey}, station_name TEXT NOT NULL, station_code TEXT UNIQUE,
      address TEXT NOT NULL, city TEXT, state TEXT NOT NULL, phone TEXT, email TEXT, in_charge TEXT,
      created_at ${ts} DEFAULT CURRENT_TIMESTAMP, updated_at ${ts} DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS criminals (
      id ${autoKey}, station_name TEXT, station_id TEXT,
      crime_type TEXT NOT NULL, crime_date TEXT, crime_time TEXT,
      ${criminalsCols}, email TEXT, state TEXT, city TEXT, address TEXT, photo TEXT,
      status TEXT DEFAULT 'Active',
      created_at ${ts} DEFAULT CURRENT_TIMESTAMP, updated_at ${ts} DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS firs (
      id ${autoKey}, fir_number TEXT UNIQUE, user_id INTEGER,
      station_name TEXT, station_id TEXT, complainant_name TEXT, complainant_phone TEXT,
      crime_type TEXT NOT NULL, crime_description TEXT, crime_date TEXT, crime_time TEXT,
      location TEXT, evidence TEXT, accused TEXT, name TEXT, age INTEGER, number TEXT,
      address TEXT, relation TEXT, purpose TEXT, file TEXT, assigned_police_id TEXT,
      status TEXT DEFAULT 'Sent',
      created_at ${ts} DEFAULT CURRENT_TIMESTAMP, updated_at ${ts} DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS activity_log (
      id ${autoKey}, user_id INTEGER, activity_type TEXT, action TEXT, description TEXT,
      entity_type TEXT, entity_id INTEGER, icon TEXT,
      created_at ${ts} DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS crime_analysis (
      id ${autoKey}, period TEXT, crime_type TEXT, count INTEGER,
      location TEXT, severity TEXT, trend TEXT,
      created_at ${ts} DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const sql of tables) {
    await new Promise((resolve) => {
      db.run(sql, [], (err) => {
        if (err) console.error('Table creation error:', err.message || err);
        resolve();
      });
    });
  }
  console.log(`✓ All tables created successfully (${isPg ? 'PostgreSQL' : 'SQLite'})`);
}

async function insertTestData(db, isPg) {
  const hashed = await bcrypt.hash('password', 10);
  const oi = isPg ? 'INSERT INTO' : 'INSERT OR IGNORE INTO';
  const oc = isPg ? ' ON CONFLICT DO NOTHING' : '';

  const crimCols = isPg
    ? '(station_name, station_id, crime_type, crime_date, crime_time, "Prison_name", "Court_name", "Criminal_name", contact, "DateOfBirth", email, state, status)'
    : '(station_name, station_id, crime_type, crime_date, crime_time, Prison_name, Court_name, Criminal_name, contact, DateOfBirth, email, state, status)';

  const inserts = [
    // Users
    ...[ ['admin123','admin@crime.gov',hashed,'9999999999','Admin',null],
         ['testuser123','user@example.com',hashed,'8888888888','User',null],
         ['police001','police1@station.gov',hashed,'9111111111','Police',1],
         ['police002','police2@station.gov',hashed,'9111111112','Police',1],
         ['police003','police3@station.gov',hashed,'9222222222','Police',2],
         ['user002','user2@example.com',hashed,'8888888887','User',null],
         ['user003','user3@example.com',hashed,'8888888886','User',null]
    ].map(u => ({ sql: `${oi} users (username,email,password,phone,role,station_id) VALUES (?,?,?,?,?,?)${oc}`, params: u })),

    // Stations
    ...[ ['Central Police Station','CPS001','123 Main St','Mumbai','Maharashtra','9111111111','central@police.gov','Inspector John'],
         ['North Police Station','NPS001','456 North Ave','Mumbai','Maharashtra','9222222222','north@police.gov','Inspector Smith'],
         ['South Police Station','SPS001','789 South Blvd','Mumbai','Maharashtra','9333333333','south@police.gov','Inspector Williams'],
         ['East Police Station','EPS001','321 East Road','Mumbai','Maharashtra','9444444444','east@police.gov','Inspector Brown']
    ].map(s => ({ sql: `${oi} police_station (station_name,station_code,address,city,state,phone,email,in_charge) VALUES (?,?,?,?,?,?,?,?)${oc}`, params: s })),

    // Police
    ...[ ['POL001','Ramesh Kumar','Theft','Central Police Station','1','ramesh@police.gov','9111111111','123 Main St'],
         ['POL002','Priya Singh','Robbery','Central Police Station','1','priya@police.gov','9111111112','123 Main St'],
         ['POL003','Amit Patel','Burglary','North Police Station','2','amit@police.gov','9222222222','456 North Ave'],
         ['POL004','Kavya Reddy','Assault','South Police Station','3','kavya@police.gov','9333333333','789 South Blvd'],
         ['POL005','Rajesh Verma','Fraud','East Police Station','4','rajesh@police.gov','9444444444','321 East Road']
    ].map(p => ({ sql: `${oi} police (police_id,name,crime_type,station_name,station_id,email,phone,address) VALUES (?,?,?,?,?,?,?,?)${oc}`, params: p })),

    // Criminals
    ...[ ['Central Police Station','1','Theft','2026-02-15','14:30','Mumbai Central Jail','High Court Mumbai','Vikram Singh','9876543210','1990-05-10','vikram@email.com','Maharashtra','Active'],
         ['Central Police Station','1','Robbery','2026-02-10','22:15','Mumbai Central Jail','Sessions Court','Ravi Kapoor','9876543211','1992-03-20','ravi@email.com','Maharashtra','Active'],
         ['North Police Station','2','Burglary','2026-01-25','03:00','Yerwada Prison','District Court','Deepak Yadav','9876543212','1988-07-15','deepak@email.com','Maharashtra','Active'],
         ['South Police Station','3','Assault','2026-02-20','18:45','Nashik Prison','Civil Court','Arjun Nair','9876543213','1995-11-08','arjun@email.com','Maharashtra','Inactive'],
         ['East Police Station','4','Fraud','2026-02-01','10:30','Nagpur Prison','Economic Court','Nikhil Sharma','9876543214','1991-09-25','nikhil@email.com','Maharashtra','Active']
    ].map(c => ({ sql: `${oi} criminals ${crimCols} VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)${oc}`, params: c })),

    // FIRs
    ...[ ['FIR001/2026','1','Central Police Station','Testuser123','8888888888','Theft','Mobile phone stolen','2026-02-18','19:30','Bandra East, Mumbai','CCTV footage','Registered','POL001',2],
         ['FIR002/2026','1','Central Police Station','Testuser123','8888888888','Robbery','Bag snatched','2026-02-19','22:00','Dadar, Mumbai','Eyewitness','Under Investigation','POL002',2],
         ['FIR003/2026','2','North Police Station','User002','8888888887','Burglary','House break-in','2026-02-15','02:00','Bhal North, Mumbai','Fingerprints','Registered','POL003',6],
         ['FIR004/2026','3','South Police Station','User003','8888888886','Assault','Physical altercation','2026-02-17','17:15','Fort, Mumbai','Medical report','Under Investigation','POL004',7],
         ['FIR005/2026','4','East Police Station','Testuser123','8888888888','Fraud','Online money fraud','2026-02-16','11:00','Online','Bank records','Registered','POL005',2]
    ].map(f => ({ sql: `${oi} firs (fir_number,station_id,station_name,complainant_name,complainant_phone,crime_type,crime_description,crime_date,crime_time,location,evidence,status,assigned_police_id,user_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)${oc}`, params: f }))
  ];

  for (const { sql, params } of inserts) {
    await new Promise((resolve) => {
      db.run(sql, params, (err) => {
        if (err) console.error('Seed error:', err.message || err);
        resolve();
      });
    });
  }

  console.log('✓ All test data inserted successfully');
  console.log('\n📊 Sample Data: 7 Users, 4 Stations, 5 Police, 5 Criminals, 5 FIRs');
  console.log('📝 Credentials: admin123/password, testuser123/password, police001/password\n');
}

module.exports = { initializeDatabase };
