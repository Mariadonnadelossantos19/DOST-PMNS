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

// File filter
const fileFilter = (req, file, cb) => {
   // Allow common document types
   const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
   const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
   const mimetype = allowedTypes.test(file.mimetype);

   if (mimetype && extname) {
      return cb(null, true);
   } else {
      cb(new Error('Only documents (PDF, DOC, DOCX, TXT) and images (JPEG, PNG, GIF) are allowed'));
   }
};

const upload = multer({
   storage: storage,
   fileFilter: fileFilter,
   limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
   }
});

module.exports = upload;
