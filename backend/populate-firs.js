/**
 * One-time script to populate accused, relation, and address for all FIRs
 * Run with: node populate-firs.js
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
});

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

async function populateFIRs() {
  try {
    console.log('🔄 Connecting to Supabase...');
    const client = await pool.connect();
    
    console.log('📝 Populating FIRs with accused names, relations, and addresses...');
    
    let updated = 0;
    for (const [firNumber, accused, relation, address] of firExtras) {
      const query = `
        UPDATE firs 
        SET accused = $1, relation = $2, address = $3, updated_at = CURRENT_TIMESTAMP 
        WHERE fir_number = $4
      `;
      
      const result = await client.query(query, [accused, relation, address, firNumber]);
      if (result.rowCount > 0) {
        updated++;
        console.log(`✓ ${firNumber} - ${accused} (${relation})`);
      } else {
        console.log(`⚠ ${firNumber} - Not found (skipped)`);
      }
    }
    
    client.release();
    
    console.log(`\n✅ DONE! Updated ${updated}/${firExtras.length} FIRs`);
    console.log('🎉 All accused names, relations, and addresses populated in Supabase!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error populating FIRs:', error.message);
    process.exit(1);
  }
}

populateFIRs();
