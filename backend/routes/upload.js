const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDirectory = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}_${random}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  const allowedExt = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, GIF, and PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Generic file upload - POST /api/upload
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No file provided' });
  }
  res.json({
    status: 'success',
    message: 'File uploaded successfully',
    data: {
      path: '/uploads/' + req.file.filename,
      filename: req.file.filename
    },
    filename: req.file.filename
  });
});

// Upload photo
router.post('/photo', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'Failed to upload photo' });
  }
  res.json({
    status: 'success',
    message: 'Photo uploaded successfully',
    path: '/uploads/' + req.file.filename,
    filename: req.file.filename
  });
});

// Upload document
router.post('/document', upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'Failed to upload document' });
  }
  res.json({
    status: 'success',
    message: 'Document uploaded successfully',
    path: '/uploads/' + req.file.filename,
    filename: req.file.filename
  });
});

// Upload multiple files
router.post('/multiple', upload.array('files', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ status: 'error', message: 'Failed to upload files' });
  }
  
  const files = req.files.map(file => ({
    path: '/uploads/' + file.filename,
    filename: file.filename
  }));

  res.json({
    status: 'success',
    message: 'Files uploaded successfully',
    files
  });
});

// Error handling middleware
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({ status: 'error', message: 'File size exceeds limit (5MB)' });
    }
    return res.status(400).json({ status: 'error', message: err.message });
  } else if (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
  next();
});

module.exports = router;
