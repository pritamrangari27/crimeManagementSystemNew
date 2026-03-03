const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();
const { initializeDatabase } = require('./utils/dbInitializer');

// Routes
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const criminalsRouter = require('./routes/criminals');
const firsRouter = require('./routes/firs');
const policeRouter = require('./routes/police');
const stationsRouter = require('./routes/stations');
const dashboardRouter = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validate required environment variables in production
if (NODE_ENV === 'production') {
  const requiredVars = ['SESSION_SECRET'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error('❌ FATAL: Missing required environment variables:', missing.join(', '));
    console.error('   - SESSION_SECRET: Strong random string (32+ chars)');
    process.exit(1);
  }
  
  if (!process.env.FRONTEND_URL) {
    console.warn('⚠️  FRONTEND_URL not set. Update after Vercel deployment.');
  }
  console.log('✓ SESSION_SECRET is configured');
}

// SQLite DB setup
const db = new sqlite3.Database('./db_crime.sqlite', async (err) => {
  if (err) {
    console.error('Could not connect to SQLite database', err);
  } else {
    console.log('✓ Connected to SQLite database');
    
    // Initialize database tables and data if needed
    try {
      await initializeDatabase(db);
    } catch (initErr) {
      console.error('Error initializing database:', initErr);
    }
  }
});

// CORS Configuration
const allowedOrigins = NODE_ENV === 'production' 
  ? [
      process.env.FRONTEND_URL,
      'https://crime-management-system-new.vercel.app',
      'https://*.vercel.app'
    ].filter(Boolean)
  : ['http://localhost:3001', 'http://localhost:3000', 'http://localhost:3002', 'http://localhost:3000/'];

// Middleware
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

// CORS middleware with origin checking
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches Vercel pattern
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.includes('vercel.app') ||
                      NODE_ENV !== 'production';
    
    callback(null, isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase request header size limit
app.use((req, res, next) => {
  res.setHeader('Access-Control-Max-Age', '600');
  next();
});

app.set('maxHeaderSize', 25 * 1024 * 1024); // 25MB header limit

// Session configuration
const sessionSecret = process.env.SESSION_SECRET || 'dev_secret_key_only_for_local_use';

if (NODE_ENV === 'development' && sessionSecret === 'dev_secret_key_only_for_local_use') {
  console.warn('⚠️  Using default session secret in development. Set SESSION_SECRET env var for production.');
}

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    sameSite: NODE_ENV === 'production' ? 'lax' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Static files
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.use('/img', express.static(path.join(__dirname, '../Img')));

// Middleware to attach db to requests
app.use((req, res, next) => {
  req.db = db;
  next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/criminals', criminalsRouter);
app.use('/api/firs', firsRouter);
app.use('/api/police', policeRouter);
app.use('/api/stations', stationsRouter);
app.use('/api/dashboard', dashboardRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Crime Management System Backend`);
  console.log(`🔗 Running on http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api\n`);
});

module.exports = app;
