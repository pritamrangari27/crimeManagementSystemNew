const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { connectDatabase } = require('./utils/database');
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
  if (process.env.DATABASE_URL) {
    console.log('✓ DATABASE_URL is configured (PostgreSQL)');
  } else {
    console.warn('⚠️  DATABASE_URL not set. Using SQLite (data will be ephemeral on Render).');
  }
  console.log('✓ SESSION_SECRET is configured');
}

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
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.includes('vercel.app') ||
                      NODE_ENV !== 'production';
    callback(null, isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Max-Age', '600');
  next();
});

app.set('maxHeaderSize', 25 * 1024 * 1024);

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
    secure: NODE_ENV === 'production',
    httpOnly: true,
    sameSite: NODE_ENV === 'production' ? 'lax' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Static files
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.use('/img', express.static(path.join(__dirname, '../Img')));

// Middleware to attach db to requests (db is set in startServer)
app.use((req, res, next) => {
  req.db = app.locals.db;
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
  res.json({ status: 'OK', message: 'Server is running', database: process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite' });
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

// Initialize database and start server
async function startServer() {
  try {
    const db = await connectDatabase();

    // Initialize database tables and seed data
    await initializeDatabase(db);

    // Store db in app.locals so middleware can access it
    app.locals.db = db;

    app.listen(PORT, () => {
      console.log(`\n🚀 Crime Management System Backend`);
      console.log(`🔗 Running on http://localhost:${PORT}`);
      console.log(`📊 API: http://localhost:${PORT}/api`);
      console.log(`💾 Database: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite'}\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

module.exports = app;
