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
    const userHash = await hashPassword('user123');

    db.serialize(() => {
      // Get existing stations for reference
      db.all('SELECT id, station_name, station_code FROM police_station', [], (err, stations) => {
        if (err || !stations || stations.length === 0) {
          console.error('❌ No police stations found. Run db_init first.');
          db.close();
          process.exit(1);
        }

        const stationIds = stations.map(s => s.id);
        const stationNames = stations.map(s => s.station_name);
        console.log(`✓ Found ${stationIds.length} existing stations`);

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
          { name: 'Anjali Singh', email: 'anjalisingh@email.com', phone: '9876543250' },
          { name: 'Deepak Verma', email: 'deepak@email.com', phone: '9876543211' },
          { name: 'Shreya Nair', email: 'shreyanair@email.com', phone: '9876543212' },
          { name: 'Vikram Reddy', email: 'vikramr@email.com', phone: '9876543213' },
          { name: 'Kavya Desai', email: 'kavyad@email.com', phone: '9876543214' },
          { name: 'Mohit Kumar', email: 'mohit@email.com', phone: '9876543215' }
        ];

        const userSql = `INSERT OR IGNORE INTO users (username, email, password, phone, role) VALUES (?, ?, ?, ?, ?)`;

        for (let i = 0; i < users.length; i++) {
          const user = users[i];
          const username = `user_${(i + 101).toString().padStart(3, '0')}`;

          db.run(userSql, [username, user.email, userHash, user.phone, 'User'], function(err) {
            if (!err && this.changes > 0) console.log(`  ✓ User added: ${user.name} (${username})`);
          });
        }

        // ============ POLICE OFFICERS (20 officers) ============
        // Schema: police_id, name, crime_type, position, station_name, station_id, email, phone, address
        console.log('\n👮 Adding Police Officers...');

        const policeOfficers = [
          { police_id: 'POL001', name: 'Arjun Singh', crime_type: 'Robbery', position: 'Inspector', email: 'arjun.singh@police.in', phone: '9800010001', address: '12 Sector 4, Connaught Place, Delhi' },
          { police_id: 'POL002', name: 'Neha Desai', crime_type: 'Cyber Crime', position: 'Sub-Inspector', email: 'neha.desai@police.in', phone: '9800010002', address: '34 MG Road, Bandra West, Mumbai' },
          { police_id: 'POL003', name: 'Ravi Kumar', crime_type: 'Theft', position: 'Constable', email: 'ravi.kumar@police.in', phone: '9800010003', address: '56 Koramangala 4th Block, Bangalore' },
          { police_id: 'POL004', name: 'Priya Sharma', crime_type: 'Fraud', position: 'Inspector', email: 'priya.sharma@police.in', phone: '9800010004', address: '78 Jubilee Hills Road No 5, Hyderabad' },
          { police_id: 'POL005', name: 'Sanjay Reddy', crime_type: 'Drug Trafficking', position: 'Senior Inspector', email: 'sanjay.reddy@police.in', phone: '9800010005', address: '90 Anna Nagar East, Chennai' },
          { police_id: 'POL006', name: 'Isha Patel', crime_type: 'Assault', position: 'Sub-Inspector', email: 'isha.patel@police.in', phone: '9800010006', address: '23 Park Street, Salt Lake, Kolkata' },
          { police_id: 'POL007', name: 'Amit Verma', crime_type: 'Kidnapping', position: 'Inspector', email: 'amit.verma@police.in', phone: '9800010007', address: '45 Camp Area, Deccan, Pune' },
          { police_id: 'POL008', name: 'Divya Gupta', crime_type: 'Extortion', position: 'Constable', email: 'divya.gupta@police.in', phone: '9800010008', address: '67 SG Highway, Prahlad Nagar, Ahmedabad' },
          { police_id: 'POL009', name: 'Nitin Joshi', crime_type: 'Murder', position: 'Senior Inspector', email: 'nitin.joshi@police.in', phone: '9800010009', address: '89 MI Road, C-Scheme, Jaipur' },
          { police_id: 'POL010', name: 'Kavya Menon', crime_type: 'Burglary', position: 'Inspector', email: 'kavya.menon@police.in', phone: '9800010010', address: '101 Hazratganj, Gomti Nagar, Lucknow' },
          { police_id: 'POL011', name: 'Harpreet Kaur', crime_type: 'Harassment', position: 'Sub-Inspector', email: 'harpreet.kaur@police.in', phone: '9800010011', address: '121 Sector 17-C, Chandigarh' },
          { police_id: 'POL012', name: 'Rajesh Nair', crime_type: 'Smuggling', position: 'Senior Inspector', email: 'rajesh.nair@police.in', phone: '9800010012', address: '141 North Avenue, Civil Lines, Delhi' },
          { police_id: 'POL013', name: 'Shreya Verma', crime_type: 'DUI', position: 'Constable', email: 'shreya.verma@police.in', phone: '9800010013', address: '161 South Extension Part 2, Delhi' },
          { police_id: 'POL014', name: 'Vikram Patel', crime_type: 'Vandalism', position: 'Inspector', email: 'vikram.patel@police.in', phone: '9800010014', address: '181 East Kidwai Nagar, Delhi' },
          { police_id: 'POL015', name: 'Anita Gupta', crime_type: 'Forgery', position: 'Sub-Inspector', email: 'anita.gupta@police.in', phone: '9800010015', address: '201 West Patel Nagar, Delhi' },
          { police_id: 'POL016', name: 'Suresh Yadav', crime_type: 'Domestic Violence', position: 'Inspector', email: 'suresh.yadav@police.in', phone: '9800010016', address: '15 Karol Bagh, Rajendra Place, Delhi' },
          { police_id: 'POL017', name: 'Meera Iyer', crime_type: 'Human Trafficking', position: 'Senior Inspector', email: 'meera.iyer@police.in', phone: '9800010017', address: '88 Adyar, Besant Nagar, Chennai' },
          { police_id: 'POL018', name: 'Deepak Chauhan', crime_type: 'Robbery', position: 'Constable', email: 'deepak.chauhan@police.in', phone: '9800010018', address: '44 Andheri East, Marol, Mumbai' },
          { police_id: 'POL019', name: 'Pooja Rani', crime_type: 'Cyber Crime', position: 'Sub-Inspector', email: 'pooja.rani@police.in', phone: '9800010019', address: '72 Electronic City Phase 1, Bangalore' },
          { police_id: 'POL020', name: 'Manish Tiwari', crime_type: 'Corruption', position: 'Senior Inspector', email: 'manish.tiwari@police.in', phone: '9800010020', address: '33 Aliganj, Lucknow' }
        ];

        const policeSql = `INSERT OR IGNORE INTO police (police_id, name, crime_type, position, station_name, station_id, email, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        for (let i = 0; i < policeOfficers.length; i++) {
          const officer = policeOfficers[i];
          const sIdx = i % stationIds.length;

          db.run(policeSql, [
            officer.police_id, officer.name, officer.crime_type, officer.position,
            stationNames[sIdx], stationIds[sIdx],
            officer.email, officer.phone, officer.address
          ], function(err) {
            if (!err && this.changes > 0) console.log(`  ✓ Police added: ${officer.name} (${officer.position})`);
          });
        }

        // ============ CRIMINALS (20 criminals) ============
        // Correct schema: station_name, station_id, crime_type, crime_date, crime_time,
        //   Prison_name, Court_name, Criminal_name, contact, DateOfBirth, email, state, city, address, photo
        console.log('\n🚨 Adding Criminals...');

        const criminals = [
          { Criminal_name: 'Mohit Chauhan', crime_type: 'Robbery', crime_date: '2024-01-15', crime_time: '22:30', Prison_name: 'Tihar Jail', Court_name: 'Patiala House Court', contact: '9700010001', DateOfBirth: '1992-03-12', email: 'mohit.c@email.com', state: 'Delhi', city: 'Delhi', address: '123 Slum Area, Delhi' },
          { Criminal_name: 'Ramesh Singh', crime_type: 'DUI', crime_date: '2024-02-10', crime_time: '01:45', Prison_name: 'Arthur Road Jail', Court_name: 'Mumbai City Court', contact: '9700010002', DateOfBirth: '1996-07-22', email: 'ramesh.s@email.com', state: 'Maharashtra', city: 'Mumbai', address: '456 Old City, Mumbai' },
          { Criminal_name: 'Sunita Devi', crime_type: 'Fraud', crime_date: '2024-03-05', crime_time: '14:00', Prison_name: 'Parappana Agrahara', Court_name: 'Bangalore City Court', contact: '9700010003', DateOfBirth: '1988-11-30', email: 'sunita.d@email.com', state: 'Karnataka', city: 'Bangalore', address: '789 Market Lane, Bangalore' },
          { Criminal_name: 'Vikram Reddy', crime_type: 'Drug Trafficking', crime_date: '2024-01-20', crime_time: '03:15', Prison_name: 'Chanchalguda Jail', Court_name: 'Hyderabad High Court', contact: '9700010004', DateOfBirth: '1985-05-18', email: 'vikram.r@email.com', state: 'Telangana', city: 'Hyderabad', address: '321 Industrial Area, Hyderabad' },
          { Criminal_name: 'Rani Kumari', crime_type: 'Shoplifting', crime_date: '2024-04-12', crime_time: '16:30', Prison_name: 'Puzhal Prison', Court_name: 'Chennai Magistrate', contact: '9700010005', DateOfBirth: '2000-01-25', email: 'rani.k@email.com', state: 'Tamil Nadu', city: 'Chennai', address: '654 Residential Area, Chennai' },
          { Criminal_name: 'Arjun Patel', crime_type: 'Money Laundering', crime_date: '2024-02-28', crime_time: '10:00', Prison_name: 'Presidency Jail', Court_name: 'Kolkata High Court', contact: '9700010006', DateOfBirth: '1980-09-14', email: 'arjun.p@email.com', state: 'West Bengal', city: 'Kolkata', address: '987 Business District, Kolkata' },
          { Criminal_name: 'Neha Verma', crime_type: 'Identity Theft', crime_date: '2024-03-18', crime_time: '12:00', Prison_name: 'Yerawada Jail', Court_name: 'Pune Sessions Court', contact: '9700010007', DateOfBirth: '1995-04-09', email: 'neha.v@email.com', state: 'Maharashtra', city: 'Pune', address: '111 IT Park, Pune' },
          { Criminal_name: 'Sanjay Kapoor', crime_type: 'Vehicle Theft', crime_date: '2024-05-02', crime_time: '23:45', Prison_name: 'Sabarmati Jail', Court_name: 'Ahmedabad Court', contact: '9700010008', DateOfBirth: '1991-12-01', email: 'sanjay.k@email.com', state: 'Gujarat', city: 'Ahmedabad', address: '222 Outskirts, Ahmedabad' },
          { Criminal_name: 'Deepa Krishnan', crime_type: 'Forgery', crime_date: '2024-04-20', crime_time: '09:30', Prison_name: 'Jaipur Central Jail', Court_name: 'Jaipur City Court', contact: '9700010009', DateOfBirth: '1993-08-17', email: 'deepa.k@email.com', state: 'Rajasthan', city: 'Jaipur', address: '333 Walled City, Jaipur' },
          { Criminal_name: 'Rohit Sharma', crime_type: 'Extortion', crime_date: '2024-01-30', crime_time: '18:00', Prison_name: 'Lucknow Jail', Court_name: 'Lucknow Bench', contact: '9700010010', DateOfBirth: '1987-06-20', email: 'rohit.sh@email.com', state: 'Uttar Pradesh', city: 'Lucknow', address: '444 Gomti Nagar, Lucknow' },
          { Criminal_name: 'Kavita Nair', crime_type: 'Cyber Crime', crime_date: '2024-06-01', crime_time: '02:00', Prison_name: 'Model Jail Chandigarh', Court_name: 'Chandigarh Court', contact: '9700010011', DateOfBirth: '1998-02-14', email: 'kavita.n@email.com', state: 'Chandigarh', city: 'Chandigarh', address: '555 Sector 22, Chandigarh' },
          { Criminal_name: 'Amit Gupta', crime_type: 'Kidnapping', crime_date: '2024-02-14', crime_time: '20:15', Prison_name: 'Tihar Jail', Court_name: 'Delhi High Court', contact: '9700010012', DateOfBirth: '1982-10-05', email: 'amit.g@email.com', state: 'Delhi', city: 'Delhi', address: '666 Dwarka, Delhi' },
          { Criminal_name: 'Simran Bedi', crime_type: 'Drug Possession', crime_date: '2024-05-15', crime_time: '15:30', Prison_name: 'Arthur Road Jail', Court_name: 'Mumbai Sessions Court', contact: '9700010013', DateOfBirth: '1999-07-03', email: 'simran.b@email.com', state: 'Maharashtra', city: 'Mumbai', address: '777 Bandra, Mumbai' },
          { Criminal_name: 'Nitin Malhotra', crime_type: 'Armed Robbery', crime_date: '2024-03-25', crime_time: '04:00', Prison_name: 'Parappana Agrahara', Court_name: 'Bangalore Magistrate', contact: '9700010014', DateOfBirth: '1984-03-28', email: 'nitin.m@email.com', state: 'Karnataka', city: 'Bangalore', address: '888 Whitefield, Bangalore' },
          { Criminal_name: 'Kavya Singh', crime_type: 'Assault', crime_date: '2024-06-10', crime_time: '21:00', Prison_name: 'Chanchalguda Jail', Court_name: 'Hyderabad Court', contact: '9700010015', DateOfBirth: '1997-11-11', email: 'kavya.s@email.com', state: 'Telangana', city: 'Hyderabad', address: '999 Banjara Hills, Hyderabad' },
          { Criminal_name: 'Harpreet Malik', crime_type: 'Human Trafficking', crime_date: '2024-04-08', crime_time: '06:30', Prison_name: 'Puzhal Prison', Court_name: 'Chennai High Court', contact: '9700010016', DateOfBirth: '1979-01-19', email: 'harpreet.m@email.com', state: 'Tamil Nadu', city: 'Chennai', address: '1010 T. Nagar, Chennai' },
          { Criminal_name: 'Shreya Das', crime_type: 'Fraud', crime_date: '2024-05-22', crime_time: '11:45', Prison_name: 'Presidency Jail', Court_name: 'Kolkata Sessions Court', contact: '9700010017', DateOfBirth: '1994-06-06', email: 'shreya.d@email.com', state: 'West Bengal', city: 'Kolkata', address: '1111 Salt Lake, Kolkata' },
          { Criminal_name: 'Rajesh Nair', crime_type: 'Smuggling', crime_date: '2024-02-05', crime_time: '00:30', Prison_name: 'Yerawada Jail', Court_name: 'Pune Court', contact: '9700010018', DateOfBirth: '1981-08-23', email: 'rajesh.n@email.com', state: 'Maharashtra', city: 'Pune', address: '1212 Kothrud, Pune' },
          { Criminal_name: 'Ananya Gupta', crime_type: 'Hacking', crime_date: '2024-06-18', crime_time: '13:15', Prison_name: 'Sabarmati Jail', Court_name: 'Ahmedabad High Court', contact: '9700010019', DateOfBirth: '2001-04-30', email: 'ananya.g@email.com', state: 'Gujarat', city: 'Ahmedabad', address: '1313 CG Road, Ahmedabad' },
          { Criminal_name: 'Vikram Thakur', crime_type: 'Attempted Murder', crime_date: '2024-01-08', crime_time: '19:00', Prison_name: 'Jaipur Central Jail', Court_name: 'Jaipur High Court', contact: '9700010020', DateOfBirth: '1975-12-15', email: 'vikram.t@email.com', state: 'Rajasthan', city: 'Jaipur', address: '1414 Vaishali Nagar, Jaipur' }
        ];

        const criminalSql = `INSERT OR IGNORE INTO criminals (
          station_name, station_id, crime_type, crime_date, crime_time,
          "Prison_name", "Court_name", "Criminal_name", contact, "DateOfBirth",
          email, state, city, address, photo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        for (let i = 0; i < criminals.length; i++) {
          const c = criminals[i];
          const sIdx = i % stationIds.length;

          db.run(criminalSql, [
            stationNames[sIdx], stationIds[sIdx],
            c.crime_type, c.crime_date, c.crime_time,
            c.Prison_name, c.Court_name, c.Criminal_name,
            c.contact, c.DateOfBirth, c.email,
            c.state, c.city, c.address, null
          ], function(err) {
            if (!err && this.changes > 0) console.log(`  ✓ Criminal added: ${c.Criminal_name} (${c.crime_type})`);
            if (err) console.error(`  ✗ Criminal error: ${c.Criminal_name}`, err.message);
          });
        }

        // ============ FIRs (20 FIRs with ALL attributes) ============
        console.log('\n📋 Adding First Information Reports (FIRs)...');

        const firSql = `INSERT OR IGNORE INTO firs (
          user_id, station_name, station_id, crime_type, accused, name, age, number,
          address, relation, purpose, file, crime_location, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const firData = [
          { crime_type: 'Robbery', accused: 'Mohit Chauhan', name: 'Rajesh Kumar', age: 45, number: '9876543210', address: '123 Chandni Chowk, Old Delhi, Delhi', relation: 'Self', purpose: 'Gold chain snatched while walking through market at 10 PM', crime_location: 'Chandni Chowk Market, Old Delhi', status: 'Approved' },
          { crime_type: 'Assault', accused: 'Ramesh Singh', name: 'Priya Sharma', age: 32, number: '9876543211', address: '456 Andheri West, Mumbai, Maharashtra', relation: 'Victim', purpose: 'Physical assault by neighbour during parking dispute', crime_location: 'Andheri West Society Parking, Mumbai', status: 'Approved' },
          { crime_type: 'Theft', accused: 'Unknown', name: 'Rama Krishnan', age: 38, number: '9876543212', address: '789 Indiranagar, Bangalore, Karnataka', relation: 'Self', purpose: 'Laptop and wallet stolen from parked car at night', crime_location: 'Indiranagar 100 Feet Road, Bangalore', status: 'Rejected' },
          { crime_type: 'Fraud', accused: 'Vikram Reddy', name: 'Neha Gupta', age: 29, number: '9876543213', address: '321 HITEC City, Hyderabad, Telangana', relation: 'Self', purpose: 'Online banking fraud - Rs 2,50,000 debited via phishing link', crime_location: 'HITEC City, Madhapur, Hyderabad', status: 'Approved' },
          { crime_type: 'Drug Possession', accused: 'Simran Bedi', name: 'Amit Patel', age: 27, number: '9876543214', address: '654 T. Nagar, Chennai, Tamil Nadu', relation: 'Self', purpose: 'Suspicious substances found during routine vehicle check', crime_location: 'T. Nagar Bus Stand, Chennai', status: 'Approved' },
          { crime_type: 'DUI', accused: 'Ramesh Singh', name: 'Sanjay Verma', age: 35, number: '9876543215', address: '987 EM Bypass, Kolkata, West Bengal', relation: 'Self', purpose: 'Drunk driving accident causing damage to parked vehicles', crime_location: 'EM Bypass near Science City, Kolkata', status: 'Rejected' },
          { crime_type: 'Burglary', accused: 'Sanjay Kapoor', name: 'Urmila Das', age: 50, number: '9876543216', address: '111 Kothrud, Pune, Maharashtra', relation: 'Victim', purpose: 'House break-in at night, jewelry and cash worth Rs 5 lakh stolen', crime_location: 'Kothrud Residential Colony, Pune', status: 'Approved' },
          { crime_type: 'Cyber Crime', accused: 'Kavita Nair', name: 'Vikram Rajput', age: 31, number: '9876543217', address: '222 SG Highway, Ahmedabad, Gujarat', relation: 'Self', purpose: 'Company server hacked, confidential data leaked online', crime_location: 'SG Highway IT Park, Ahmedabad', status: 'Approved' },
          { crime_type: 'Extortion', accused: 'Rohit Sharma', name: 'Ravi Nair', age: 42, number: '9876543218', address: '333 MI Road, Jaipur, Rajasthan', relation: 'Self', purpose: 'Threatening calls demanding Rs 10 lakh protection money', crime_location: 'MI Road Market Area, Jaipur', status: 'Rejected' },
          { crime_type: 'Kidnapping', accused: 'Amit Gupta', name: 'Keya Sharma', age: 28, number: '9876543219', address: '444 Gomti Nagar, Lucknow, Uttar Pradesh', relation: 'Relative', purpose: 'Minor child abducted from school premises by unknown person', crime_location: 'DPS School, Gomti Nagar, Lucknow', status: 'Approved' },
          { crime_type: 'Forgery', accused: 'Deepa Krishnan', name: 'Harpreet Singh', age: 55, number: '9876543220', address: '555 Sector 22, Chandigarh', relation: 'Self', purpose: 'Forged property sale deed used to claim ownership of ancestral land', crime_location: 'Sub-Registrar Office, Sector 17, Chandigarh', status: 'Approved' },
          { crime_type: 'Harassment', accused: 'Kavya Singh', name: 'Anita Verma', age: 26, number: '9876543221', address: '666 Dwarka Sector 12, Delhi', relation: 'Self', purpose: 'Continuous workplace harassment and threatening messages from colleague', crime_location: 'Cyber Hub Office, Dwarka, Delhi', status: 'Rejected' },
          { crime_type: 'Vehicle Theft', accused: 'Sanjay Kapoor', name: 'Deepak Sharma', age: 40, number: '9876543222', address: '777 Bandra East, Mumbai, Maharashtra', relation: 'Self', purpose: 'Car (Honda City MH-02-AB-1234) stolen from mall parking lot', crime_location: 'Phoenix Mall Parking, Bandra, Mumbai', status: 'Approved' },
          { crime_type: 'Shoplifting', accused: 'Rani Kumari', name: 'Pooja Desai', age: 33, number: '9876543223', address: '888 Whitefield, Bangalore, Karnataka', relation: 'Witness', purpose: 'Electronics worth Rs 75,000 stolen from showroom caught on CCTV', crime_location: 'Forum Mall, Whitefield, Bangalore', status: 'Approved' },
          { crime_type: 'Identity Theft', accused: 'Neha Verma', name: 'Suresh Kumar', age: 47, number: '9876543224', address: '999 Banjara Hills, Hyderabad, Telangana', relation: 'Self', purpose: 'Cloned Aadhaar card used to take Rs 3 lakh loan in victim name', crime_location: 'SBI Branch, Banjara Hills, Hyderabad', status: 'Rejected' },
          { crime_type: 'Human Trafficking', accused: 'Harpreet Malik', name: 'Rekha Singh', age: 31, number: '9876543230', address: '1515 Aliganj, Lucknow, Uttar Pradesh', relation: 'Victim', purpose: 'Cross-border trafficking ring operating from industrial area', crime_location: 'Aliganj Industrial Area, Lucknow', status: 'Approved' },
          { crime_type: 'Attempted Murder', accused: 'Vikram Thakur', name: 'Harsha Sharma', age: 43, number: '9876543232', address: '1717 Karol Bagh, Delhi', relation: 'Victim', purpose: 'Stabbed twice by assailant with knife during road rage incident', crime_location: 'Karol Bagh Crossing, Delhi', status: 'Approved' },
          { crime_type: 'Smuggling', accused: 'Rajesh Nair', name: 'Prakash Sharma', age: 52, number: '9876543233', address: '1818 Colaba, Mumbai, Maharashtra', relation: 'Witness', purpose: 'Illegal electronic goods worth Rs 25 lakh seized at port warehouse', crime_location: 'Mumbai Port Trust, Gateway Dock, Mumbai', status: 'Approved' },
          { crime_type: 'Corruption', accused: 'Unknown Govt Official', name: 'Rajesh Desai', age: 56, number: '9876543229', address: '1414 Vaishali Nagar, Jaipur, Rajasthan', relation: 'Self', purpose: 'Municipal officer demanding Rs 50,000 bribe for building permit', crime_location: 'Municipal Corporation Office, Jaipur', status: 'Rejected' },
          { crime_type: 'Embezzlement', accused: 'Sunil Mehra', name: 'Sheela Desai', age: 41, number: '9876543238', address: '2323 Camp Area, Pune, Maharashtra', relation: 'Self', purpose: 'Company CFO embezzled Rs 1.5 crore over 2 years using fake vendors', crime_location: 'Tech Park Tower B, Hinjewadi, Pune', status: 'Approved' }
        ];

        const statuses = ['Sent', 'Approved', 'Rejected'];

        // Get user IDs for FIR insertion
        db.all('SELECT id FROM users WHERE role="User" LIMIT 20', [], (err, userRows) => {
          if (err || !userRows || userRows.length === 0) {
            console.log('⚠️ No users found. Creating sample FIRs with user_id 2');
            for (let i = 0; i < firData.length; i++) {
              const fir = firData[i];
              const sIdx = i % stationIds.length;

              db.run(firSql, [
                2, stationNames[sIdx], stationIds[sIdx],
                fir.crime_type, fir.accused, fir.name, fir.age,
                fir.number, fir.address, fir.relation, fir.purpose, null,
                fir.crime_location, fir.status
              ], function(err) {
                if (!err && this.changes > 0) console.log(`  ✓ FIR added: ${fir.crime_type} at ${fir.crime_location} (${fir.status})`);
              });
            }
          } else {
            for (let i = 0; i < firData.length; i++) {
              const fir = firData[i];
              const userId = userRows[i % userRows.length].id;
              const sIdx = i % stationIds.length;

              db.run(firSql, [
                userId, stationNames[sIdx], stationIds[sIdx],
                fir.crime_type, fir.accused, fir.name, fir.age,
                fir.number, fir.address, fir.relation, fir.purpose, null,
                fir.crime_location, fir.status
              ], function(err) {
                if (!err && this.changes > 0) console.log(`  ✓ FIR added: ${fir.crime_type} at ${fir.crime_location} (${fir.status})`);
              });
            }
          }

          // ============ CRIME ANALYSIS DATA (20 records) ============
          console.log('\n📊 Adding Crime Analysis Data...');

          const crimeAnalysisSql = `INSERT INTO crime_analysis (period, crime_type, count, location, severity, trend) VALUES (?, ?, ?, ?, ?, ?)`;

          const crimeAnalysisData = [
            { period: '2024-Q1', crime_type: 'Robbery', count: 45, location: 'Delhi', severity: 'High', trend: 'Increasing' },
            { period: '2024-Q1', crime_type: 'Theft', count: 78, location: 'Mumbai', severity: 'Medium', trend: 'Stable' },
            { period: '2024-Q1', crime_type: 'Cyber Crime', count: 32, location: 'Bangalore', severity: 'High', trend: 'Increasing' },
            { period: '2024-Q1', crime_type: 'Fraud', count: 56, location: 'Hyderabad', severity: 'Medium', trend: 'Increasing' },
            { period: '2024-Q1', crime_type: 'Assault', count: 23, location: 'Chennai', severity: 'High', trend: 'Decreasing' },
            { period: '2024-Q2', crime_type: 'Robbery', count: 38, location: 'Delhi', severity: 'High', trend: 'Decreasing' },
            { period: '2024-Q2', crime_type: 'Drug Trafficking', count: 19, location: 'Mumbai', severity: 'Critical', trend: 'Increasing' },
            { period: '2024-Q2', crime_type: 'Burglary', count: 41, location: 'Kolkata', severity: 'Medium', trend: 'Stable' },
            { period: '2024-Q2', crime_type: 'Vehicle Theft', count: 67, location: 'Pune', severity: 'Medium', trend: 'Increasing' },
            { period: '2024-Q2', crime_type: 'Kidnapping', count: 12, location: 'Ahmedabad', severity: 'Critical', trend: 'Stable' },
            { period: '2024-Q2', crime_type: 'DUI', count: 89, location: 'Jaipur', severity: 'Low', trend: 'Increasing' },
            { period: '2024-Q2', crime_type: 'Harassment', count: 34, location: 'Lucknow', severity: 'Medium', trend: 'Stable' },
            { period: '2024-Q3', crime_type: 'Forgery', count: 15, location: 'Chandigarh', severity: 'Medium', trend: 'Decreasing' },
            { period: '2024-Q3', crime_type: 'Smuggling', count: 8, location: 'Delhi', severity: 'Critical', trend: 'Stable' },
            { period: '2024-Q3', crime_type: 'Extortion', count: 27, location: 'Mumbai', severity: 'High', trend: 'Increasing' },
            { period: '2024-Q3', crime_type: 'Hacking', count: 43, location: 'Bangalore', severity: 'High', trend: 'Increasing' },
            { period: '2024-Q3', crime_type: 'Shoplifting', count: 52, location: 'Hyderabad', severity: 'Low', trend: 'Stable' },
            { period: '2024-Q3', crime_type: 'Identity Theft', count: 29, location: 'Chennai', severity: 'High', trend: 'Increasing' },
            { period: '2024-Q3', crime_type: 'Vandalism', count: 36, location: 'Kolkata', severity: 'Low', trend: 'Decreasing' },
            { period: '2024-Q3', crime_type: 'Corruption', count: 11, location: 'Pune', severity: 'Critical', trend: 'Stable' }
          ];

          crimeAnalysisData.forEach(ca => {
            db.run(crimeAnalysisSql, [ca.period, ca.crime_type, ca.count, ca.location, ca.severity, ca.trend], function(err) {
              if (!err && this.changes > 0) console.log(`  ✓ Crime analysis: ${ca.crime_type} in ${ca.location} (${ca.period})`);
            });
          });

          // ============ ACTIVITY LOG DATA (20 records) ============
          console.log('\n📝 Adding Activity Logs...');

          const activityLogSql = `INSERT INTO activity_log (user_id, activity_type, action, description, entity_type, entity_id, icon) VALUES (?, ?, ?, ?, ?, ?, ?)`;

          const activityData = [
            { activity_type: 'FIR_CREATED', action: 'FIR Filed', description: 'New FIR filed for robbery near market', entity_type: 'FIR', entity_id: 1, icon: 'fas fa-file-alt' },
            { activity_type: 'CRIMINAL_ADDED', action: 'Criminal record added', description: 'Mohit Chauhan added for robbery charges', entity_type: 'Criminal', entity_id: 1, icon: 'fas fa-user-secret' },
            { activity_type: 'FIR_APPROVED', action: 'FIR Approved', description: 'FIR #2 approved by police station', entity_type: 'FIR', entity_id: 2, icon: 'fas fa-check-circle' },
            { activity_type: 'POLICE_ADDED', action: 'Police officer added', description: 'Arjun Singh assigned to Central Station', entity_type: 'Police', entity_id: 1, icon: 'fas fa-users-cog' },
            { activity_type: 'FIR_REJECTED', action: 'FIR Rejected', description: 'FIR #5 rejected due to insufficient evidence', entity_type: 'FIR', entity_id: 5, icon: 'fas fa-times-circle' },
            { activity_type: 'CRIMINAL_UPDATED', action: 'Criminal record updated', description: 'Vikram Reddy status updated', entity_type: 'Criminal', entity_id: 4, icon: 'fas fa-edit' },
            { activity_type: 'FIR_CREATED', action: 'FIR Filed', description: 'New FIR filed for cyber crime incident', entity_type: 'FIR', entity_id: 8, icon: 'fas fa-file-alt' },
            { activity_type: 'STATION_ADDED', action: 'Station added', description: 'Chennai Central Police Station added to system', entity_type: 'Station', entity_id: 9, icon: 'fas fa-building' },
            { activity_type: 'USER_REGISTERED', action: 'User registered', description: 'New user Rajesh Kumar registered', entity_type: 'User', entity_id: 6, icon: 'fas fa-user-plus' },
            { activity_type: 'FIR_APPROVED', action: 'FIR Approved', description: 'FIR #10 approved and officer assigned', entity_type: 'FIR', entity_id: 10, icon: 'fas fa-check-circle' },
            { activity_type: 'CRIMINAL_ADDED', action: 'Criminal record added', description: 'Neha Verma added for identity theft', entity_type: 'Criminal', entity_id: 7, icon: 'fas fa-user-secret' },
            { activity_type: 'FIR_CREATED', action: 'FIR Filed', description: 'New FIR filed for vehicle theft at mall', entity_type: 'FIR', entity_id: 13, icon: 'fas fa-file-alt' },
            { activity_type: 'POLICE_ADDED', action: 'Police officer added', description: 'Neha Desai added to Mumbai Central', entity_type: 'Police', entity_id: 2, icon: 'fas fa-users-cog' },
            { activity_type: 'FIR_APPROVED', action: 'FIR Approved', description: 'FIR #15 approved for identity theft case', entity_type: 'FIR', entity_id: 15, icon: 'fas fa-check-circle' },
            { activity_type: 'CRIMINAL_UPDATED', action: 'Criminal record updated', description: 'Sanjay Kapoor court hearing updated', entity_type: 'Criminal', entity_id: 8, icon: 'fas fa-edit' },
            { activity_type: 'USER_REGISTERED', action: 'User registered', description: 'New user Pooja Kumari registered', entity_type: 'User', entity_id: 11, icon: 'fas fa-user-plus' },
            { activity_type: 'FIR_CREATED', action: 'FIR Filed', description: 'New FIR filed for smuggling at port', entity_type: 'FIR', entity_id: 24, icon: 'fas fa-file-alt' },
            { activity_type: 'STATION_ADDED', action: 'Station added', description: 'Kolkata Park Street Station added', entity_type: 'Station', entity_id: 10, icon: 'fas fa-building' },
            { activity_type: 'FIR_REJECTED', action: 'FIR Rejected', description: 'FIR #19 rejected - not in jurisdiction', entity_type: 'FIR', entity_id: 19, icon: 'fas fa-times-circle' },
            { activity_type: 'CRIMINAL_ADDED', action: 'Criminal record added', description: 'Vikram Thakur added for attempted murder', entity_type: 'Criminal', entity_id: 20, icon: 'fas fa-user-secret' }
          ];

          activityData.forEach((act, idx) => {
            const userId = userRows ? userRows[idx % userRows.length].id : 1;
            db.run(activityLogSql, [userId, act.activity_type, act.action, act.description, act.entity_type, act.entity_id, act.icon], function(err) {
              if (!err && this.changes > 0) console.log(`  ✓ Activity: ${act.action} - ${act.description.substring(0, 40)}...`);
            });
          });

          console.log('\n✅ Sample data insertion completed!');
          console.log('\n📊 Sample Data Summary:');
          console.log('   - 15 Regular Users');
          console.log('   - 20 Police Officers (with position)');
          console.log('   - 20 Criminals (with name & location)');
          console.log('   - 20 FIRs (with all attributes & crime_location)');
          console.log('   - 20 Crime Analysis Records');
          console.log('   - 20 Activity Log Entries');

          setTimeout(() => {
            db.close();
            console.log('\n✅ Database connection closed.');
            process.exit(0);
          }, 2000);
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
