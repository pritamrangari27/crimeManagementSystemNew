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

        // ============ POLICE OFFICERS (15 officers) ============
        // Correct schema: police_id, name, crime_type, station_name, station_id, email, phone, address
        console.log('\n👮 Adding Police Officers...');

        const policeOfficers = [
          { police_id: 'POL001', name: 'Arjun Singh', crime_type: 'Robbery', email: 'arjun.singh@police.in', phone: '9800010001', address: '12 Sector 4, Delhi' },
          { police_id: 'POL002', name: 'Neha Desai', crime_type: 'Cyber Crime', email: 'neha.desai@police.in', phone: '9800010002', address: '34 MG Road, Mumbai' },
          { police_id: 'POL003', name: 'Ravi Kumar', crime_type: 'Theft', email: 'ravi.kumar@police.in', phone: '9800010003', address: '56 Koramangala, Bangalore' },
          { police_id: 'POL004', name: 'Priya Sharma', crime_type: 'Fraud', email: 'priya.sharma@police.in', phone: '9800010004', address: '78 Jubilee Hills, Hyderabad' },
          { police_id: 'POL005', name: 'Sanjay Reddy', crime_type: 'Drug Trafficking', email: 'sanjay.reddy@police.in', phone: '9800010005', address: '90 Anna Nagar, Chennai' },
          { police_id: 'POL006', name: 'Isha Patel', crime_type: 'Assault', email: 'isha.patel@police.in', phone: '9800010006', address: '23 Park Street, Kolkata' },
          { police_id: 'POL007', name: 'Amit Verma', crime_type: 'Kidnapping', email: 'amit.verma@police.in', phone: '9800010007', address: '45 Camp Area, Pune' },
          { police_id: 'POL008', name: 'Divya Gupta', crime_type: 'Extortion', email: 'divya.gupta@police.in', phone: '9800010008', address: '67 SG Highway, Ahmedabad' },
          { police_id: 'POL009', name: 'Nitin Joshi', crime_type: 'Murder', email: 'nitin.joshi@police.in', phone: '9800010009', address: '89 MI Road, Jaipur' },
          { police_id: 'POL010', name: 'Kavya Menon', crime_type: 'Burglary', email: 'kavya.menon@police.in', phone: '9800010010', address: '101 Hazratganj, Lucknow' },
          { police_id: 'POL011', name: 'Harpreet Kaur', crime_type: 'Harassment', email: 'harpreet.kaur@police.in', phone: '9800010011', address: '121 Sector 17, Chandigarh' },
          { police_id: 'POL012', name: 'Rajesh Nair', crime_type: 'Smuggling', email: 'rajesh.nair@police.in', phone: '9800010012', address: '141 North Avenue, Delhi' },
          { police_id: 'POL013', name: 'Shreya Verma', crime_type: 'DUI', email: 'shreya.verma@police.in', phone: '9800010013', address: '161 South Road, Delhi' },
          { police_id: 'POL014', name: 'Vikram Patel', crime_type: 'Vandalism', email: 'vikram.patel@police.in', phone: '9800010014', address: '181 East Lane, Delhi' },
          { police_id: 'POL015', name: 'Anita Gupta', crime_type: 'Forgery', email: 'anita.gupta@police.in', phone: '9800010015', address: '201 West Blvd, Delhi' }
        ];

        const policeSql = `INSERT OR IGNORE INTO police (police_id, name, crime_type, station_name, station_id, email, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        for (let i = 0; i < policeOfficers.length; i++) {
          const officer = policeOfficers[i];
          const sIdx = i % stationIds.length;

          db.run(policeSql, [
            officer.police_id, officer.name, officer.crime_type,
            stationNames[sIdx], stationIds[sIdx],
            officer.email, officer.phone, officer.address
          ], function(err) {
            if (!err && this.changes > 0) console.log(`  ✓ Police added: ${officer.name} (${officer.police_id})`);
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

        // ============ FIRs (30 FIRs) ============
        console.log('\n📋 Adding First Information Reports (FIRs)...');

        const firSql = `INSERT OR IGNORE INTO firs (
          user_id, station_name, station_id, crime_type, accused, name, age, number,
          address, relation, purpose, file, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const firData = [
          { crime_type: 'Robbery', accused: 'Mohit Chauhan', name: 'Rajesh Kumar', age: 45, number: '9876543210', address: '123 Main St, Delhi', relation: 'Self', purpose: 'Robbery near market area at night' },
          { crime_type: 'Assault', accused: 'Ramesh Singh', name: 'Priya Sharma', age: 32, number: '9876543211', address: '456 Park Road, Mumbai', relation: 'Victim', purpose: 'Physical assault outside office' },
          { crime_type: 'Theft', accused: 'Unknown', name: 'Rama Krishnan', age: 38, number: '9876543212', address: '789 Commerce Lane, Bangalore', relation: 'Self', purpose: 'Bike theft from parking lot' },
          { crime_type: 'Fraud', accused: 'Vikram Reddy', name: 'Neha Gupta', age: 29, number: '9876543213', address: '321 Tech Park, Hyderabad', relation: 'Self', purpose: 'Online banking fraud - Rs 50000' },
          { crime_type: 'Drug Possession', accused: 'Simran Bedi', name: 'Amit Patel', age: 27, number: '9876543214', address: '654 Downtown, Chennai', relation: 'Self', purpose: 'Substance found during search' },
          { crime_type: 'DUI', accused: 'Ramesh Singh', name: 'Sanjay Verma', age: 35, number: '9876543215', address: '987 Highway, Kolkata', relation: 'Self', purpose: 'Drunk driving accident' },
          { crime_type: 'Burglary', accused: 'Sanjay Kapoor', name: 'Urmila Das', age: 50, number: '9876543216', address: '111 Residential, Pune', relation: 'Victim', purpose: 'House break-in and valuables stolen' },
          { crime_type: 'Cyber Crime', accused: 'Kavita Nair', name: 'Vikram Rajput', age: 31, number: '9876543217', address: '222 Cyber City, Ahmedabad', relation: 'Self', purpose: 'Website hacking and data theft' },
          { crime_type: 'Extortion', accused: 'Rohit Sharma', name: 'Ravi Nair', age: 42, number: '9876543218', address: '333 Business, Jaipur', relation: 'Self', purpose: 'Business extortion demands' },
          { crime_type: 'Kidnapping', accused: 'Amit Gupta', name: 'Keya Sharma', age: 28, number: '9876543219', address: '444 Area, Lucknow', relation: 'Relative', purpose: 'Child kidnapping from school' },
          { crime_type: 'Forgery', accused: 'Deepa Krishnan', name: 'Harpreet Singh', age: 55, number: '9876543220', address: '555 Market, Chandigarh', relation: 'Self', purpose: 'Forged property documents' },
          { crime_type: 'Harassment', accused: 'Kavya Singh', name: 'Anita Verma', age: 26, number: '9876543221', address: '666 Locality, Delhi', relation: 'Self', purpose: 'Workplace harassment complaint' },
          { crime_type: 'Vehicle Theft', accused: 'Sanjay Kapoor', name: 'Deepak Sharma', age: 40, number: '9876543222', address: '777 Parking, Mumbai', relation: 'Self', purpose: 'Car stolen from mall parking' },
          { crime_type: 'Shoplifting', accused: 'Rani Kumari', name: 'Pooja Desai', age: 33, number: '9876543223', address: '888 Mall, Bangalore', relation: 'Witness', purpose: 'Electronics theft from store' },
          { crime_type: 'Identity Theft', accused: 'Neha Verma', name: 'Suresh Kumar', age: 47, number: '9876543224', address: '999 Bank, Hyderabad', relation: 'Self', purpose: 'Cloned bank cards used' },
          { crime_type: 'Robbery', accused: 'Mohit Chauhan', name: 'Vivek Singh', age: 44, number: '9876543225', address: '1010 Street, Chennai', relation: 'Self', purpose: 'Jewelry shop robbery' },
          { crime_type: 'Assault', accused: 'Unknown', name: 'Sneha Patel', age: 36, number: '9876543226', address: '1111 Road, Kolkata', relation: 'Victim', purpose: 'Bar fight injuries' },
          { crime_type: 'Fraud', accused: 'Shreya Das', name: 'Manish Nair', age: 39, number: '9876543227', address: '1212 Avenue, Pune', relation: 'Self', purpose: 'Investment scheme fraud' },
          { crime_type: 'Drug Possession', accused: 'Unknown', name: 'Aarav Gupta', age: 24, number: '9876543228', address: '1313 Lane, Ahmedabad', relation: 'Self', purpose: 'Drug peddling near school' },
          { crime_type: 'Corruption', accused: 'Unknown Govt Official', name: 'Rajesh Desai', age: 56, number: '9876543229', address: '1414 Civic, Jaipur', relation: 'Self', purpose: 'Bribery by government official' },
          { crime_type: 'Human Trafficking', accused: 'Harpreet Malik', name: 'Rekha Singh', age: 31, number: '9876543230', address: '1515 Metro, Lucknow', relation: 'Victim', purpose: 'Cross-border trafficking ring' },
          { crime_type: 'Hacking', accused: 'Ananya Gupta', name: 'Arjun Kumar', age: 29, number: '9876543231', address: '1616 Tech, Chandigarh', relation: 'Self', purpose: 'Email and social media hacking' },
          { crime_type: 'Attempted Murder', accused: 'Vikram Thakur', name: 'Harsha Sharma', age: 43, number: '9876543232', address: '1717 Hospital, Delhi', relation: 'Victim', purpose: 'Stabbing incident at market' },
          { crime_type: 'Smuggling', accused: 'Rajesh Nair', name: 'Prakash Sharma', age: 52, number: '9876543233', address: '1818 Port, Mumbai', relation: 'Witness', purpose: 'Illegal goods at port area' },
          { crime_type: 'Rape', accused: 'Unknown', name: 'Neha Singh', age: 24, number: '9876543234', address: '1919 Shelter, Bangalore', relation: 'Victim', purpose: 'Sexual assault complaint' },
          { crime_type: 'Abduction', accused: 'Unknown', name: 'Rani Patel', age: 27, number: '9876543235', address: '2020 Station, Hyderabad', relation: 'Victim', purpose: 'Forced abduction from home' },
          { crime_type: 'Counterfeiting', accused: 'Unknown', name: 'Naren Verma', age: 44, number: '9876543236', address: '2121 Currency Office, Chennai', relation: 'Self', purpose: 'Fake currency notes in circulation' },
          { crime_type: 'Vandalism', accused: 'Youth Gang', name: 'Raman Kumar', age: 38, number: '9876543237', address: '2222 Public, Kolkata', relation: 'Witness', purpose: 'Public property damage' },
          { crime_type: 'Embezzlement', accused: 'Company Employee', name: 'Sheela Desai', age: 41, number: '9876543238', address: '2323 Company, Pune', relation: 'Self', purpose: 'Company funds misappropriation' },
          { crime_type: 'Blackmail', accused: 'Unknown Extortionist', name: 'Vikas Sharma', age: 36, number: '9876543239', address: '2424 Office, Ahmedabad', relation: 'Self', purpose: 'Threatening messages and calls' }
        ];

        const statuses = ['Sent', 'Approved', 'Rejected'];

        // Get user IDs for FIR insertion
        db.all('SELECT id FROM users WHERE role="User" LIMIT 20', [], (err, userRows) => {
          if (err || !userRows || userRows.length === 0) {
            console.log('⚠️ No users found. Creating sample FIRs with user_id 2');
            for (let i = 0; i < firData.length; i++) {
              const fir = firData[i];
              const status = statuses[i % statuses.length];
              const sIdx = i % stationIds.length;

              db.run(firSql, [
                2, stationNames[sIdx], stationIds[sIdx],
                fir.crime_type, fir.accused, fir.name, fir.age,
                fir.number, fir.address, fir.relation, fir.purpose, null, status
              ], function(err) {
                if (!err && this.changes > 0) console.log(`  ✓ FIR added: ${fir.crime_type} against ${fir.accused} (${status})`);
              });
            }
          } else {
            for (let i = 0; i < firData.length; i++) {
              const fir = firData[i];
              const status = statuses[i % statuses.length];
              const userId = userRows[i % userRows.length].id;
              const sIdx = i % stationIds.length;

              db.run(firSql, [
                userId, stationNames[sIdx], stationIds[sIdx],
                fir.crime_type, fir.accused, fir.name, fir.age,
                fir.number, fir.address, fir.relation, fir.purpose, null, status
              ], function(err) {
                if (!err && this.changes > 0) console.log(`  ✓ FIR added: ${fir.crime_type} against ${fir.accused} (${status})`);
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
          console.log('   - 15 Police Officers');
          console.log('   - 20 Criminals');
          console.log('   - 30 First Information Reports (FIRs)');
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
