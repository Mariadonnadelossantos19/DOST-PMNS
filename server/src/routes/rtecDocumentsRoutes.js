const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const {
   requestRTECDocuments,
   getRTECDocumentsByTNA,
   getRTECDocumentById,
   submitRTECDocument,
   reviewRTECDocument,
   listRTECDocuments,
   getApprovedRTECDocuments,
   getApprovedRTECDocumentsByPSTO,
   getRTECDocumentsForPSTO,
   serveFile
} = require('../controllers/rtecDocumentsController');

// Configure multer for file uploads
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, 'uploads/');
   },
   filename: function (req, file, cb) {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'rtecDocument-' + uniqueSuffix + path.extname(file.originalname));
   }
});

const fileFilter = (req, file, cb) => {
   // Accept PDF, DOC, DOCX files and text files for text input fields
   const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
   ];
   if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
   } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and text files are allowed.'), false);
   }
};

const upload = multer({
   storage: storage,
   fileFilter: fileFilter,
   limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
   }
});

// DOST-MIMAROPA Routes
// Request RTEC documents from PSTO
router.post('/request/:tnaId', auth, requestRTECDocuments);

// Get all RTEC documents (for DOST-MIMAROPA dashboard)
router.get('/list', auth, listRTECDocuments);

// Get approved RTEC documents (for scheduling meetings)
router.get('/approved', auth, getApprovedRTECDocuments);

// Get approved RTEC documents by PSTO (for batch scheduling)
router.get('/psto/:psto/approved', auth, getApprovedRTECDocumentsByPSTO);

// Get RTEC documents by TNA ID
router.get('/tna/:tnaId', auth, getRTECDocumentsByTNA);

// Get specific RTEC document by ID
router.get('/:id', auth, getRTECDocumentById);

// Review RTEC document (approve/reject)
router.post('/review/:tnaId', auth, reviewRTECDocument);

// PSTO Routes
// Get RTEC documents for PSTO
router.get('/psto/list', auth, getRTECDocumentsForPSTO);

// Submit RTEC document
router.post('/submit/:tnaId', auth, upload.single('document'), submitRTECDocument);

// Serve RTEC document file
router.get('/serve/:tnaId/:documentType', auth, serveFile);

module.exports = router;
