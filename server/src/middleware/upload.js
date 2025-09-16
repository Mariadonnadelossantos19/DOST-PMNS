const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
   fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, uploadsDir);
   },
   filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
   }
});

// Simple file filter - allow all files for now
const fileFilter = (req, file, cb) => {
   cb(null, true);
};

const upload = multer({
   storage: storage,
   fileFilter: fileFilter,
   limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
      fieldSize: 10 * 1024 * 1024, // 10MB limit for fields
      fieldNameSize: 100,
      fieldValueSize: 10 * 1024 * 1024,
      files: 10 // Maximum 10 files
   }
});

module.exports = upload;