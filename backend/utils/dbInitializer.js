const bcrypt = require('bcrypt');

/**
 * Database Initializer — Supabase PostgreSQL
 * Creates tables, runs migrations, and seeds sample data.
 */

async function initializeDatabase(db) {
  return new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) as count FROM users", [], async (err, row) => {
      if (err) {
        console.log('Creating tables...');
        try {
          await createTables(db);
          await runMigrations(db);
          await insertTestData(db);
          resolve();
        } catch (e) { reject(e); }
      } else if (row && (parseInt(row.count) < 15)) {
        console.log(`Tables exist but only ${row.count} users. Seeding more data...`);
        try {
          await runMigrations(db);
          await insertTestData(db);
          resolve();
        } catch (e) { reject(e); }
      } else {
        console.log('✓ Database already initialized with data');
        try { await runMigrations(db); } catch (e) { /* ignore */ }
        resolve();
      }
    });
  });
}

async function runMigrations(db) {
  // Migration 1: Add user_id column to firs if missing
  await new Promise((resolve) => {
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
  });

  // Migration 2: Fix legacy FIR statuses → 'Sent'
  await new Promise((resolve) => {
    db.run(`UPDATE firs SET status = 'Sent' WHERE status NOT IN ('Sent', 'Approved', 'Rejected')`, [], (err) => {
      if (err) console.error('Status migration error:', err.message || err);
      else console.log('✓ Migrated legacy FIR statuses to Sent');
      resolve();
    });
  });

  // Migration 3: Add address column to users if missing
  await new Promise((resolve) => {
    db.get(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'address'`,
      [],
      (err, row) => {
        if (err || row) { resolve(); return; }
        console.log('Adding address column to users table...');
        db.run('ALTER TABLE users ADD COLUMN address TEXT', [], (err) => {
          if (!err) console.log('✓ Added address column to users table');
          resolve();
        });
      }
    );
  });

  // Migration 4: Add badge_number column to users if missing
  await new Promise((resolve) => {
    db.get(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'badge_number'`,
      [],
      (err, row) => {
        if (err || row) { resolve(); return; }
        console.log('Adding badge_number column to users table...');
        db.run('ALTER TABLE users ADD COLUMN badge_number TEXT', [], (err) => {
          if (!err) console.log('✓ Added badge_number column to users table');
          resolve();
        });
      }
    );
  });

  // Migration 5: Add latitude column to firs if missing
  await new Promise((resolve) => {
    db.get(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'firs' AND column_name = 'latitude'`,
      [],
      (err, row) => {
        if (err || row) { resolve(); return; }
        console.log('Adding latitude column to firs table...');
        db.run('ALTER TABLE firs ADD COLUMN latitude DOUBLE PRECISION', [], (err) => {
          if (!err) console.log('✓ Added latitude column to firs table');
          resolve();
        });
      }
    );
  });

  // Migration 6: Add longitude column to firs if missing
  await new Promise((resolve) => {
    db.get(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'firs' AND column_name = 'longitude'`,
      [],
      (err, row) => {
        if (err || row) { resolve(); return; }
        console.log('Adding longitude column to firs table...');
        db.run('ALTER TABLE firs ADD COLUMN longitude DOUBLE PRECISION', [], (err) => {
          if (!err) console.log('✓ Added longitude column to firs table');
          resolve();
        });
      }
    );
  });

  // Migration 7: Add latitude column to criminals if missing
  await new Promise((resolve) => {
    db.get(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'criminals' AND column_name = 'latitude'`,
      [],
      (err, row) => {
        if (err || row) { resolve(); return; }
        console.log('Adding latitude column to criminals table...');
        db.run('ALTER TABLE criminals ADD COLUMN latitude DOUBLE PRECISION', [], (err) => {
          if (!err) console.log('✓ Added latitude column to criminals table');
          resolve();
        });
      }
    );
  });

  // Migration 8: Add longitude column to criminals if missing
  await new Promise((resolve) => {
    db.get(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'criminals' AND column_name = 'longitude'`,
      [],
      (err, row) => {
        if (err || row) { resolve(); return; }
        console.log('Adding longitude column to criminals table...');
        db.run('ALTER TABLE criminals ADD COLUMN longitude DOUBLE PRECISION', [], (err) => {
          if (!err) console.log('✓ Added longitude column to criminals table');
          resolve();
        });
      }
    );
  });

  // Migration 9: Create notifications table
  await new Promise((resolve) => {
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      entity_type TEXT,
      entity_id INTEGER,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, [], (err) => {
      if (err && !err.message?.includes('already exists')) console.error('Migration 9:', err.message);
      else console.log('✓ notifications table ready');
      resolve();
    });
  });

  // Migration 10: Add workflow_stage to firs
  await new Promise((resolve) => {
    db.get(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'firs' AND column_name = 'workflow_stage'`,
      [], (err, row) => {
        if (err || row) { resolve(); return; }
        console.log('Adding workflow_stage column to firs table...');
        db.run(`ALTER TABLE firs ADD COLUMN workflow_stage TEXT DEFAULT 'FIR Filed'`, [], (err) => {
          if (!err) console.log('✓ Added workflow_stage column to firs table');
          resolve();
        });
      }
    );
  });

  // Migration 11: Add priority to firs
  await new Promise((resolve) => {
    db.get(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'firs' AND column_name = 'priority'`,
      [], (err, row) => {
        if (err || row) { resolve(); return; }
        db.run(`ALTER TABLE firs ADD COLUMN priority TEXT DEFAULT 'Medium'`, [], (err) => {
          if (!err) console.log('✓ Added priority column to firs table');
          resolve();
        });
      }
    );
  });

  // Migration 12: Create criminal_network table
  await new Promise((resolve) => {
    db.run(`CREATE TABLE IF NOT EXISTS criminal_network (
      id SERIAL PRIMARY KEY,
      criminal_id_1 INTEGER NOT NULL,
      criminal_id_2 INTEGER,
      link_type TEXT NOT NULL,
      fir_id INTEGER,
      description TEXT,
      strength INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, [], (err) => {
      if (err && !err.message?.includes('already exists')) console.error('Migration 12:', err.message);
      else console.log('✓ criminal_network table ready');
      resolve();
    });
  });

  // Migration 13: Add active_cases to police for workload tracking
  await new Promise((resolve) => {
    db.get(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'police' AND column_name = 'active_cases'`,
      [], (err, row) => {
        if (err || row) { resolve(); return; }
        db.run(`ALTER TABLE police ADD COLUMN active_cases INTEGER DEFAULT 0`, [], (err) => {
          if (!err) console.log('✓ Added active_cases column to police table');
          resolve();
        });
      }
    );
  });

  // Migration 14: Add latitude/longitude to police_station
  await new Promise((resolve) => {
    db.get(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'police_station' AND column_name = 'latitude'`,
      [], (err, row) => {
        if (err || row) { resolve(); return; }
        db.run(`ALTER TABLE police_station ADD COLUMN latitude DOUBLE PRECISION`, [], () => {
          db.run(`ALTER TABLE police_station ADD COLUMN longitude DOUBLE PRECISION`, [], (err) => {
            if (!err) console.log('✓ Added lat/lng columns to police_station table');
            resolve();
          });
        });
      }
    );
  });

  // Migration 15: Backfill fir_number for existing FIRs missing it
  await new Promise((resolve) => {
    db.all(`SELECT id FROM firs WHERE fir_number IS NULL OR fir_number = ''`, [], (err, rows) => {
      if (err || !rows || rows.length === 0) { resolve(); return; }
      let done = 0;
      rows.forEach((r) => {
        const yr = new Date().getFullYear();
        const num = `FIR-${yr}-MH-MUM-${String(r.id).padStart(5, '0')}`;
        db.run(`UPDATE firs SET fir_number = ? WHERE id = ?`, [num, r.id], () => {
          done++;
          if (done === rows.length) { console.log(`✓ Backfilled ${done} FIR numbers`); resolve(); }
        });
      });
    });
  });

  // Migration 16: Add department column to users if missing
  await new Promise((resolve) => {
    db.get(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'department'`,
      [], (err, row) => {
        if (err || row) { resolve(); return; }
        db.run(`ALTER TABLE users ADD COLUMN department TEXT`, [], (err) => {
          if (!err) console.log('✓ Added department column to users table');
          resolve();
        });
      }
    );
  });

  // Migration 17: Add gender column to criminals if missing
  await new Promise((resolve) => {
    db.get(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'criminals' AND column_name = 'gender'`,
      [], (err, row) => {
        if (err || row) { resolve(); return; }
        db.run(`ALTER TABLE criminals ADD COLUMN gender TEXT`, [], (err) => {
          if (!err) console.log('✓ Added gender column to criminals table');
          resolve();
        });
      }
    );
  });

  // Migration 18: Backfill department for existing Admin users
  await new Promise((resolve) => {
    db.run(`UPDATE users SET department = 'Crime Management Division' WHERE role = 'Admin' AND (department IS NULL OR department = '')`, [], (err) => {
      if (!err) console.log('✓ Backfilled department for Admin users');
      resolve();
    });
  });

  // Migration 19: Backfill address for existing users missing it
  await new Promise((resolve) => {
    db.run(`UPDATE users SET address = 'Mumbai, Maharashtra' WHERE (address IS NULL OR address = '') AND role = 'User'`, [], (err) => {
      if (!err) console.log('✓ Backfilled address for User accounts');
      resolve();
    });
  });

  // Migration 19b: Backfill address for Admin users missing it
  await new Promise((resolve) => {
    db.run(`UPDATE users SET address = 'Crime HQ, Crawford Market, Mumbai' WHERE (address IS NULL OR address = '') AND role = 'Admin'`, [], (err) => {
      if (!err) console.log('✓ Backfilled address for Admin accounts');
      resolve();
    });
  });

  // Migration 19c: Backfill address for Police users from their station
  await new Promise((resolve) => {
    db.run(`UPDATE users SET address = 'Police Station, Mumbai' WHERE (address IS NULL OR address = '') AND role = 'Police'`, [], (err) => {
      if (!err) console.log('✓ Backfilled address for Police accounts');
      resolve();
    });
  });

  // Migration 20: Backfill badge_number for Police users missing it
  await new Promise((resolve) => {
    db.run(`UPDATE users SET badge_number = 'MH-' || LPAD(id::text, 4, '0') WHERE role = 'Police' AND (badge_number IS NULL OR badge_number = '')`, [], (err) => {
      if (!err) console.log('✓ Backfilled badge_number for Police users');
      resolve();
    });
  });

  // Migration 20b: Backfill badge_number for Admin users missing it
  await new Promise((resolve) => {
    db.run(`UPDATE users SET badge_number = 'ADM-' || LPAD(id::text, 3, '0') WHERE role = 'Admin' AND (badge_number IS NULL OR badge_number = '')`, [], (err) => {
      if (!err) console.log('✓ Backfilled badge_number for Admin users');
      resolve();
    });
  });

  // Migration 21: Backfill gender for existing criminals missing it
  await new Promise((resolve) => {
    db.run(`UPDATE criminals SET gender = 'Male' WHERE gender IS NULL OR gender = ''`, [], (err) => {
      if (!err) console.log('✓ Backfilled gender for criminals');
      resolve();
    });
  });

  // Migration 22: Ensure accused column exists in firs
  await new Promise((resolve) => {
    db.get(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'firs' AND column_name = 'accused'`,
      [], (err, row) => {
        if (err || row) { resolve(); return; }
        db.run(`ALTER TABLE firs ADD COLUMN accused TEXT`, [], (err) => {
          if (!err) console.log('✓ Added accused column to firs table');
          resolve();
        });
      }
    );
  });

  // Migration 23: Ensure relation column exists in firs
  await new Promise((resolve) => {
    db.get(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'firs' AND column_name = 'relation'`,
      [], (err, row) => {
        if (err || row) { resolve(); return; }
        db.run(`ALTER TABLE firs ADD COLUMN relation TEXT`, [], (err) => {
          if (!err) console.log('✓ Added relation column to firs table');
          resolve();
        });
      }
    );
  });

  // Migration 24: Ensure address column exists in firs
  await new Promise((resolve) => {
    db.get(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'firs' AND column_name = 'address'`,
      [], (err, row) => {
        if (err || row) { resolve(); return; }
        db.run(`ALTER TABLE firs ADD COLUMN address TEXT`, [], (err) => {
          if (!err) console.log('✓ Added address column to firs table');
          resolve();
        });
      }
    );
  });

  // Migration 25: Populate accused, relation, address for all FIRs
  await new Promise((resolve) => {
    const firData = [
      { fir: 'FIR-2025-MH-MUM-00001', accused: 'Vikram Singh', relation: 'Stranger', address: 'Flat 12, Colaba Market Rd, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00002', accused: 'Ravi Kapoor', relation: 'Stranger', address: 'Navy Nagar, Colaba, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00003', accused: 'Deepak Yadav', relation: 'Stranger', address: '221 Churchgate Apts, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00004', accused: 'Arjun Nair', relation: 'Acquaintance', address: '45 Linking Road, Bandra, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00005', accused: 'Nikhil Sharma', relation: 'Online Contact', address: 'Lokhandwala Complex, Andheri, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00006', accused: 'Suresh Patil', relation: 'Stranger', address: '14 Shivaji Park Rd, Dadar, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00007', accused: 'Imran Khan', relation: 'Neighbor', address: 'IC Colony, Borivali West, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00008', accused: 'Ganesh More', relation: 'Stranger', address: 'BKC Apartments, Kurla, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00009', accused: 'Farid Shaikh', relation: 'Stranger', address: 'Powai Lake Area, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00010', accused: 'Ajay Tiwari', relation: 'Spouse', address: 'Irla Bridge, Vile Parle, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00011', accused: 'Santosh Gupta', relation: 'Business Rival', address: 'JVPD Scheme, Juhu, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00012', accused: 'Rafiq Patel', relation: 'Former Employee', address: 'Film City Rd, Goregaon, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00013', accused: 'Pravin Jagtap', relation: 'Stranger', address: 'Link Road, Malad West, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00014', accused: 'Dinesh Rathod', relation: 'Stranger', address: 'Gateway Area, Colaba, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00015', accused: 'Manish Tiwari', relation: 'Business Associate', address: 'Nariman Point, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00016', accused: 'Zakir Hussain', relation: 'Stranger', address: 'Bandra Reclamation, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00017', accused: 'Rohit Sawant', relation: 'Colleague', address: 'Four Bungalows, Andheri, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00018', accused: 'Vijay Sonawane', relation: 'Stranger', address: 'Dadar TT Circle, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00019', accused: 'Sunil Gaikwad', relation: 'Stranger', address: 'WEH, Borivali East, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00020', accused: 'Anil Bhosale', relation: 'Real Estate Agent', address: 'Nehru Nagar, Kurla, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00021', accused: 'Sagar Mhatre', relation: 'Stranger', address: 'Hiranandani Gardens, Powai, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00022', accused: 'Kishor Nikam', relation: 'Party Guest', address: 'Balaji Nagar, Vile Parle, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00023', accused: 'Bablu Shukla', relation: 'Stranger', address: 'DN Nagar, Juhu, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00024', accused: 'Wasim Ahmed', relation: 'Business Rival', address: 'Aarey Colony, Goregaon, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00025', accused: 'Pappu Yadav', relation: 'Stranger', address: 'Orlem, Malad West, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00026', accused: 'Chhota Rajan', relation: 'Stranger', address: 'Sassoon Dock, Colaba, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00027', accused: 'Kamal Haasan', relation: 'Stranger', address: 'Oval Maidan, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00028', accused: 'Sunny Leone', relation: 'Stranger', address: 'Turner Road, Bandra, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00029', accused: 'Mohan Agashe', relation: 'Spouse', address: 'Versova, Andheri West, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00030', accused: 'Bharat Jadhav', relation: 'Business Associate', address: 'Prabhadevi, Dadar, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00031', accused: 'Akbar Ali', relation: 'Stranger', address: 'Dahisar Check Naka, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00032', accused: 'Ramzan Shaikh', relation: 'Stranger', address: 'LBS Marg, Kurla, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00033', accused: 'Guddu Pandit', relation: 'Stranger', address: 'Chandivali, Powai, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00034', accused: 'Firoz Khan', relation: 'Neighbor', address: 'Parle East, Mumbai' },
      { fir: 'FIR-2025-MH-MUM-00035', accused: 'Babu Bhai', relation: 'Stranger', address: 'Juhu Beach Rd, Mumbai' }
    ];
    
    let done = 0;
    firData.forEach((data) => {
      db.run(
        `UPDATE firs SET accused = ?, relation = ?, address = ? WHERE fir_number = ?`,
        [data.accused, data.relation, data.address, data.fir],
        (err) => {
          done++;
          if (done === firData.length) {
            console.log(`✓ Populated accused, relation, address for ${firData.length} FIRs`);
            resolve();
          }
        }
      );
    });
  });

  // Migration 26: Backfill missing accused, relation, and address for all FIRs with realistic data
  await new Promise((resolve) => {
    // First, get all FIRs with missing data
    db.all(
      `SELECT id, fir_number, station_id, crime_type FROM firs WHERE 
       (accused IS NULL OR accused = '') OR 
       (relation IS NULL OR relation = '') OR 
       (address IS NULL OR address = '')`,
      [],
      (err, firs) => {
        if (err || !firs || firs.length === 0) {
          console.log('✓ All FIRs have accused, relation, and address data');
          resolve();
          return;
        }

        // Proper Indian names (realistic accused names)
        const accusedNames = [
          'Rajesh Kumar', 'Amit Singh', 'Vikram Patel', 'Arjun Nair',
          'Nikhil Sharma', 'Suresh Deshmukh', 'Imran Khan', 'Ganesh More',
          'Farid Shaikh', 'Ajay Tiwari', 'Santosh Gupta', 'Rafiq Patel',
          'Pravin Jagtap', 'Dinesh Rathod', 'Manish Tiwari', 'Zakir Hussain',
          'Rohit Sawant', 'Vijay Sonawane', 'Sunil Gaikwad', 'Anil Bhosale',
          'Sagar Mhatre', 'Kishor Nikam', 'Bablu Shukla', 'Wasim Ahmed',
          'Pappu Yadav', 'Chhota Rajan', 'Kamal Haasan', 'Mohan Agashe',
          'Bharat Jadhav', 'Akbar Ali', 'Ramzan Shaikh', 'Guddu Pandit',
          'Firoz Khan', 'Babu Bhai', 'Harish Reddy', 'Pradeep Kumar',
          'Vivek Malhotra', 'Atul Joshi', 'Sanjay Verma', 'Harsh Pandey'
        ];
        
        // Proper relationship types
        const relations = [
          'Victim', 'Witness', 'Complainant', 'Friend', 'Family Member',
          'Neighbor', 'Colleague', 'Business Associate', 'Employee',
          'Employer', 'Acquaintance', 'Stranger', 'Unknown Person',
          'Online Acquaintance', 'Former Partner', 'Spouse', 'Tenant',
          'Landlord', 'Customer', 'Vendor', 'Client'
        ];
        
        // Proper Mumbai addresses
        const addresses = [
          'Flat 12, Colaba Market Rd, Mumbai 400001',
          'Navy Nagar, Colaba, Mumbai 400005',
          '221 Churchgate Apts, Fort, Mumbai 400020',
          '45 Linking Road, Bandra West, Mumbai 400050',
          'Lokhandwala Complex, Andheri West, Mumbai 400053',
          '14 Shivaji Park Rd, Dadar East, Mumbai 400014',
          'IC Colony, Borivali West, Mumbai 400092',
          'BKC Apartments, Kurla West, Mumbai 400070',
          'Hiranandani Gardens, Powai, Mumbai 400076',
          'Irla Bridge, Vile Parle, Mumbai 400056',
          'JVPD Scheme, Juhu, Mumbai 400049',
          'Film City Road, Goregaon West, Mumbai 400062',
          'Link Road, Malad West, Mumbai 400064',
          'Gateway Area, Colaba, Mumbai 400005',
          'Nariman Point, South Mumbai 400021',
          'Bandra Reclamation, Bandra, Mumbai 400050',
          'Four Bungalows, Andheri, Mumbai 400053',
          'Dadar TT Circle, Dadar East, Mumbai 400014',
          'Western Express Highway, Borivali, Mumbai 400092',
          'Nehru Nagar, Kurla, Mumbai 400070',
          'Balaji Nagar, Vile Parle, Mumbai 400056',
          'DN Nagar, Juhu, Mumbai 400049',
          'Aarey Colony, Goregaon, Mumbai 400065',
          'Orlem, Malad West, Mumbai 400064',
          'Sassoon Dock, Colaba, Mumbai 400005',
          'Oval Maidan, South Mumbai 400001',
          'Turner Road, Bandra, Mumbai 400050',
          'Versova, Andheri West, Mumbai 400061',
          'Prabhadevi, Dadar, Mumbai 400025',
          'Dahisar Check Naka, Mumbai 400068',
          'LBS Marg, Kurla, Mumbai 400070',
          'Chandivali, Powai, Mumbai 400072',
          'Parle East, Mumbai 400057',
          'Juhu Beach Road, Juhu, Mumbai 400049',
          'Banasthali Cross Road, Vile Parle, Mumbai 400056',
          '42 C Wing, Building A, Mahim, Mumbai 400016',
          'Plot 89, Sector 5, Airoli, Mumbai 400708'
        ];

        let completed = 0;
        firs.forEach((fir) => {
          const accused = !fir.accused || fir.accused.trim() === '' 
            ? accusedNames[Math.floor(Math.random() * accusedNames.length)]
            : fir.accused;
          
          const relation = !fir.relation || fir.relation.trim() === ''
            ? relations[Math.floor(Math.random() * relations.length)]
            : fir.relation;
          
          const address = !fir.address || fir.address.trim() === ''
            ? addresses[Math.floor(Math.random() * addresses.length)]
            : fir.address;

          db.run(
            `UPDATE firs SET accused = ?, relation = ?, address = ? WHERE id = ?`,
            [accused, relation, address, fir.id],
            (err) => {
              completed++;
              if (completed === firs.length) {
                console.log(`✓ Backfilled ${firs.length} FIRs with proper accused names, relations, and addresses`);
                resolve();
              }
            }
          );
        });
      }
    );
  });

  // Migration 27: Replace old placeholder values with proper data
  await new Promise((resolve) => {
    const accusedNames = [
      'Rajesh Kumar', 'Amit Singh', 'Vikram Patel', 'Arjun Nair',
      'Nikhil Sharma', 'Suresh Deshmukh', 'Imran Khan', 'Ganesh More',
      'Farid Shaikh', 'Ajay Tiwari', 'Santosh Gupta', 'Rafiq Patel',
      'Pravin Jagtap', 'Dinesh Rathod', 'Manish Tiwari', 'Zakir Hussain',
      'Rohit Sawant', 'Vijay Sonawane', 'Sunil Gaikwad', 'Anil Bhosale',
      'Sagar Mhatre', 'Kishor Nikam', 'Bablu Shukla', 'Wasim Ahmed',
      'Pappu Yadav', 'Chhota Rajan', 'Kamal Haasan', 'Mohan Agashe',
      'Bharat Jadhav', 'Akbar Ali', 'Ramzan Shaikh', 'Guddu Pandit',
      'Firoz Khan', 'Babu Bhai', 'Harish Reddy', 'Pradeep Kumar',
      'Vivek Malhotra', 'Atul Joshi', 'Sanjay Verma', 'Harsh Pandey'
    ];

    const relations = [
      'Victim', 'Witness', 'Complainant', 'Friend', 'Family Member',
      'Neighbor', 'Colleague', 'Business Associate', 'Employee',
      'Employer', 'Acquaintance', 'Stranger', 'Unknown Person',
      'Online Acquaintance', 'Former Partner', 'Spouse', 'Tenant',
      'Landlord', 'Customer', 'Vendor', 'Client'
    ];

    const addresses = [
      'Flat 12, Colaba Market Rd, Mumbai 400001',
      'Navy Nagar, Colaba, Mumbai 400005',
      '221 Churchgate Apts, Fort, Mumbai 400020',
      '45 Linking Road, Bandra West, Mumbai 400050',
      'Lokhandwala Complex, Andheri West, Mumbai 400053',
      '14 Shivaji Park Rd, Dadar East, Mumbai 400014',
      'IC Colony, Borivali West, Mumbai 400092',
      'BKC Apartments, Kurla West, Mumbai 400070',
      'Hiranandani Gardens, Powai, Mumbai 400076',
      'Irla Bridge, Vile Parle, Mumbai 400056',
      'JVPD Scheme, Juhu, Mumbai 400049',
      'Film City Road, Goregaon West, Mumbai 400062',
      'Link Road, Malad West, Mumbai 400064',
      'Gateway Area, Colaba, Mumbai 400005',
      'Nariman Point, South Mumbai 400021',
      'Bandra Reclamation, Bandra, Mumbai 400050',
      'Four Bungalows, Andheri, Mumbai 400053',
      'Dadar TT Circle, Dadar East, Mumbai 400014',
      'Western Express Highway, Borivali, Mumbai 400092',
      'Nehru Nagar, Kurla, Mumbai 400070',
      'Balaji Nagar, Vile Parle, Mumbai 400056',
      'DN Nagar, Juhu, Mumbai 400049',
      'Aarey Colony, Goregaon, Mumbai 400065',
      'Orlem, Malad West, Mumbai 400064',
      'Sassoon Dock, Colaba, Mumbai 400005',
      'Oval Maidan, South Mumbai 400001',
      'Turner Road, Bandra, Mumbai 400050',
      'Versova, Andheri West, Mumbai 400061',
      'Prabhadevi, Dadar, Mumbai 400025',
      'Dahisar Check Naka, Mumbai 400068',
      'LBS Marg, Kurla, Mumbai 400070',
      'Chandivali, Powai, Mumbai 400072',
      'Parle East, Mumbai 400057',
      'Juhu Beach Road, Juhu, Mumbai 400049'
    ];

    // Get FIRs with old placeholder values
    db.all(
      `SELECT id FROM firs WHERE 
       (accused LIKE '%Person of Interest%' OR accused LIKE '%Alleged Perpetrator%' OR accused LIKE '%Unknown Suspect%' OR accused LIKE '%Unidentified%' OR accused LIKE '%Suspect at Large%' OR accused LIKE '%Unnamed%') OR
       (relation LIKE '%Unknown Relationship%') OR
       (address LIKE '%To Be Determined%' OR address LIKE '%Location Unknown%' OR address LIKE '%Anonymous Location%' OR address LIKE '%Not Specified%' OR address LIKE '%Undisclosed%' OR address LIKE '%Under Investigation%')`,
      [],
      (err, firs) => {
        if (err || !firs || firs.length === 0) {
          console.log('✓ All FIRs have proper data (no placeholders found)');
          resolve();
          return;
        }

        let completed = 0;
        firs.forEach((fir) => {
          const newAccused = accusedNames[Math.floor(Math.random() * accusedNames.length)];
          const newRelation = relations[Math.floor(Math.random() * relations.length)];
          const newAddress = addresses[Math.floor(Math.random() * addresses.length)];

          db.run(
            `UPDATE firs SET accused = ?, relation = ?, address = ? WHERE id = ?`,
            [newAccused, newRelation, newAddress, fir.id],
            (err) => {
              completed++;
              if (completed === firs.length) {
                console.log(`✓ Replaced placeholder values in ${firs.length} FIRs with proper names, relations, and addresses`);
                resolve();
              }
            }
          );
        });
      }
    );
  });

  // Migration 28: Add position column to police and backfill with data
  await new Promise((resolve) => {
    db.get(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'police' AND column_name = 'position'`,
      [],
      (err, row) => {
        if (err || row) { 
          // Column already exists, just backfill if needed
          db.all(
            `SELECT id FROM police WHERE position IS NULL OR position = ''`,
            [],
            (err, police) => {
              if (err || !police || police.length === 0) {
                console.log('✓ All police officers have position data');
                resolve();
                return;
              }

              const positions = [
                'Police Officer', 'Senior Police Officer', 'Inspector',
                'Senior Inspector', 'Assistant Commissioner', 'Sub-Inspector',
                'Head Constable', 'Constable', 'Patrolman', 'Detective',
                'Detective Inspector', 'Sergeant', 'Corporal', 'Police Woman',
                'Crime Scene Investigator', 'Traffic Police', 'Cyber Police',
                'Street Enforcement Officer', 'Surveillance Officer', 'Narcotics Officer',
                'Homicide Detective', 'Theft Detective', 'Fraud Investigator'
              ];

              let completed = 0;
              police.forEach((p) => {
                const position = positions[Math.floor(Math.random() * positions.length)];
                db.run(
                  `UPDATE police SET position = ? WHERE id = ?`,
                  [position, p.id],
                  () => {
                    completed++;
                    if (completed === police.length) {
                      console.log(`✓ Backfilled position data for ${police.length} police officers`);
                      resolve();
                    }
                  }
                );
              });
            }
          );
          return;
        }

        // Column doesn't exist, create it
        console.log('Adding position column to police table...');
        db.run(`ALTER TABLE police ADD COLUMN position TEXT`, [], (err) => {
          if (err) {
            console.error('Error adding position column:', err.message);
            resolve();
            return;
          }
          console.log('✓ Added position column to police table');
          
          // Now backfill with data
          const positions = [
            'Police Officer', 'Senior Police Officer', 'Inspector',
            'Senior Inspector', 'Assistant Commissioner', 'Sub-Inspector',
            'Head Constable', 'Constable', 'Patrolman', 'Detective',
            'Detective Inspector', 'Sergeant', 'Corporal', 'Police Woman',
            'Crime Scene Investigator', 'Traffic Police', 'Cyber Police',
            'Street Enforcement Officer', 'Surveillance Officer', 'Narcotics Officer',
            'Homicide Detective', 'Theft Detective', 'Fraud Investigator'
          ];

          db.all(`SELECT id FROM police`, [], (err, police) => {
            if (err || !police || police.length === 0) {
              console.log('✓ No police officers to backfill');
              resolve();
              return;
            }

            let completed = 0;
            police.forEach((p) => {
              const position = positions[Math.floor(Math.random() * positions.length)];
              db.run(
                `UPDATE police SET position = ? WHERE id = ?`,
                [position, p.id],
                () => {
                  completed++;
                  if (completed === police.length) {
                    console.log(`✓ Backfilled position data for ${police.length} police officers`);
                    resolve();
                  }
                }
              );
            });
          });
        });
      }
    );
  });

  // Migration 29: Fix workflow stage naming inconsistencies (Chargesheet Filed -> Charge Sheet Filed, Trial -> Court Proceedings)
  await new Promise((resolve) => {
    console.log('Standardizing workflow stage names...');
    let completed = 0;
    const updates = [
      { oldValue: 'Chargesheet Filed', newValue: 'Charge Sheet Filed' },
      { oldValue: 'Trial', newValue: 'Court Proceedings' }
    ];

    updates.forEach((update) => {
      db.run(
        `UPDATE firs SET workflow_stage = ? WHERE workflow_stage = ?`,
        [update.newValue, update.oldValue],
        function(err) {
          if (err) {
            console.error(`Error updating workflow stage: ${err.message}`);
          } else if (this.changes > 0) {
            console.log(`✓ Updated ${this.changes} FIR records: ${update.oldValue} → ${update.newValue}`);
          }
          completed++;
          if (completed === updates.length) {
            resolve();
          }
        }
      );
    });
  });

  // Migration 30: Fix FIRs with station codes as station_name (POW001 → Powai Police Station)
  await new Promise((resolve) => {
    console.log('Fixing FIR station names (codes → full names)...');
    // Map of station codes to station names
    const stationMapping = {
      'POW001': 'Powai Police Station',
      'COL001': 'Colaba Police Station',
      'MRD001': 'Marine Drive Police Station',
      'BND001': 'Bandra Police Station',
      'AND001': 'Andheri Police Station',
      'DAD001': 'Dadar Police Station',
      'BOR001': 'Borivali Police Station',
      'KUR001': 'Kurla Police Station',
      'VLP001': 'Vile Parle Police Station',
      'JUH001': 'Juhu Police Station',
      'GOR001': 'Goregaon Police Station',
      'MAL001': 'Malad Police Station'
    };

    let completed = 0;
    const codes = Object.keys(stationMapping);
    
    if (codes.length === 0) {
      resolve();
      return;
    }

    codes.forEach((code) => {
      const fullName = stationMapping[code];
      db.run(
        `UPDATE firs SET station_name = ? WHERE station_name = ?`,
        [fullName, code],
        function(err) {
          if (!err && this.changes > 0) {
            console.log(`✓ Fixed ${this.changes} FIR records: ${code} → ${fullName}`);
          }
          completed++;
          if (completed === codes.length) {
            resolve();
          }
        }
      );
    });
  });
}

async function createTables(db) {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY, username TEXT UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL, phone TEXT, address TEXT, role TEXT NOT NULL CHECK(role IN ('Admin', 'Police', 'User')),
      station_id INTEGER, badge_number TEXT, department TEXT, profile_pic TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS police (
      id SERIAL PRIMARY KEY, police_id TEXT UNIQUE, name TEXT NOT NULL,
      crime_type TEXT, station_name TEXT, station_id TEXT, email TEXT, phone TEXT, address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS police_station (
      id SERIAL PRIMARY KEY, station_name TEXT NOT NULL, station_code TEXT UNIQUE,
      address TEXT NOT NULL, city TEXT, state TEXT NOT NULL, phone TEXT, email TEXT, in_charge TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS criminals (
      id SERIAL PRIMARY KEY, station_name TEXT, station_id TEXT,
      crime_type TEXT NOT NULL, crime_date TEXT, crime_time TEXT,
      "Prison_name" TEXT, "Court_name" TEXT, "Criminal_name" TEXT NOT NULL, contact TEXT, "DateOfBirth" TEXT,
      email TEXT, state TEXT, city TEXT, address TEXT, photo TEXT, gender TEXT,
      latitude DOUBLE PRECISION, longitude DOUBLE PRECISION,
      status TEXT DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS firs (
      id SERIAL PRIMARY KEY, fir_number TEXT UNIQUE, user_id INTEGER,
      station_name TEXT, station_id TEXT, complainant_name TEXT, complainant_phone TEXT,
      crime_type TEXT NOT NULL, crime_description TEXT, crime_date TEXT, crime_time TEXT,
      location TEXT, evidence TEXT, accused TEXT, name TEXT, age INTEGER, number TEXT,
      address TEXT, relation TEXT, purpose TEXT, file TEXT, assigned_police_id TEXT,
      latitude DOUBLE PRECISION, longitude DOUBLE PRECISION,
      status TEXT DEFAULT 'Sent',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS activity_log (
      id SERIAL PRIMARY KEY, user_id INTEGER, activity_type TEXT, action TEXT, description TEXT,
      entity_type TEXT, entity_id INTEGER, icon TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS crime_analysis (
      id SERIAL PRIMARY KEY, period TEXT, crime_type TEXT, count INTEGER,
      location TEXT, severity TEXT, trend TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  console.log('✓ All tables created successfully (PostgreSQL)');
}

async function insertTestData(db) {
  const hashed = await bcrypt.hash('password', 10);

  // Helper to run a batch of inserts
  const runBatch = async (items) => {
    for (const { sql, params } of items) {
      await new Promise((resolve) => {
        db.run(sql, params, (err) => {
          if (err) console.error('Seed error:', err.message || err);
          resolve();
        });
      });
    }
  };

  // ─── STATIONS (12) ───
  const stationData = [
    ['Colaba Police Station','COL001','Shahid Bhagat Singh Rd, Colaba','Mumbai','Maharashtra','022-22151111','colaba@police.gov','Inspector R. Sharma',18.9067,72.8147],
    ['Marine Drive Police Station','MRD001','Netaji Subhash Chandra Bose Rd','Mumbai','Maharashtra','022-22152222','marine@police.gov','Inspector A. Kulkarni',18.9432,72.8235],
    ['Bandra Police Station','BND001','Hill Road, Bandra West','Mumbai','Maharashtra','022-22153333','bandra@police.gov','Inspector S. Patil',19.0544,72.8377],
    ['Andheri Police Station','AND001','SV Road, Andheri West','Mumbai','Maharashtra','022-22154444','andheri@police.gov','Inspector V. Deshmukh',19.1197,72.8464],
    ['Dadar Police Station','DAD001','Dadar TT, Dadar East','Mumbai','Maharashtra','022-22155555','dadar@police.gov','Inspector M. Jadhav',19.0178,72.8478],
    ['Borivali Police Station','BOR001','LT Road, Borivali West','Mumbai','Maharashtra','022-22156666','borivali@police.gov','Inspector K. Pawar',19.2307,72.8567],
    ['Kurla Police Station','KUR001','CST Road, Kurla West','Mumbai','Maharashtra','022-22157777','kurla@police.gov','Inspector D. Shinde',19.0726,72.8791],
    ['Powai Police Station','POW001','Hiranandani Gardens, Powai','Mumbai','Maharashtra','022-22158888','powai@police.gov','Inspector T. Nair',19.1176,72.9060],
    ['Vile Parle Police Station','VLP001','Irla, Vile Parle West','Mumbai','Maharashtra','022-22159999','vileparle@police.gov','Inspector P. Rao',19.0968,72.8362],
    ['Juhu Police Station','JUH001','Juhu Tara Road, Juhu','Mumbai','Maharashtra','022-22160000','juhu@police.gov','Inspector N. Mehta',19.1075,72.8263],
    ['Goregaon Police Station','GOR001','SV Road, Goregaon West','Mumbai','Maharashtra','022-22161111','goregaon@police.gov','Inspector B. Sawant',19.1663,72.8486],
    ['Malad Police Station','MAL001','Marve Road, Malad West','Mumbai','Maharashtra','022-22162222','malad@police.gov','Inspector C. Kamble',19.1874,72.8484]
  ];
  await runBatch(stationData.map(s => ({
    sql: `INSERT INTO police_station (station_name,station_code,address,city,state,phone,email,in_charge,latitude,longitude) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT (station_code) DO NOTHING`,
    params: s
  })));

  // ─── USERS (35) ───
  const userData = [
    ['admin123','admin@crime.gov',hashed,'9999999999','Admin',null,'Crime HQ, Crawford Market, Mumbai','ADM-001','Crime Management Division'],
    ['superadmin','superadmin@crime.gov',hashed,'9999999998','Admin',null,'Crime HQ, Crawford Market, Mumbai','ADM-002','Crime Management Division'],
    ['testuser123','user@example.com',hashed,'8888888888','User',null,'12, Colaba Causeway, Mumbai',null,null],
    ['user002','user2@example.com',hashed,'8888888887','User',null,'45, Marine Drive, Mumbai',null,null],
    ['user003','user3@example.com',hashed,'8888888886','User',null,'78, Bandra West, Mumbai',null,null],
    ['rahul_verma','rahul.v@gmail.com',hashed,'9876501001','User',null,'23, Shivaji Park, Dadar, Mumbai',null,null],
    ['sneha_kapoor','sneha.k@gmail.com',hashed,'9876501002','User',null,'56, IC Colony, Borivali, Mumbai',null,null],
    ['amit_joshi','amit.j@outlook.com',hashed,'9876501003','User',null,'89, BKC, Kurla, Mumbai',null,null],
    ['priya_nair','priya.n@yahoo.com',hashed,'9876501004','User',null,'34, Hiranandani, Powai, Mumbai',null,null],
    ['vikash_gupta','vikash.g@gmail.com',hashed,'9876501005','User',null,'67, Irla Bridge, Vile Parle, Mumbai',null,null],
    ['ananya_singh','ananya.s@gmail.com',hashed,'9876501006','User',null,'12, JVPD Scheme, Juhu, Mumbai',null,null],
    ['rishi_mehta','rishi.m@outlook.com',hashed,'9876501007','User',null,'45, Film City Road, Goregaon, Mumbai',null,null],
    ['deepika_rao','deepika.r@gmail.com',hashed,'9876501008','User',null,'78, Malad Link Road, Mumbai',null,null],
    ['karan_shah','karan.s@yahoo.com',hashed,'9876501009','User',null,'23, Nariman Point, Mumbai',null,null],
    ['meera_pillai','meera.p@gmail.com',hashed,'9876501010','User',null,'56, Worli Sea Face, Mumbai',null,null],
    ['arjun_das','arjun.d@gmail.com',hashed,'9876501011','User',null,'89, Andheri East, Mumbai',null,null],
    ['pooja_thakur','pooja.t@outlook.com',hashed,'9876501012','User',null,'34, Juhu Beach Road, Mumbai',null,null],
    ['siddharth_iyer','sid.i@gmail.com',hashed,'9876501013','User',null,'67, Prabhadevi, Mumbai',null,null],
    ['neha_sharma','neha.sh@gmail.com',hashed,'9876501014','User',null,'12, Western Express Highway, Mumbai',null,null],
    ['rohan_patil','rohan.p@yahoo.com',hashed,'9876501015','User',null,'45, LBS Marg, Kurla, Mumbai',null,null],
    ['police001','police1@station.gov',hashed,'9111111111','Police',1,'Colaba Police Station, Mumbai','POL001',null],
    ['police002','police2@station.gov',hashed,'9111111112','Police',1,'Colaba Police Station, Mumbai','POL002',null],
    ['police003','police3@station.gov',hashed,'9222222222','Police',2,'Marine Drive Police Station, Mumbai','POL003',null],
    ['police004','police4@station.gov',hashed,'9222222223','Police',3,'Bandra Police Station, Mumbai','POL004',null],
    ['police005','police5@station.gov',hashed,'9333333333','Police',4,'Andheri Police Station, Mumbai','POL005',null],
    ['police006','police6@station.gov',hashed,'9333333334','Police',5,'Dadar Police Station, Mumbai','POL006',null],
    ['police007','police7@station.gov',hashed,'9444444444','Police',6,'Borivali Police Station, Mumbai','POL007',null],
    ['police008','police8@station.gov',hashed,'9444444445','Police',7,'Kurla Police Station, Mumbai','POL008',null],
    ['police009','police9@station.gov',hashed,'9555555555','Police',8,'Powai Police Station, Mumbai','POL009',null],
    ['police010','police10@station.gov',hashed,'9555555556','Police',9,'Vile Parle Police Station, Mumbai','POL010',null],
    ['police011','police11@station.gov',hashed,'9666666666','Police',10,'Juhu Police Station, Mumbai','POL011',null],
    ['police012','police12@station.gov',hashed,'9666666667','Police',11,'Goregaon Police Station, Mumbai','POL012',null],
    ['police013','police13@station.gov',hashed,'9777777777','Police',12,'Malad Police Station, Mumbai','POL013',null],
    ['police014','police14@station.gov',hashed,'9777777778','Police',1,'Colaba Police Station, Mumbai','POL014',null],
    ['police015','police15@station.gov',hashed,'9888888881','Police',2,'Marine Drive Police Station, Mumbai','POL015',null]
  ];
  await runBatch(userData.map(u => ({
    sql: `INSERT INTO users (username,email,password,phone,role,station_id,address,badge_number,department) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT (username) DO NOTHING`,
    params: u
  })));

  // ─── POLICE (30) ───
  const policeData = [
    ['POL001','Ramesh Kumar','Theft','Colaba Police Station','1','ramesh.k@police.gov','9111111111','Colaba, Mumbai'],
    ['POL002','Priya Singh','Robbery','Colaba Police Station','1','priya.s@police.gov','9111111112','Colaba, Mumbai'],
    ['POL003','Amit Patel','Burglary','Marine Drive Police Station','2','amit.p@police.gov','9222222222','Marine Drive, Mumbai'],
    ['POL004','Kavya Reddy','Assault','Bandra Police Station','3','kavya.r@police.gov','9222222223','Bandra, Mumbai'],
    ['POL005','Rajesh Verma','Fraud','Andheri Police Station','4','rajesh.v@police.gov','9333333333','Andheri, Mumbai'],
    ['POL006','Sunita Deshmukh','Cybercrime','Dadar Police Station','5','sunita.d@police.gov','9333333334','Dadar, Mumbai'],
    ['POL007','Vikas Jadhav','Murder','Borivali Police Station','6','vikas.j@police.gov','9444444444','Borivali, Mumbai'],
    ['POL008','Neeta Patil','Kidnapping','Kurla Police Station','7','neeta.p@police.gov','9444444445','Kurla, Mumbai'],
    ['POL009','Arun Nair','Drug Trafficking','Powai Police Station','8','arun.n@police.gov','9555555555','Powai, Mumbai'],
    ['POL010','Deepa Kulkarni','Domestic Violence','Vile Parle Police Station','9','deepa.k@police.gov','9555555556','Vile Parle, Mumbai'],
    ['POL011','Sanjay Shinde','Extortion','Juhu Police Station','10','sanjay.s@police.gov','9666666666','Juhu, Mumbai'],
    ['POL012','Rekha Pawar','Arson','Goregaon Police Station','11','rekha.p@police.gov','9666666667','Goregaon, Mumbai'],
    ['POL013','Manoj Kamble','Vehicle Theft','Malad Police Station','12','manoj.k@police.gov','9777777777','Malad, Mumbai'],
    ['POL014','Geeta Sawant','Chain Snatching','Colaba Police Station','1','geeta.s@police.gov','9777777778','Colaba, Mumbai'],
    ['POL015','Prakash Rao','Forgery','Marine Drive Police Station','2','prakash.r@police.gov','9888888881','Marine Drive, Mumbai'],
    ['POL016','Aarti Mehta','Smuggling','Bandra Police Station','3','aarti.m@police.gov','9888888882','Bandra, Mumbai'],
    ['POL017','Ravi Sharma','Theft','Andheri Police Station','4','ravi.sh@police.gov','9888888883','Andheri, Mumbai'],
    ['POL018','Pallavi Joshi','Robbery','Dadar Police Station','5','pallavi.j@police.gov','9888888884','Dadar, Mumbai'],
    ['POL019','Nitin Gaikwad','Assault','Borivali Police Station','6','nitin.g@police.gov','9888888885','Borivali, Mumbai'],
    ['POL020','Smita Bhosale','Fraud','Kurla Police Station','7','smita.b@police.gov','9888888886','Kurla, Mumbai'],
    ['POL021','Ashok Tawde','Cybercrime','Powai Police Station','8','ashok.t@police.gov','9888888887','Powai, Mumbai'],
    ['POL022','Vandana More','Murder','Vile Parle Police Station','9','vandana.m@police.gov','9888888888','Vile Parle, Mumbai'],
    ['POL023','Kiran Salunkhe','Kidnapping','Juhu Police Station','10','kiran.sal@police.gov','9888888889','Juhu, Mumbai'],
    ['POL024','Devendra Chavan','Drug Trafficking','Goregaon Police Station','11','devendra.c@police.gov','9888888890','Goregaon, Mumbai'],
    ['POL025','Lata Wagh','Domestic Violence','Malad Police Station','12','lata.w@police.gov','9888888891','Malad, Mumbai'],
    ['POL026','Sachin Mane','Extortion','Colaba Police Station','1','sachin.m@police.gov','9888888892','Colaba, Mumbai'],
    ['POL027','Bhagyashri Londhe','Arson','Marine Drive Police Station','2','bhagya.l@police.gov','9888888893','Marine Drive, Mumbai'],
    ['POL028','Tushar Deshpande','Vehicle Theft','Bandra Police Station','3','tushar.d@police.gov','9888888894','Bandra, Mumbai'],
    ['POL029','Madhuri Kale','Chain Snatching','Andheri Police Station','4','madhuri.k@police.gov','9888888895','Andheri, Mumbai'],
    ['POL030','Hemant Ghate','Forgery','Dadar Police Station','5','hemant.g@police.gov','9888888896','Dadar, Mumbai']
  ];
  await runBatch(policeData.map(p => ({
    sql: `INSERT INTO police (police_id,name,crime_type,station_name,station_id,email,phone,address) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT (police_id) DO NOTHING`,
    params: p
  })));

  // ─── CRIMINALS (35) ───
  const criminalData = [
    ['Colaba Police Station','1','Theft','2025-11-15','14:30','Mumbai Central Jail','High Court Mumbai','Vikram Singh','9876543210','1990-05-10','vikram.s@email.com','Maharashtra','Mumbai','Colaba Market Rd',18.9220,72.8347,'Active','Male'],
    ['Colaba Police Station','1','Robbery','2025-12-10','22:15','Mumbai Central Jail','Sessions Court','Ravi Kapoor','9876543211','1992-03-20','ravi.k@email.com','Maharashtra','Pune','Navy Nagar',18.9100,72.8100,'Active','Male'],
    ['Marine Drive Police Station','2','Burglary','2025-10-25','03:00','Yerwada Prison','District Court','Deepak Yadav','9876543212','1988-07-15','deepak.y@email.com','Karnataka','Bangalore','Churchgate Area',18.9352,72.8272,'Active','Male'],
    ['Bandra Police Station','3','Assault','2026-01-20','18:45','Arthur Road Jail','Civil Court','Arjun Nair','9876543213','1995-11-08','arjun.n@email.com','Kerala','Kochi','Linking Road',19.0596,72.8295,'Inactive','Male'],
    ['Andheri Police Station','4','Fraud','2026-01-01','10:30','Thane Jail','Economic Court','Nikhil Sharma','9876543214','1991-09-25','nikhil.sh@email.com','Delhi','New Delhi','Andheri Lokhandwala',19.1364,72.8296,'Active','Male'],
    ['Dadar Police Station','5','Cybercrime','2025-09-18','16:00','Mumbai Central Jail','Cyber Court','Suresh Patil','9876543215','1993-01-12','suresh.p@email.com','Maharashtra','Mumbai','Shivaji Park',19.0254,72.8390,'Active','Male'],
    ['Borivali Police Station','6','Murder','2025-08-05','01:30','Yerwada Prison','High Court Mumbai','Imran Khan','9876543216','1985-06-22','imran.k@email.com','Uttar Pradesh','Lucknow','IC Colony',19.2290,72.8565,'Active','Male'],
    ['Kurla Police Station','7','Kidnapping','2025-11-30','20:00','Arthur Road Jail','Sessions Court','Ganesh More','9876543217','1989-12-03','ganesh.m@email.com','Tamil Nadu','Chennai','Kurla BKC',19.0650,72.8750,'Active','Male'],
    ['Powai Police Station','8','Drug Trafficking','2026-02-14','05:45','Thane Jail','NDPS Court','Farid Shaikh','9876543218','1987-04-18','farid.s@email.com','Gujarat','Ahmedabad','Powai Lake Area',19.1250,72.9050,'Active','Male'],
    ['Vile Parle Police Station','9','Domestic Violence','2025-07-22','21:00','Mumbai Central Jail','Family Court','Ajay Tiwari','9876543219','1994-08-30','ajay.t@email.com','Rajasthan','Jaipur','Irla Bridge',19.1000,72.8350,'Inactive','Male'],
    ['Juhu Police Station','10','Extortion','2025-12-28','12:00','Arthur Road Jail','Sessions Court','Santosh Gupta','9876543220','1986-02-14','santosh.g@email.com','Maharashtra','Nagpur','JVPD Scheme',19.1050,72.8300,'Active','Male'],
    ['Goregaon Police Station','11','Arson','2025-06-10','23:30','Yerwada Prison','District Court','Rafiq Patel','9876543221','1990-10-05','rafiq.p@email.com','Telangana','Hyderabad','Film City Rd',19.1660,72.8500,'Inactive','Male'],
    ['Malad Police Station','12','Vehicle Theft','2026-01-18','04:15','Thane Jail','Magistrate Court','Pravin Jagtap','9876543222','1996-03-28','pravin.j@email.com','West Bengal','Kolkata','Malad Link Rd',19.1860,72.8490,'Active','Male'],
    ['Colaba Police Station','1','Chain Snatching','2025-10-05','17:45','Arthur Road Jail','Sessions Court','Dinesh Rathod','9876543223','1993-07-19','dinesh.r@email.com','Madhya Pradesh','Indore','Gateway Area',18.9217,72.8347,'Active','Male'],
    ['Marine Drive Police Station','2','Forgery','2025-11-12','09:30','Mumbai Central Jail','High Court Mumbai','Manish Tiwari','9876543224','1988-11-01','manish.t@email.com','Maharashtra','Thane','Nariman Point',18.9250,72.8230,'Active','Male'],
    ['Bandra Police Station','3','Smuggling','2025-08-20','02:00','Yerwada Prison','Sessions Court','Zakir Hussain','9876543225','1984-09-15','zakir.h@email.com','Goa','Panaji','Bandra Reclamation',19.0450,72.8200,'Active','Male'],
    ['Andheri Police Station','4','Theft','2026-02-01','13:00','Thane Jail','Magistrate Court','Rohit Sawant','9876543226','1997-05-20','rohit.sw@email.com','Maharashtra','Mumbai','Four Bungalows',19.1300,72.8250,'Active','Male'],
    ['Dadar Police Station','5','Robbery','2025-12-15','19:30','Arthur Road Jail','Sessions Court','Vijay Sonawane','9876543227','1991-01-08','vijay.s@email.com','Punjab','Chandigarh','Dadar TT',19.0180,72.8470,'Active','Male'],
    ['Borivali Police Station','6','Assault','2025-09-28','16:45','Mumbai Central Jail','Civil Court','Sunil Gaikwad','9876543228','1994-04-22','sunil.g@email.com','Andhra Pradesh','Visakhapatnam','Sanjay Gandhi Natl Park',19.2350,72.8700,'Inactive','Male'],
    ['Kurla Police Station','7','Fraud','2026-01-10','11:15','Yerwada Prison','Economic Court','Anil Bhosale','9876543229','1989-08-14','anil.b@email.com','Bihar','Patna','Nehru Nagar',19.0700,72.8800,'Active','Male'],
    ['Powai Police Station','8','Cybercrime','2025-10-20','08:00','Thane Jail','Cyber Court','Sagar Mhatre','9876543230','1992-12-25','sagar.m@email.com','Maharashtra','Pune','Hiranandani',19.1180,72.9070,'Active','Male'],
    ['Vile Parle Police Station','9','Theft','2025-07-05','15:30','Mumbai Central Jail','Magistrate Court','Kishor Nikam','9876543231','1995-06-11','kishor.n@email.com','Karnataka','Mysore','Balaji Nagar',19.0950,72.8380,'Active','Male'],
    ['Juhu Police Station','10','Murder','2025-12-01','00:30','Yerwada Prison','High Court Mumbai','Bablu Shukla','9876543232','1983-03-17','bablu.sh@email.com','Uttar Pradesh','Varanasi','DN Nagar',19.1020,72.8280,'Active','Male'],
    ['Goregaon Police Station','11','Kidnapping','2025-11-08','22:00','Arthur Road Jail','Sessions Court','Wasim Ahmed','9876543233','1990-07-30','wasim.a@email.com','Maharashtra','Nashik','Aarey Colony',19.1580,72.8650,'Active','Male'],
    ['Malad Police Station','12','Drug Trafficking','2026-02-05','06:30','Thane Jail','NDPS Court','Pappu Yadav','9876543234','1986-11-28','pappu.y@email.com','Jharkhand','Ranchi','Orlem',19.1900,72.8370,'Active','Male'],
    ['Colaba Police Station','1','Extortion','2025-09-15','14:00','Mumbai Central Jail','Sessions Court','Chhota Rajan','9876543235','1982-01-20','chhota.r@email.com','Delhi','New Delhi','Sassoon Dock',18.9150,72.8320,'Active','Male'],
    ['Marine Drive Police Station','2','Assault','2025-08-12','20:30','Arthur Road Jail','Civil Court','Kamal Haasan','9876543236','1993-02-09','kamal.h@email.com','Tamil Nadu','Coimbatore','Oval Maidan',18.9320,72.8260,'Inactive','Male'],
    ['Bandra Police Station','3','Burglary','2026-01-25','03:45','Yerwada Prison','District Court','Sunny Leone','9876543237','1991-04-15','sunny.l@email.com','Haryana','Gurgaon','Turner Road',19.0560,72.8320,'Active','Female'],
    ['Andheri Police Station','4','Domestic Violence','2025-10-30','19:00','Mumbai Central Jail','Family Court','Mohan Agashe','9876543238','1988-06-05','mohan.a@email.com','Gujarat','Surat','Versova',19.1300,72.8130,'Inactive','Male'],
    ['Dadar Police Station','5','Forgery','2025-12-20','10:45','Thane Jail','High Court Mumbai','Bharat Jadhav','9876543239','1990-09-18','bharat.j@email.com','Maharashtra','Mumbai','Prabhadevi',19.0145,72.8300,'Active','Male'],
    ['Borivali Police Station','6','Smuggling','2025-07-15','01:00','Yerwada Prison','Sessions Court','Akbar Ali','9876543240','1985-12-10','akbar.a@email.com','Kerala','Thiruvananthapuram','Dahisar Check Naka',19.2500,72.8620,'Active','Male'],
    ['Kurla Police Station','7','Vehicle Theft','2026-02-08','04:30','Arthur Road Jail','Magistrate Court','Ramzan Shaikh','9876543241','1997-02-22','ramzan.s@email.com','Chhattisgarh','Raipur','LBS Marg',19.0670,72.8840,'Active','Male'],
    ['Powai Police Station','8','Chain Snatching','2025-11-22','17:15','Mumbai Central Jail','Sessions Court','Guddu Pandit','9876543242','1994-10-07','guddu.p@email.com','Odisha','Bhubaneswar','Chandivali',19.1100,72.8950,'Active','Male'],
    ['Vile Parle Police Station','9','Arson','2025-06-25','23:00','Yerwada Prison','District Court','Firoz Khan','9876543243','1989-05-30','firoz.k@email.com','Assam','Guwahati','Parle East',19.0990,72.8500,'Inactive','Male'],
    ['Juhu Police Station','10','Robbery','2025-09-08','21:30','Thane Jail','Sessions Court','Babu Bhai','9876543244','1987-08-16','babu.b@email.com','Rajasthan','Udaipur','Juhu Beach Rd',19.0980,72.8260,'Active','Male']
  ];
  await runBatch(criminalData.map(c => ({
    sql: `INSERT INTO criminals (station_name,station_id,crime_type,crime_date,crime_time,"Prison_name","Court_name","Criminal_name",contact,"DateOfBirth",email,state,city,address,latitude,longitude,status,gender) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    params: c
  })));

  // ─── FIRs (35) — spread across users, stations, statuses, dates, priorities, lat/lng ───
  const firData = [
    ['FIR-2025-MH-MUM-00001',1,'Colaba Police Station','Testuser123','8888888888','Theft','Mobile phone stolen at Colaba Causeway market while shopping','2025-11-18','19:30','Colaba Causeway, Mumbai','CCTV footage','Sent','POL001',3,18.9220,72.8347,'FIR Filed','Medium'],
    ['FIR-2025-MH-MUM-00002',1,'Colaba Police Station','Testuser123','8888888888','Robbery','Gold chain snatched near Gateway of India at night','2025-12-19','22:00','Gateway of India, Mumbai','Eyewitness','Approved','POL002',3,18.9217,72.8347,'Investigation','High'],
    ['FIR-2025-MH-MUM-00003',2,'Marine Drive Police Station','User002','8888888887','Burglary','House break-in at Churchgate apartment, valuables worth 5L stolen','2025-10-15','02:00','Churchgate, Mumbai','Fingerprints, CCTV','Sent','POL003',4,18.9352,72.8272,'FIR Filed','High'],
    ['FIR-2025-MH-MUM-00004',3,'Bandra Police Station','User003','8888888886','Assault','Physical altercation outside nightclub on Linking Road','2026-01-17','17:15','Linking Road, Bandra','Medical report','Rejected','POL004',5,19.0596,72.8295,'Closed','Low'],
    ['FIR-2025-MH-MUM-00005',4,'Andheri Police Station','Testuser123','8888888888','Fraud','Online investment fraud, lost Rs 2L to fake scheme','2026-01-16','11:00','Lokhandwala, Andheri','Bank statements','Sent','POL005',3,19.1364,72.8296,'FIR Filed','High'],
    ['FIR-2025-MH-MUM-00006',5,'Dadar Police Station','rahul_verma','9876501001','Cybercrime','Email hacking and unauthorized bank transfers','2025-09-20','16:00','Shivaji Park, Dadar','Transaction logs','Approved','POL006',6,19.0254,72.8390,'Charge Sheet Filed','High'],
    ['FIR-2025-MH-MUM-00007',6,'Borivali Police Station','sneha_kapoor','9876501002','Murder','Suspicious death reported in IC Colony residential area','2025-08-10','01:30','IC Colony, Borivali','Forensic report','Approved','POL007',7,19.2290,72.8565,'Court Proceedings','High'],
    ['FIR-2025-MH-MUM-00008',7,'Kurla Police Station','amit_joshi','9876501003','Kidnapping','Minor child abducted from school premises','2025-11-30','20:00','BKC, Kurla','Witness testimony','Approved','POL008',8,19.0650,72.8750,'Investigation','High'],
    ['FIR-2025-MH-MUM-00009',8,'Powai Police Station','priya_nair','9876501004','Drug Trafficking','Drug peddling near Powai Lake recreational area','2026-02-14','05:45','Powai Lake, Mumbai','Drug seizure report','Sent','POL009',9,19.1250,72.9050,'FIR Filed','High'],
    ['FIR-2025-MH-MUM-00010',9,'Vile Parle Police Station','vikash_gupta','9876501005','Domestic Violence','Repeated domestic abuse reported by spouse','2025-07-22','21:00','Irla, Vile Parle','Medical certificates','Approved','POL010',10,19.1000,72.8350,'Investigation','Medium'],
    ['FIR-2025-MH-MUM-00011',10,'Juhu Police Station','ananya_singh','9876501006','Extortion','Business owner threatened for protection money','2025-12-28','12:00','JVPD Scheme, Juhu','Audio recording','Sent','POL011',11,19.1050,72.8300,'FIR Filed','Medium'],
    ['FIR-2025-MH-MUM-00012',11,'Goregaon Police Station','rishi_mehta','9876501007','Arson','Deliberate fire set in warehouse causing heavy damage','2025-06-10','23:30','Film City Road, Goregaon','Fire dept report','Approved','POL012',12,19.1660,72.8500,'Charge Sheet Filed','High'],
    ['FIR-2025-MH-MUM-00013',12,'Malad Police Station','deepika_rao','9876501008','Vehicle Theft','Two-wheeler stolen from office parking','2026-01-18','04:15','Link Road, Malad','Parking CCTV','Sent','POL013',13,19.1860,72.8490,'FIR Filed','Low'],
    ['FIR-2025-MH-MUM-00014',1,'Colaba Police Station','karan_shah','9876501009','Chain Snatching','Gold chain snatched while jogging on Marine Drive','2025-10-05','17:45','Marine Drive, Mumbai','Witness','Approved','POL014',14,18.9432,72.8235,'Investigation','Medium'],
    ['FIR-2025-MH-MUM-00015',2,'Marine Drive Police Station','meera_pillai','9876501010','Forgery','Forged property documents submitted to bank for loan','2025-11-12','09:30','Nariman Point, Mumbai','Document evidence','Rejected','POL015',15,18.9250,72.8230,'Closed','Medium'],
    ['FIR-2025-MH-MUM-00016',3,'Bandra Police Station','arjun_das','9876501011','Smuggling','Contraband goods found in cargo at Bandra station','2025-08-25','02:00','Bandra Station, Mumbai','Customs report','Approved','POL016',16,19.0544,72.8377,'Court Proceedings','High'],
    ['FIR-2025-MH-MUM-00017',4,'Andheri Police Station','pooja_thakur','9876501012','Theft','Laptop stolen from co-working space in Andheri','2026-02-01','13:00','Four Bungalows, Andheri','CCTV footage','Sent','POL017',17,19.1300,72.8250,'FIR Filed','Low'],
    ['FIR-2025-MH-MUM-00018',5,'Dadar Police Station','siddharth_iyer','9876501013','Robbery','ATM cash van robbery near Dadar TT','2025-12-15','19:30','Dadar TT, Mumbai','CCTV, Shell casings','Approved','POL018',18,19.0180,72.8470,'Charge Sheet Filed','High'],
    ['FIR-2025-MH-MUM-00019',6,'Borivali Police Station','neha_sharma','9876501014','Assault','Road rage assault on Western Express Highway','2025-09-28','16:45','WEH, Borivali','Dashcam video','Rejected','POL019',19,19.2350,72.8700,'Closed','Low'],
    ['FIR-2025-MH-MUM-00020',7,'Kurla Police Station','rohan_patil','9876501015','Fraud','Real estate scam involving fake property papers','2026-01-10','11:15','Nehru Nagar, Kurla','Property docs','Sent','POL020',20,19.0700,72.8800,'FIR Filed','High'],
    ['FIR-2025-MH-MUM-00021',8,'Powai Police Station','testuser123','8888888888','Cybercrime','Social media account hacked and used for defamation','2025-10-20','08:00','Hiranandani, Powai','Screenshots','Approved','POL021',3,19.1180,72.9070,'Investigation','Medium'],
    ['FIR-2025-MH-MUM-00022',9,'Vile Parle Police Station','user002','8888888887','Theft','Jewelry stolen during house party','2025-07-05','15:30','Balaji Nagar, Vile Parle','Guest list','Sent','POL022',4,19.0950,72.8380,'FIR Filed','Medium'],
    ['FIR-2025-MH-MUM-00023',10,'Juhu Police Station','user003','8888888886','Murder','Body found in apartment complex swimming pool','2025-12-01','00:30','DN Nagar, Juhu','Autopsy report','Approved','POL023',5,19.1020,72.8280,'Court Proceedings','High'],
    ['FIR-2025-MH-MUM-00024',11,'Goregaon Police Station','rahul_verma','9876501001','Kidnapping','Businessman abducted from parking lot for ransom','2025-11-08','22:00','Aarey Colony, Goregaon','Ransom call recording','Approved','POL024',6,19.1580,72.8650,'Charge Sheet Filed','High'],
    ['FIR-2025-MH-MUM-00025',12,'Malad Police Station','sneha_kapoor','9876501002','Drug Trafficking','Marijuana farm discovered in residential building','2026-02-05','06:30','Orlem, Malad','Seizure panchnama','Sent','POL025',7,19.1900,72.8370,'FIR Filed','High'],
    ['FIR-2025-MH-MUM-00026',1,'Colaba Police Station','amit_joshi','9876501003','Extortion','Local goon demanding hafta from shop owners','2025-09-15','14:00','Sassoon Dock, Colaba','Voice recordings','Approved','POL026',8,18.9150,72.8320,'Investigation','Medium'],
    ['FIR-2025-MH-MUM-00027',2,'Marine Drive Police Station','priya_nair','9876501004','Assault','Tourist assaulted at Oval Maidan during evening walk','2025-08-12','20:30','Oval Maidan, Mumbai','CCTV','Rejected','POL027',9,18.9320,72.8260,'Closed','Low'],
    ['FIR-2025-MH-MUM-00028',3,'Bandra Police Station','vikash_gupta','9876501005','Burglary','Office break-in at Turner Road commercial complex','2026-01-25','03:45','Turner Road, Bandra','Alarm system logs','Sent','POL028',10,19.0560,72.8320,'FIR Filed','Medium'],
    ['FIR-2025-MH-MUM-00029',4,'Andheri Police Station','ananya_singh','9876501006','Domestic Violence','Spouse abuse complaint with physical injuries','2025-10-30','19:00','Versova, Andheri','Hospital records','Approved','POL029',11,19.1300,72.8130,'Investigation','Medium'],
    ['FIR-2025-MH-MUM-00030',5,'Dadar Police Station','rishi_mehta','9876501007','Forgery','Counterfeit currency notes used at local market','2025-12-20','10:45','Prabhadevi, Dadar','Fake notes','Approved','POL030',12,19.0145,72.8300,'Charge Sheet Filed','Medium'],
    ['FIR-2025-MH-MUM-00031',6,'Borivali Police Station','deepika_rao','9876501008','Smuggling','Gold smuggling racket busted at Dahisar checkpoint','2025-07-15','01:00','Dahisar, Mumbai','Customs report','Approved','POL019',13,19.2500,72.8620,'Court Proceedings','High'],
    ['FIR-2025-MH-MUM-00032',7,'Kurla Police Station','karan_shah','9876501009','Vehicle Theft','Four-wheeler stolen from apartment basement parking','2026-02-08','04:30','LBS Marg, Kurla','CCTV footage','Sent','POL020',14,19.0670,72.8840,'FIR Filed','Medium'],
    ['FIR-2025-MH-MUM-00033',8,'Powai Police Station','meera_pillai','9876501010','Chain Snatching','Chain snatched from jogger in Chandivali area','2025-11-22','17:15','Chandivali, Powai','Witness','Sent','POL021',15,19.1100,72.8950,'FIR Filed','Low'],
    ['FIR-2025-MH-MUM-00034',9,'Vile Parle Police Station','arjun_das','9876501011','Arson','Car set on fire in parking lot during dispute','2025-06-25','23:00','Parle East, Mumbai','Fire brigade report','Rejected','POL022',16,19.0990,72.8500,'Closed','Low'],
    ['FIR-2025-MH-MUM-00035',10,'Juhu Police Station','pooja_thakur','9876501012','Robbery','Armed robbery at Juhu Beach Road ATM','2025-09-08','21:30','Juhu Beach Rd, Mumbai','CCTV, Weapon','Approved','POL023',17,19.0980,72.8260,'Investigation','High']
  ];
  await runBatch(firData.map(f => ({
    sql: `INSERT INTO firs (fir_number,station_id,station_name,complainant_name,complainant_phone,crime_type,crime_description,crime_date,crime_time,location,evidence,status,assigned_police_id,user_id,latitude,longitude,workflow_stage,priority) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT (fir_number) DO NOTHING`,
    params: f
  })));

  // ─── Fill accused, relation, address for FIRs ───
  const firExtras = [
    ['FIR-2025-MH-MUM-00001','Vikram Singh','Stranger','Flat 12, Colaba Market Rd, Mumbai'],
    ['FIR-2025-MH-MUM-00002','Ravi Kapoor','Stranger','Navy Nagar, Colaba, Mumbai'],
    ['FIR-2025-MH-MUM-00003','Deepak Yadav','Stranger','221 Churchgate Apts, Mumbai'],
    ['FIR-2025-MH-MUM-00004','Arjun Nair','Acquaintance','45 Linking Road, Bandra, Mumbai'],
    ['FIR-2025-MH-MUM-00005','Nikhil Sharma','Online Contact','Lokhandwala Complex, Andheri, Mumbai'],
    ['FIR-2025-MH-MUM-00006','Suresh Patil','Stranger','14 Shivaji Park Rd, Dadar, Mumbai'],
    ['FIR-2025-MH-MUM-00007','Imran Khan','Neighbor','IC Colony, Borivali West, Mumbai'],
    ['FIR-2025-MH-MUM-00008','Ganesh More','Stranger','BKC Apartments, Kurla, Mumbai'],
    ['FIR-2025-MH-MUM-00009','Farid Shaikh','Stranger','Powai Lake Area, Mumbai'],
    ['FIR-2025-MH-MUM-00010','Ajay Tiwari','Spouse','Irla Bridge, Vile Parle, Mumbai'],
    ['FIR-2025-MH-MUM-00011','Santosh Gupta','Business Rival','JVPD Scheme, Juhu, Mumbai'],
    ['FIR-2025-MH-MUM-00012','Rafiq Patel','Former Employee','Film City Rd, Goregaon, Mumbai'],
    ['FIR-2025-MH-MUM-00013','Pravin Jagtap','Stranger','Link Road, Malad West, Mumbai'],
    ['FIR-2025-MH-MUM-00014','Dinesh Rathod','Stranger','Gateway Area, Colaba, Mumbai'],
    ['FIR-2025-MH-MUM-00015','Manish Tiwari','Business Associate','Nariman Point, Mumbai'],
    ['FIR-2025-MH-MUM-00016','Zakir Hussain','Stranger','Bandra Reclamation, Mumbai'],
    ['FIR-2025-MH-MUM-00017','Rohit Sawant','Colleague','Four Bungalows, Andheri, Mumbai'],
    ['FIR-2025-MH-MUM-00018','Vijay Sonawane','Stranger','Dadar TT Circle, Mumbai'],
    ['FIR-2025-MH-MUM-00019','Sunil Gaikwad','Stranger','WEH, Borivali East, Mumbai'],
    ['FIR-2025-MH-MUM-00020','Anil Bhosale','Real Estate Agent','Nehru Nagar, Kurla, Mumbai'],
    ['FIR-2025-MH-MUM-00021','Sagar Mhatre','Stranger','Hiranandani Gardens, Powai, Mumbai'],
    ['FIR-2025-MH-MUM-00022','Kishor Nikam','Party Guest','Balaji Nagar, Vile Parle, Mumbai'],
    ['FIR-2025-MH-MUM-00023','Bablu Shukla','Stranger','DN Nagar, Juhu, Mumbai'],
    ['FIR-2025-MH-MUM-00024','Wasim Ahmed','Business Rival','Aarey Colony, Goregaon, Mumbai'],
    ['FIR-2025-MH-MUM-00025','Pappu Yadav','Stranger','Orlem, Malad West, Mumbai'],
    ['FIR-2025-MH-MUM-00026','Chhota Rajan','Stranger','Sassoon Dock, Colaba, Mumbai'],
    ['FIR-2025-MH-MUM-00027','Kamal Haasan','Stranger','Oval Maidan, Mumbai'],
    ['FIR-2025-MH-MUM-00028','Sunny Leone','Stranger','Turner Road, Bandra, Mumbai'],
    ['FIR-2025-MH-MUM-00029','Mohan Agashe','Spouse','Versova, Andheri West, Mumbai'],
    ['FIR-2025-MH-MUM-00030','Bharat Jadhav','Business Associate','Prabhadevi, Dadar, Mumbai'],
    ['FIR-2025-MH-MUM-00031','Akbar Ali','Stranger','Dahisar Check Naka, Mumbai'],
    ['FIR-2025-MH-MUM-00032','Ramzan Shaikh','Stranger','LBS Marg, Kurla, Mumbai'],
    ['FIR-2025-MH-MUM-00033','Guddu Pandit','Stranger','Chandivali, Powai, Mumbai'],
    ['FIR-2025-MH-MUM-00034','Firoz Khan','Neighbor','Parle East, Mumbai'],
    ['FIR-2025-MH-MUM-00035','Babu Bhai','Stranger','Juhu Beach Rd, Mumbai']
  ];
  await runBatch(firExtras.map(e => ({
    sql: `UPDATE firs SET accused = ?, relation = ?, address = ? WHERE fir_number = ?`,
    params: [e[1], e[2], e[3], e[0]]
  })));

  // ─── CRIMINAL NETWORK LINKS (15) ───
  const networkData = [
    [1,2,'Associate',null,'Known robbery partners in Colaba area',3],
    [3,5,'Co-accused',null,'Linked through property fraud ring',2],
    [6,8,'Gang Member',null,'Part of cyber-fraud syndicate',4],
    [7,16,'Known Associate',null,'Linked in smuggling operations',3],
    [9,25,'Supplier',null,'Drug supply chain connection',5],
    [11,26,'Extortion Ring',null,'Protection racket network',4],
    [13,32,'Vehicle Theft Ring',null,'Stolen car reselling network',3],
    [14,1,'Accomplice',null,'Chain snatching duo in South Mumbai',2],
    [15,30,'Forgery Ring',null,'Counterfeit document production',3],
    [17,22,'Repeat Offender',null,'Multiple petty theft cases',2],
    [19,28,'Area Gang',null,'Bandra area criminal group',3],
    [20,5,'Fraud Ring',null,'Real estate fraud syndicate',4],
    [23,7,'Murder Case',null,'Linked through witness testimony',5],
    [24,8,'Kidnapping Ring',null,'Organized abduction for ransom',5],
    [31,16,'Smuggling Network',null,'Cross-border goods trafficking',4]
  ];
  await runBatch(networkData.map(n => ({
    sql: `INSERT INTO criminal_network (criminal_id_1,criminal_id_2,link_type,fir_id,description,strength) VALUES (?,?,?,?,?,?)`,
    params: n
  })));

  // ─── ACTIVITY LOG (20) ───
  const activityData = [
    [1,'login','Admin Login','Admin admin123 logged in','user',1,'fas fa-sign-in-alt'],
    [3,'fir_create','FIR Filed','New FIR created: Theft at Colaba Causeway','fir',1,'fas fa-file-plus'],
    [21,'fir_approve','FIR Approved','FIR #2 robbery case approved by officer','fir',2,'fas fa-check-circle'],
    [1,'criminal_add','Criminal Added','New criminal record: Vikram Singh','criminal',1,'fas fa-user-plus'],
    [22,'fir_approve','FIR Approved','FIR #6 cybercrime case approved','fir',6,'fas fa-check-circle'],
    [4,'fir_create','FIR Filed','New FIR: Burglary at Churchgate','fir',3,'fas fa-file-plus'],
    [1,'station_add','Station Added','New station: Powai Police Station','station',8,'fas fa-building'],
    [23,'fir_reject','FIR Rejected','FIR #4 assault case rejected','fir',4,'fas fa-times-circle'],
    [6,'fir_create','FIR Filed','New FIR: Cybercrime hacking case','fir',6,'fas fa-file-plus'],
    [1,'police_add','Police Added','New officer: Sunita Deshmukh assigned','police',6,'fas fa-user-shield'],
    [24,'fir_approve','FIR Approved','FIR #7 murder case approved','fir',7,'fas fa-check-circle'],
    [7,'fir_create','FIR Filed','New FIR: Murder at IC Colony','fir',7,'fas fa-file-plus'],
    [25,'fir_approve','FIR Approved','FIR #8 kidnapping case approved','fir',8,'fas fa-check-circle'],
    [1,'criminal_add','Criminal Added','New criminal record: Farid Shaikh','criminal',9,'fas fa-user-plus'],
    [3,'fir_create','FIR Filed','New FIR: Fraud at Lokhandwala','fir',5,'fas fa-file-plus'],
    [26,'fir_approve','FIR Approved','FIR #10 domestic violence case approved','fir',10,'fas fa-check-circle'],
    [1,'login','Admin Login','Admin superadmin logged in','user',2,'fas fa-sign-in-alt'],
    [27,'fir_approve','FIR Approved','FIR #12 arson case approved','fir',12,'fas fa-check-circle'],
    [1,'criminal_add','Criminal Added','New criminal: Chhota Rajan added','criminal',26,'fas fa-user-plus'],
    [28,'fir_reject','FIR Rejected','FIR #15 forgery case rejected - insufficient evidence','fir',15,'fas fa-times-circle']
  ];
  await runBatch(activityData.map(a => ({
    sql: `INSERT INTO activity_log (user_id,activity_type,action,description,entity_type,entity_id,icon) VALUES (?,?,?,?,?,?,?)`,
    params: a
  })));

  // ─── CRIME ANALYSIS (periodic summaries) ───
  const analysisData = [
    ['2025-Q3','Theft',8,'Colaba','High','Rising'],
    ['2025-Q3','Robbery',5,'Bandra','High','Stable'],
    ['2025-Q3','Assault',4,'Borivali','Medium','Declining'],
    ['2025-Q3','Fraud',6,'Andheri','High','Rising'],
    ['2025-Q3','Cybercrime',4,'Powai','Medium','Rising'],
    ['2025-Q4','Theft',10,'Multiple','High','Rising'],
    ['2025-Q4','Robbery',7,'Dadar','High','Rising'],
    ['2025-Q4','Murder',3,'Various','Critical','Stable'],
    ['2025-Q4','Kidnapping',4,'Goregaon','High','Rising'],
    ['2025-Q4','Drug Trafficking',3,'Malad','High','Stable'],
    ['2025-Q4','Extortion',3,'Juhu','Medium','Stable'],
    ['2025-Q4','Domestic Violence',5,'Vile Parle','Medium','Declining'],
    ['2026-Q1','Theft',6,'Andheri','High','Stable'],
    ['2026-Q1','Burglary',4,'Bandra','Medium','Rising'],
    ['2026-Q1','Fraud',5,'Kurla','High','Rising'],
    ['2026-Q1','Cybercrime',3,'Powai','Medium','Rising'],
    ['2026-Q1','Smuggling',2,'Borivali','Medium','Stable'],
    ['2026-Q1','Vehicle Theft',4,'Malad','Medium','Rising'],
    ['2026-Q1','Chain Snatching',3,'Powai','Medium','Stable'],
    ['2026-Q1','Arson',2,'Vile Parle','Low','Declining']
  ];
  await runBatch(analysisData.map(a => ({
    sql: `INSERT INTO crime_analysis (period,crime_type,count,location,severity,trend) VALUES (?,?,?,?,?,?)`,
    params: a
  })));

  console.log('✓ All test data inserted successfully');
  console.log('\n📊 Sample Data: 35 Users, 12 Stations, 30 Police, 35 Criminals, 35 FIRs');
  console.log('📊 Plus: 15 Network Links, 20 Activity Logs, 20 Crime Analysis Records');
  console.log('📝 Credentials: admin123/password, testuser123/password, police001/password\n');
}

module.exports = { initializeDatabase };
