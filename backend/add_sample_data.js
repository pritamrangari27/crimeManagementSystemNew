const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database('./db_crime.sqlite', (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('✓ Connected to SQLite database');
});

db.serialize(() => {
  // ===== POLICE STATIONS (8 rows with all attributes) =====
  console.log('\n📍 Adding Police Stations...');
  
  const stations = [
    {
      station_name: 'Central Police Station',
      station_code: 'PS001',
      address: '123 Main Street, Central District',
      city: 'Delhi',
      state: 'Delhi',
      phone: '011-2342-5678',
      email: 'central.ps@delhi.police.in',
      in_charge: 'Rajesh Kumar'
    },
    {
      station_name: 'North Police Station',
      station_code: 'PS002',
      address: '456 North Avenue, North District',
      city: 'Delhi',
      state: 'Delhi',
      phone: '011-2356-7890',
      email: 'north.ps@delhi.police.in',
      in_charge: 'Priya Singh'
    },
    {
      station_name: 'South Police Station',
      station_code: 'PS003',
      address: '789 South Road, South District',
      city: 'Delhi',
      state: 'Delhi',
      phone: '011-2345-6789',
      email: 'south.ps@delhi.police.in',
      in_charge: 'Amit Patel'
    },
    {
      station_name: 'East Police Station',
      station_code: 'PS004',
      address: '321 East Lane, East District',
      city: 'Delhi',
      state: 'Delhi',
      phone: '011-2367-8901',
      email: 'east.ps@delhi.police.in',
      in_charge: 'Neha Verma'
    },
    {
      station_name: 'West Police Station',
      station_code: 'PS005',
      address: '654 West Boulevard, West District',
      city: 'Delhi',
      state: 'Delhi',
      phone: '011-2378-9012',
      email: 'west.ps@delhi.police.in',
      in_charge: 'Vikram Sharma'
    },
    {
      station_name: 'Mumbai Central Police Station',
      station_code: 'PS006',
      address: '111 Marine Drive, Fort Area',
      city: 'Mumbai',
      state: 'Maharashtra',
      phone: '022-2265-8901',
      email: 'central.ps@mumbai.police.in',
      in_charge: 'Suresh Desai'
    },
    {
      station_name: 'Bangalore Police Station',
      station_code: 'PS007',
      address: '222 Brigade Road, MG Road Area',
      city: 'Bangalore',
      state: 'Karnataka',
      phone: '080-4125-6789',
      email: 'brigade.ps@bangalore.police.in',
      in_charge: 'Arun Nair'
    },
    {
      station_name: 'Hyderabad Police Station',
      station_code: 'PS008',
      address: '333 Secunderabad Road, Cyberabad',
      city: 'Hyderabad',
      state: 'Telangana',
      phone: '040-6789-0123',
      email: 'cyber.ps@hyderabad.police.in',
      in_charge: 'Sanjay Reddy'
    }
  ];

  // Delete existing stations first
  db.run(`DELETE FROM police_station`, function(err) {
    if (!err) {
      console.log('✓ Cleared existing police stations');
    }
  });

  // Insert stations
  stations.forEach(station => {
    const sql = `INSERT INTO police_station (
      station_name, station_code, address, city, state, phone, email, in_charge
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [
      station.station_name, station.station_code, station.address, 
      station.city, station.state, station.phone, station.email, station.in_charge
    ], function(err) {
      if (err) {
        console.error(`✗ Error inserting station ${station.station_name}:`, err.message);
      } else if (this.changes > 0) {
        console.log(`✓ Police Station inserted: ${station.station_name} (${station.station_code})`);
      }
    });
  });

  // ===== POLICE OFFICERS (8 rows with all attributes) =====
  console.log('\n👮 Adding Police Officers...');

  const police = [
    {
      police_id: 'POL001',
      name: 'Officer Rajesh Kumar',
      email: 'rajesh.kumar@police.in',
      phone: '9876543210',
      station_name: 'Central Police Station',
      station_id: 'PS001',
      address: '123 Police Quarters, Delhi',
      crime_type: 'Theft, Robbery'
    },
    {
      police_id: 'POL002',
      name: 'Officer Priya Singh',
      email: 'priya.singh@police.in',
      phone: '9876543211',
      station_name: 'North Police Station',
      station_id: 'PS002',
      address: '456 Police Lines, Delhi',
      crime_type: 'Cyber Crime, Fraud'
    },
    {
      police_id: 'POL003',
      name: 'Officer Amit Patel',
      email: 'amit.patel@police.in',
      phone: '9876543212',
      station_name: 'South Police Station',
      station_id: 'PS003',
      address: '789 Police Nagar, Delhi',
      crime_type: 'Assault, Battery'
    },
    {
      police_id: 'POL004',
      name: 'Officer Neha Verma',
      email: 'neha.verma@police.in',
      phone: '9876543213',
      station_name: 'East Police Station',
      station_id: 'PS004',
      address: '321 Police Colony, Delhi',
      crime_type: 'Drug Trafficking'
    },
    {
      police_id: 'POL005',
      name: 'Officer Vikram Sharma',
      email: 'vikram.sharma@police.in',
      phone: '9876543214',
      station_name: 'West Police Station',
      station_id: 'PS005',
      address: '654 Police Enclave, Delhi',
      crime_type: 'Murder, Homicide'
    },
    {
      police_id: 'POL006',
      name: 'Officer Suresh Desai',
      email: 'suresh.desai@police.in',
      phone: '9876543215',
      station_name: 'Mumbai Central Police Station',
      station_id: 'PS006',
      address: '111 Fort Area, Mumbai',
      crime_type: 'Organized Crime'
    },
    {
      police_id: 'POL007',
      name: 'Officer Arun Nair',
      email: 'arun.nair@police.in',
      phone: '9876543216',
      station_name: 'Bangalore Police Station',
      station_id: 'PS007',
      address: '222 MG Road, Bangalore',
      crime_type: 'White Collar Crime'
    },
    {
      police_id: 'POL008',
      name: 'Officer Sanjay Reddy',
      email: 'sanjay.reddy@police.in',
      phone: '9876543217',
      station_name: 'Hyderabad Police Station',
      station_id: 'PS008',
      address: '333 Cyberabad, Hyderabad',
      crime_type: 'Human Trafficking'
    }
  ];

  // Delete existing police officers first
  db.run(`DELETE FROM police`, function(err) {
    if (!err) {
      console.log('✓ Cleared existing police officers');
    }
  });

  // Insert police officers
  police.forEach(officer => {
    const sql = `INSERT INTO police (
      police_id, name, email, phone, station_name, station_id, address, crime_type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [
      officer.police_id, officer.name, officer.email, officer.phone,
      officer.station_name, officer.station_id, officer.address, officer.crime_type
    ], function(err) {
      if (err) {
        console.error(`✗ Error inserting officer ${officer.name}:`, err.message);
      } else if (this.changes > 0) {
        console.log(`✓ Police Officer inserted: ${officer.name} (${officer.police_id})`);
      }
    });
  });

  // ===== CRIMINALS (8 rows with all attributes) =====
  console.log('\n👤 Adding Criminals...');

  const criminals = [
    {
      Criminal_name: 'Vikram Singh Yadav',
      contact: '9999888877',
      DateOfBirth: '1985-03-15',
      email: 'vikram.yadav@email.com',
      state: 'Delhi',
      city: 'New Delhi',
      address: '789 Crime House, New Delhi',
      crime_type: 'Robbery',
      crime_date: '2024-01-15',
      crime_time: '22:30',
      Prison_name: 'Tihar Jail',
      Court_name: 'Delhi High Court',
      station_id: 'PS001',
      station_name: 'Central Police Station'
    },
    {
      Criminal_name: 'Mohit Kumar Jain',
      contact: '9999888878',
      DateOfBirth: '1990-07-22',
      email: 'mohit.jain@email.com',
      state: 'Delhi',
      city: 'Delhi',
      address: '456 Dark Street, Delhi',
      crime_type: 'Theft',
      crime_date: '2024-02-10',
      crime_time: '19:45',
      Prison_name: 'Tihar Jail',
      Court_name: 'Delhi District Court',
      station_id: 'PS002',
      station_name: 'North Police Station'
    },
    {
      Criminal_name: 'Rajkumar Desai',
      contact: '9999888879',
      DateOfBirth: '1988-11-30',
      email: 'raj.desai@email.com',
      state: 'Delhi',
      city: 'Delhi',
      address: '321 Black Lane, Delhi',
      crime_type: 'Assault',
      crime_date: '2024-01-28',
      crime_time: '21:00',
      Prison_name: 'Tihar Jail',
      Court_name: 'Delhi High Court',
      station_id: 'PS003',
      station_name: 'South Police Station'
    },
    {
      Criminal_name: 'Arjun Reddy Nair',
      contact: '9999888880',
      DateOfBirth: '1992-05-12',
      email: 'arjun.nair@email.com',
      state: 'Delhi',
      city: 'Delhi',
      address: '654 Shadow Road, Delhi',
      crime_type: 'Drug Trafficking',
      crime_date: '2024-02-05',
      crime_time: '23:15',
      Prison_name: 'Tihar Jail',
      Court_name: 'Delhi Sessions Court',
      station_id: 'PS004',
      station_name: 'East Police Station'
    },
    {
      Criminal_name: 'Suresh Kumar Verma',
      contact: '9999888881',
      DateOfBirth: '1987-09-08',
      email: 'suresh.verma@email.com',
      state: 'Delhi',
      city: 'Delhi',
      address: '987 Crime Valley, Delhi',
      crime_type: 'Fraud',
      crime_date: '2024-02-20',
      crime_time: '14:30',
      Prison_name: 'Tihar Jail',
      Court_name: 'Delhi High Court',
      station_id: 'PS005',
      station_name: 'West Police Station'
    },
    {
      Criminal_name: 'Pankaj Singh Patel',
      contact: '9999888882',
      DateOfBirth: '1989-01-18',
      email: 'pankaj.patel@email.com',
      state: 'Maharashtra',
      city: 'Mumbai',
      address: '111 Criminal Avenue, Mumbai',
      crime_type: 'Organized Crime',
      crime_date: '2024-03-01',
      crime_time: '20:00',
      Prison_name: 'Arthur Road Jail',
      Court_name: 'Mumbai High Court',
      station_id: 'PS006',
      station_name: 'Mumbai Central Police Station'
    },
    {
      Criminal_name: 'Naveen Kumar Gupta',
      contact: '9999888883',
      DateOfBirth: '1991-04-25',
      email: 'naveen.gupta@email.com',
      state: 'Karnataka',
      city: 'Bangalore',
      address: '222 Cyber Street, Bangalore',
      crime_type: 'Cyber Crime',
      crime_date: '2024-03-10',
      crime_time: '15:45',
      Prison_name: 'Bangalore Central Jail',
      Court_name: 'Bangalore City Court',
      station_id: 'PS007',
      station_name: 'Bangalore Police Station'
    },
    {
      Criminal_name: 'Anuj Sharma Reddy',
      contact: '9999888884',
      DateOfBirth: '1986-12-03',
      email: 'anuj.reddy@email.com',
      state: 'Telangana',
      city: 'Hyderabad',
      address: '333 High Crime Road, Hyderabad',
      crime_type: 'Human Trafficking',
      crime_date: '2024-03-15',
      crime_time: '22:45',
      Prison_name: 'Hyderabad Central Jail',
      Court_name: 'Hyderabad High Court',
      station_id: 'PS008',
      station_name: 'Hyderabad Police Station'
    }
  ];

  // Delete existing criminals first
  db.run(`DELETE FROM criminals`, function(err) {
    if (!err) {
      console.log('✓ Cleared existing criminals');
    }
  });

  // Insert criminals
  criminals.forEach(criminal => {
    const sql = `INSERT INTO criminals (
      Criminal_name, contact, DateOfBirth, email, state, city, address, 
      crime_type, crime_date, crime_time, Prison_name, Court_name, station_id, station_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [
      criminal.Criminal_name, criminal.contact, criminal.DateOfBirth, criminal.email,
      criminal.state, criminal.city, criminal.address, criminal.crime_type,
      criminal.crime_date, criminal.crime_time, criminal.Prison_name, criminal.Court_name,
      criminal.station_id, criminal.station_name
    ], function(err) {
      if (err) {
        console.error(`✗ Error inserting criminal ${criminal.Criminal_name}:`, err.message);
      } else if (this.changes > 0) {
        console.log(`✓ Criminal inserted: ${criminal.Criminal_name} (${criminal.crime_type})`);
      }
    });
  });

  // ===== FIRs (First Information Reports - 10 rows with all attributes) =====
  console.log('\n📋 Adding FIRs (First Information Reports)...');

  const firs = [
    {
      user_id: 2,
      station_name: 'Central Police Station',
      station_id: 'PS001',
      crime_type: 'Theft',
      accused: 'Vikram Singh Yadav',
      name: 'Customer Name 1',
      age: 28,
      number: '9876543210',
      address: '100 Main Street, New Delhi',
      relation: 'Self',
      purpose: 'Stolen mobile phone and wallet',
      file: 'fir_001.pdf',
      status: 'Approved'
    },
    {
      user_id: 2,
      station_name: 'North Police Station',
      station_id: 'PS002',
      crime_type: 'Fraud',
      accused: 'Mohit Kumar Jain',
      name: 'Customer Name 2',
      age: 35,
      number: '9876543211',
      address: '200 North Avenue, Delhi',
      relation: 'Self',
      purpose: 'Online fraud and identity theft',
      file: 'fir_002.pdf',
      status: 'Investigating'
    },
    {
      user_id: 2,
      station_name: 'South Police Station',
      station_id: 'PS003',
      crime_type: 'Assault',
      accused: 'Rajkumar Desai',
      name: 'Customer Name 3',
      age: 42,
      number: '9876543212',
      address: '300 South Road, Delhi',
      relation: 'Stranger',
      purpose: 'Physical assault and harassment',
      file: 'fir_003.pdf',
      status: 'Pending'
    },
    {
      user_id: 2,
      station_name: 'East Police Station',
      station_id: 'PS004',
      crime_type: 'Drug Trafficking',
      accused: 'Arjun Reddy Nair',
      name: 'Customer Name 4',
      age: 31,
      number: '9876543213',
      address: '400 East Lane, Delhi',
      relation: 'Self',
      purpose: 'Illegal drug possession and distribution',
      file: 'fir_004.pdf',
      status: 'Investigating'
    },
    {
      user_id: 2,
      station_name: 'West Police Station',
      station_id: 'PS005',
      crime_type: 'Vehicle Theft',
      accused: 'Suresh Kumar Verma',
      name: 'Customer Name 5',
      age: 38,
      number: '9876543214',
      address: '500 West Boulevard, Delhi',
      relation: 'Self',
      purpose: 'Two-wheeler stolen from parking',
      file: 'fir_005.pdf',
      status: 'Closed'
    },
    {
      user_id: 2,
      station_name: 'Mumbai Central Police Station',
      station_id: 'PS006',
      crime_type: 'Organized Crime',
      accused: 'Pankaj Singh Patel',
      name: 'Customer Name 6',
      age: 45,
      number: '9876543215',
      address: '111 Marine Drive, Mumbai',
      relation: 'Witness',
      purpose: 'Organized crime syndicate operations',
      file: 'fir_006.pdf',
      status: 'Investigating'
    },
    {
      user_id: 2,
      station_name: 'Bangalore Police Station',
      station_id: 'PS007',
      crime_type: 'Cyber Crime',
      accused: 'Naveen Kumar Gupta',
      name: 'Customer Name 7',
      age: 29,
      number: '9876543216',
      address: '222 Brigade Road, Bangalore',
      relation: 'Self',
      purpose: 'Hacking and unauthorized access to accounts',
      file: 'fir_007.pdf',
      status: 'Approved'
    },
    {
      user_id: 2,
      station_name: 'Hyderabad Police Station',
      station_id: 'PS008',
      crime_type: 'Human Trafficking',
      accused: 'Anuj Sharma Reddy',
      name: 'Customer Name 8',
      age: 36,
      number: '9876543217',
      address: '333 Secunderabad Road, Hyderabad',
      relation: 'Witness',
      purpose: 'Illegal human trafficking network',
      file: 'fir_008.pdf',
      status: 'Investigating'
    },
    {
      user_id: 2,
      station_name: 'Central Police Station',
      station_id: 'PS001',
      crime_type: 'Burglary',
      accused: 'Unknown',
      name: 'Burglar Report 1',
      age: 0,
      number: '9123456789',
      address: '600 Residential Area, Delhi',
      relation: 'Property Owner',
      purpose: 'Home burglary - valuables stolen',
      file: 'fir_009.pdf',
      status: 'Pending'
    },
    {
      user_id: 2,
      station_name: 'North Police Station',
      station_id: 'PS002',
      crime_type: 'Murder',
      accused: 'To be identified',
      name: 'Murder Report 1',
      age: 0,
      number: '9111222333',
      address: '700 Crime Zone, Delhi',
      relation: 'Community Member',
      purpose: 'Suspicious death - possible homicide',
      file: 'fir_010.pdf',
      status: 'Investigating'
    }
  ];

  // Delete existing FIRs first
  db.run(`DELETE FROM firs`, function(err) {
    if (!err) {
      console.log('✓ Cleared existing FIRs');
    }
  });

  // Insert FIRs
  firs.forEach(fir => {
    const sql = `INSERT INTO firs (
      user_id, station_name, station_id, crime_type, accused, name, age, 
      number, address, relation, purpose, file, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [
      fir.user_id, fir.station_name, fir.station_id, fir.crime_type, fir.accused,
      fir.name, fir.age, fir.number, fir.address, fir.relation, fir.purpose, 
      fir.file, fir.status
    ], function(err) {
      if (err) {
        console.error(`✗ Error inserting FIR for ${fir.name}:`, err.message);
      } else if (this.changes > 0) {
        console.log(`✓ FIR inserted: ${fir.name} - ${fir.crime_type} (${fir.status})`);
      }
    });
  });
});

setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
      process.exit(1);
    }
    console.log('\n✅ Sample data added successfully!');
    console.log('\n📊 Summary:');
    console.log('  ✓ 8 Police Stations added');
    console.log('  ✓ 8 Police Officers added');
    console.log('  ✓ 8 Criminals added');
    console.log('  ✓ 10 FIRs (First Information Reports) added');
    process.exit(0);
  });
}, 3000);
