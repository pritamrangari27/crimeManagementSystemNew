const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');

// Routes
const authRouter = require('./routes/auth');
const criminalsRouter = require('./routes/criminals');
const firsRouter = require('./routes/firs');
const policeRouter = require('./routes/police');
const stationsRouter = require('./routes/stations');
const uploadRouter = require('./routes/upload');
const dashboardRouter = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

// SQLite DB setup
const db = new sqlite3.Database('./db_crime.sqlite', (err) => {
  if (err) {
    console.error('Could not connect to SQLite database', err);
  } else {
    console.log('✓ Connected to SQLite database');
  }
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000', 'http://localhost:3002'],
  credentials: true
}));

// Increase request header size limit
app.use((req, res, next) => {
  res.setHeader('Access-Control-Max-Age', '600');
  next();
});

app.set('maxHeaderSize', 25 * 1024 * 1024); // 25MB header limit

// Session configuration
app.use(session({
  secret: 'crime_management_secret_key_2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Static files
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/img', express.static(path.join(__dirname, '../Img')));

// Middleware to attach db to requests
app.use((req, res, next) => {
  req.db = db;
  next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/criminals', criminalsRouter);
app.use('/api/firs', firsRouter);
app.use('/api/police', policeRouter);
app.use('/api/stations', stationsRouter);
app.use('/api/upload', uploadRouter);
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
