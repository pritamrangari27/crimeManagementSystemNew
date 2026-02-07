const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Delete existing database if it exists
const dbPath = './db_crime.sqlite';
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Old database deleted');
}

const db = new sqlite3.Database(dbPath);

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

  // FIR table - Named 'firs' to match code references
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

  console.log('Database schema created successfully!');
});

db.close();
