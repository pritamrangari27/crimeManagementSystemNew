const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const dbPath = './db_crime.sqlite';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('✓ Connected to SQLite database');
});

// Hash passwords
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const addSampleData = async () => {
  try {
    const policeHash = await hashPassword('police123');
    const userHash = await hashPassword('user123');

    db.serialize(() => {
      // Get existing station IDs
      db.all('SELECT id FROM police_station LIMIT 10', [], async (err, stations) => {
        if (err || !stations || stations.length === 0) {
          console.error('❌ No police stations found. Run db_init first.');
          db.close();
          process.exit(1);
        }

        const stationIds = stations.map(s => s.id);
        console.log(`✓ Found ${stationIds.length} existing stations`);

        // ============ ADDITIONAL POLICE OFFICERS (15 officers) ============
        console.log('\n👮 Adding Police Officers...');

        const police = [
          { name: 'Arjun Singh', rank: 'Inspector' },
          { name: 'Neha Desai', rank: 'Sub-Inspector' },
          { name: 'Ravi Kumar', rank: 'Constable' },
          { name: 'Priya Sharma', rank: 'Sub-Inspector' },
          { name: 'Sanjay Reddy', rank: 'Inspector' },
          { name: 'Isha Patel', rank: 'Constable' },
          { name: 'Amit Verma', rank: 'Inspector' },
          { name: 'Divya Gupta', rank: 'Constable' },
          { name: 'Nitin Joshi', rank: 'Sub-Inspector' },
          { name: 'Kavya Singh', rank: 'Inspector' },
          { name: 'Harpreet Kaur', rank: 'Constable' },
          { name: 'Rajesh Nair', rank: 'Inspector' },
          { name: 'Shreya Verma', rank: 'Sub-Inspector' },
          { name: 'Vikram Patel', rank: 'Inspector' },
          { name: 'Anita Gupta', rank: 'Constable' }
        ];

        const policeSql = `INSERT OR IGNORE INTO police (
          username, password, name, rank, station_id, phone, address, badge_number, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;

        for (let i = 0; i < police.length; i++) {
          const officer = police[i];
          const username = `officer_${(i + 1).toString().padStart(3, '0')}`;
          const stationId = stationIds[i % stationIds.length];
          const badge = `BADGE${(i + 1).toString().padStart(4, '0')}`;

          db.run(policeSql, [
            username, policeHash, officer.name, officer.rank, stationId,
            `98${Math.floor(Math.random() * 100000000)}`, `${officer.name}'s Address`, badge
          ], function(err) {
            if (!err) console.log(`✓ Added: ${officer.name} (${officer.rank})`);
          });
        }

        // ============ ADDITIONAL REGULAR USERS (15 users) ============
        console.log('\n👤 Adding Regular Users...');

        const users = [
          { name: 'Rajesh Kumar', email: 'rajesh@email.com', phone: '9876543201' },
          { name: 'Priya Sharma', email: 'priya@email.com', phone: '9876543202' },
          { name: 'Rama Krishnan', email: 'rama@email.com', phone: '9876543203' },
          { name: 'Neha Rao', email: 'neha@email.com', phone: '9876543204' },
          { name: 'Vijay Nair', email: 'vijay@email.com', phone: '9876543205' },
          { name: 'Pooja Kumari', email: 'pooja@email.com', phone: '9876543206' },
          { name: 'Arjun Das', email: 'arjun@email.com', phone: '9876543207' },
          { name: 'Simran Kaur', email: 'simran@email.com', phone: '9876543208' },
          { name: 'Rohan Mehta', email: 'rohan@email.com', phone: '9876543209' },
          { name: 'Anjali Singh', email: 'anjali@email.com', phone: '9876543210' },
          { name: 'Deepak Verma', email: 'deepak@email.com', phone: '9876543211' },
          { name: 'Shreya Nair', email: 'shreya@email.com', phone: '9876543212' },
          { name: 'Vikram Reddy', email: 'vikram@email.com', phone: '9876543213' },
          { name: 'Kavya Desai', email: 'kavya@email.com', phone: '9876543214' },
          { name: 'Mohit Kumar', email: 'mohit@email.com', phone: '9876543215' }
        ];

        const userSql = `INSERT OR IGNORE INTO users (
          username, email, password, phone, role, station_id, address, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;

        for (let i = 0; i < users.length; i++) {
          const user = users[i];
          const username = `user_${(i + 101).toString().padStart(3, '0')}`;

          db.run(userSql, [
            username, user.email, userHash, user.phone, 'User', null, `${user.name}'s Address, Delhi`
          ], function(err) {
            if (!err) console.log(`✓ Added: ${user.name}`);
          });
        }

        // ============ COMPREHENSIVE CRIMINALS (20 criminals) ============
        console.log('\n🚨 Adding Criminals...');

        const criminals = [
          { name: 'Mohit Kumar', age: 32, gender: 'Male', address: '123 Slum Area, Delhi', cnic: 'CNIC001', crimes: 'Robbery, Theft', status: 'Wanted' },
          { name: 'Ramesh Singh', age: 28, gender: 'Male', address: '456 Old City, Delhi', cnic: 'CNIC002', crimes: 'DUI, Assault', status: 'Arrested' },
          { name: 'Kavya Desai', age: 25, gender: 'Female', address: '789 Market Lane, Delhi', cnic: 'CNIC003', crimes: 'Fraud', status: 'Wanted' },
          { name: 'Vikram Reddy', age: 35, gender: 'Male', address: '321 Industrial Area, Delhi', cnic: 'CNIC004', crimes: 'Drug Trafficking', status: 'Arrested' },
          { name: 'Priya Sharma', age: 22, gender: 'Female', address: '654 Residential Area, Delhi', cnic: 'CNIC005', crimes: 'Shoplifting', status: 'Wanted' },
          { name: 'Arjun Patel', age: 40, gender: 'Male', address: '987 Business District, Delhi', cnic: 'CNIC006', crimes: 'Money Laundering', status: 'Arrested' },
          { name: 'Neha Verma', age: 29, gender: 'Female', address: 'Unknown', cnic: 'CNIC007', crimes: 'Identity Theft', status: 'Wanted' },
          { name: 'Sanjay Kapoor', age: 31, gender: 'Male', address: '111 Outskirts, Delhi', cnic: 'CNIC008', crimes: 'Vehicle Theft', status: 'Arrested' },
          { name: 'Isha Krishnan', age: 26, gender: 'Female', address: '222 Downtown, Delhi', cnic: 'CNIC009', crimes: 'Forgery', status: 'Wanted' },
          { name: 'Rohit Singh', age: 34, gender: 'Male', address: '333 Heights, Delhi', cnic: 'CNIC010', crimes: 'Extortion', status: 'Arrested' },
          { name: 'Divya Nair', age: 27, gender: 'Female', address: '444 Colony, Delhi', cnic: 'CNIC011', crimes: 'Cyber Crime', status: 'Wanted' },
          { name: 'Amit Gupta', age: 38, gender: 'Male', address: '555 Locality, Delhi', cnic: 'CNIC012', crimes: 'Kidnapping', status: 'Arrested' },
          { name: 'Simran Kaur', age: 23, gender: 'Female', address: '666 Town, Delhi', cnic: 'CNIC013', crimes: 'Drug Possession', status: 'Wanted' },
          { name: 'Nitin Joshi', age: 33, gender: 'Male', address: 'Unknown', cnic: 'CNIC014', crimes: 'Armed Robbery', status: 'Arrested' },
          { name: 'Kavya Singh', age: 30, gender: 'Female', address: '777 Area, Delhi', cnic: 'CNIC015', crimes: 'Assault', status: 'Wanted' },
          { name: 'Harpreet Malik', age: 36, gender: 'Male', address: '888 Zone, Delhi', cnic: 'CNIC016', crimes: 'Human Trafficking', status: 'Arrested' },
          { name: 'Shreya Das', age: 24, gender: 'Female', address: '999 District, Delhi', cnic: 'CNIC017', crimes: 'Fraud, Cheating', status: 'Wanted' },
          { name: 'Rajesh Nair', age: 41, gender: 'Male', address: '1010 Lane, Delhi', cnic: 'CNIC018', crimes: 'Smuggling', status: 'Arrested' },
          { name: 'Ananya Gupta', age: 28, gender: 'Female', address: '1111 Street, Delhi', cnic: 'CNIC019', crimes: 'Hacking', status: 'Wanted' },
          { name: 'Vikram Singh', age: 45, gender: 'Male', address: '1212 Road, Delhi', cnic: 'CNIC020', crimes: 'Attempted Murder', status: 'Arrested' }
        ];

        const criminalSql = `INSERT OR IGNORE INTO criminals (
          name, age, gender, address, cnic, past_crimes, status, photo_url, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;

        for (const criminal of criminals) {
          db.run(criminalSql, [
            criminal.name, criminal.age, criminal.gender, criminal.address, criminal.cnic,
            criminal.crimes, criminal.status, null
          ], function(err) {
            if (!err) console.log(`✓ Added: ${criminal.name} (${criminal.status})`);
          });
        }

        // ============ COMPREHENSIVE FIRs (30 FIRs) ============
        console.log('\n📋 Adding First Information Reports (FIRs)...');

        const firSql = `INSERT OR IGNORE INTO firs (
          user_id, station_id, crime_type, accused, name, age, number, address,
          relation, purpose, file, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;

        const crimes = [
          { type: 'Robbery', accused: 'Mohit Kumar', name: 'Rajesh Kumar', age: 45, number: '9876543210', address: '123 Main St', relation: 'Self', purpose: 'Robbery near market' },
          { type: 'Assault', accused: 'Ramesh Singh', name: 'Priya Sharma', age: 32, number: '9876543211', address: '456 Park Road', relation: 'Victim', purpose: 'Physical assault' },
          { type: 'Theft', accused: 'Kavya Desai', name: 'John Doe', age: 38, number: '9876543212', address: '789 Commerce Lane', relation: 'Self', purpose: 'Bike theft' },
          { type: 'Fraud', accused: 'Vikram Reddy', name: 'Neha Gupta', age: 29, number: '9876543213', address: '321 Tech Park', relation: 'Self', purpose: 'Online fraud' },
          { type: 'Drug Possession', accused: 'Priya Sharma', name: 'Amit Patel', age: 27, number: '9876543214', address: '654 Downtown', relation: 'Self', purpose: 'Drug trafficking' },
          { type: 'DUI', accused: 'Arjun Singh', name: 'Sanjay Verma', age: 35, number: '9876543215', address: '987 Highway', relation: 'Self', purpose: 'Drunk driving' },
          { type: 'Burglary', accused: 'Sanjay Kapoor', name: 'Urmila Das', age: 50, number: '9876543216', address: '111 Residential', relation: 'Victim', purpose: 'House break-in' },
          { type: 'Cyber Crime', accused: 'Divya Nair', name: 'Vikram Rajput', age: 31, number: '9876543217', address: '222 Cyber City', relation: 'Self', purpose: 'Website hacking' },
          { type: 'Extortion', accused: 'Rohit Singh', name: 'Ravi Nair', age: 42, number: '9876543218', address: '333 Business', relation: 'Self', purpose: 'Business extortion' },
          { type: 'Kidnapping', accused: 'Amit Gupta', name: 'Keya Sharma', age: 28, number: '9876543219', address: '444 Area', relation: 'Relative', purpose: 'Child kidnapping' },
          { type: 'Forgery', accused: 'Isha Krishnan', name: 'Harpreet Singh', age: 55, number: '9876543220', address: '555 Market', relation: 'Self', purpose: 'Document forgery' },
          { type: 'Harassment', accused: 'Kavya Singh', name: 'Anita Verma', age: 26, number: '9876543221', address: '666 Locality', relation: 'Self', purpose: 'Sexual harassment' },
          { type: 'Vehicle Theft', accused: 'Nitin Joshi', name: 'Deepak Sharma', age: 40, number: '9876543222', address: '777 Parking', relation: 'Self', purpose: 'Car theft' },
          { type: 'Shoplifting', accused: 'Simran Kaur', name: 'Pooja Desai', age: 33, number: '9876543223', address: '888 Mall', relation: 'Witness', purpose: 'Store theft' },
          { type: 'Identity Theft', accused: 'Neha Verma', name: 'Suresh Kumar', age: 47, number: '9876543224', address: '999 Bank', relation: 'Self', purpose: 'Bank fraud' },
          { type: 'Robbery', accused: 'Mohit Kumar', name: 'Vivek Singh', age: 44, number: '9876543225', address: '1010 Street', relation: 'Self', purpose: 'Jewelry robbery' },
          { type: 'Assault', accused: 'Ramesh Singh', name: 'Sneha Patel', age: 36, number: '9876543226', address: '1111 Road', relation: 'Victim', purpose: 'Bar fight' },
          { type: 'Fraud', accused: 'Vikram Reddy', name: 'Manish Nair', age: 39, number: '9876543227', address: '1212 Avenue', relation: 'Self', purpose: 'Cheque bouncing' },
          { type: 'Drug Possession', accused: 'Priya Sharma', name: 'Aarav Gupta', age: 24, number: '9876543228', address: '1313 Lane', relation: 'Self', purpose: 'Drug peddling' },
          { type: 'Corruption', accused: 'Unknown', name: 'Rajesh Desai', age: 56, number: '9876543229', address: '1414 Civic', relation: 'Self', purpose: 'Bribery allegations' },
          { type: 'Human Trafficking', accused: 'Harpreet Malik', name: 'Rekha Singh', age: 31, number: '9876543230', address: '1515 Metro', relation: 'Victim', purpose: 'Trafficking complaint' },
          { type: 'Hacking', accused: 'Ananya Gupta', name: 'Arjun Kumar', age: 29, number: '9876543231', address: '1616 Tech', relation: 'Self', purpose: 'Account hacking' },
          { type: 'Attempted Murder', accused: 'Vikram Singh', name: 'Harsha Sharma', age: 43, number: '9876543232', address: '1717 Hospital', relation: 'Victim', purpose: 'Stabbing incident' },
          { type: 'Smuggling', accused: 'Rajesh Nair', name: 'Prakash Sharma', age: 52, number: '9876543233', address: '1818 Port', relation: 'Witness', purpose: 'Illegal goods smuggling' },
          { type: 'Rape', accused: 'Unknown', name: 'Neha Singh', age: 24, number: '9876543234', address: '1919 Shelter', relation: 'Victim', purpose: 'Sexual assault' },
          { type: 'Abduction', accused: 'Unknown', name: 'Rani Patel', age: 27, number: '9876543235', address: '2020 Police Station', relation: 'Victim', purpose: 'Forced abduction' },
          { type: 'Counterfeiting', accused: 'Unknown', name: 'Naren Verma', age: 44, number: '9876543236', address: '2121 Currency Office', relation: 'Self', purpose: 'Fake currency notes' },
          { type: 'Vandalism', accused: 'Youth Gang', name: 'Raman Kumar', age: 38, number: '9876543237', address: '2222 Public Property', relation: 'Witness', purpose: 'Street vandalism' },
          { type: 'Embezzlement', accused: 'Employee', name: 'Sheela Desai', age: 41, number: '9876543238', address: '2323 Company', relation: 'Self', purpose: 'Financial fraud' },
          { type: 'Blackmail', accused: 'Extortionist', name: 'Vikas Sharma', age: 36, number: '9876543239', address: '2424 Office', relation: 'Self', purpose: 'Threatening messages' }
        ];

        const statuses = ['Sent', 'Approved', 'Rejected'];

        // Get user IDs for FIR insertion
        db.all('SELECT id FROM users WHERE role="User" LIMIT 20', [], (err, userRows) => {
          if (err || !userRows || userRows.length === 0) {
            console.log('⚠️ No users found. Creating sample FIRs with user_id 2');
            for (let i = 0; i < crimes.length; i++) {
              const crime = crimes[i];
              const status = statuses[Math.floor(Math.random() * statuses.length)];
              const stationId = stationIds[i % stationIds.length];

              db.run(firSql, [
                2, stationId, crime.type, crime.accused, crime.name, crime.age,
                crime.number, crime.address, crime.relation, crime.purpose, null, status
              ], function(err) {
                if (!err) console.log(`✓ Added FIR: ${crime.type} against ${crime.accused} (${status})`);
              });
            }
          } else {
            for (let i = 0; i < crimes.length; i++) {
              const crime = crimes[i];
              const status = statuses[Math.floor(Math.random() * statuses.length)];
              const userId = userRows[i % userRows.length].id;
              const stationId = stationIds[i % stationIds.length];

              db.run(firSql, [
                userId, stationId, crime.type, crime.accused, crime.name, crime.age,
                crime.number, crime.address, crime.relation, crime.purpose, null, status
              ], function(err) {
                if (!err) console.log(`✓ Added FIR: ${crime.type} against ${crime.accused} (${status})`);
              });
            }
          }

          console.log('\n✅ Sample data insertion completed successfully!');
          console.log('\n📊 Sample Data Added:');
          console.log(`   - 15 Police Officers`);
          console.log(`   - 15 Regular Users`);
          console.log(`   - 20 Criminals`);
          console.log(`   - 30 First Information Reports (FIRs)`);

          setTimeout(() => {
            db.close();
            console.log('\n✅ Database connection closed.');
            process.exit(0);
          }, 1000);
        });
      });
    });
  } catch (error) {
    console.error('Error:', error);
    db.close();
    process.exit(1);
  }
};

// Run the sample data insertion
addSampleData();
