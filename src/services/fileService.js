// src/services/fileService.js
const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB
  fileFilter: (req, file, cb) => { 
    checkFileType(file, cb);
  }
}).single('file'); // Accept a single file with the field name 'file'

function checkFileType(file, cb) {
    // Define allowed file extensions and MIME types
    const allowedExts = ['.pdf', '.docx', '.txt'];
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'application/msword', // for older DOC files
    ];
  
    // Get the file extension and MIME type
    const extname = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;
  
    // Check if the file extension and MIME type are allowed
    if (allowedExts.includes(extname) && allowedMimes.includes(mimetype)) {
      return cb(null, true);
    } else {
      cb('Error: Only PDF, DOCX, and TXT files are allowed!');
    }
  }

module.exports = upload;
