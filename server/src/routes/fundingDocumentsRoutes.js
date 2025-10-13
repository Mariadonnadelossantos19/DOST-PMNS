const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const {
   requestFundingDocuments,
   getFundingDocumentsByTNA,
   getFundingDocumentById,
   submitFundingDocument,
   reviewFundingDocument,
   listFundingDocuments,
   getApprovedFundingDocuments,
   getFundingDocumentsForPSTO,
   completeFunding,
   serveFile,
   updateFundingDocumentsWithRTECData
} = require('../controllers/fundingDocumentsController');

// Configure multer for file uploads - Store in memory for database storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
   // Accept PDF, DOC, DOCX files
   const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
   if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
   } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
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
// Request funding documents from PSTO
router.post('/request/:tnaId', auth, requestFundingDocuments);

// Get all funding documents (for DOST-MIMAROPA dashboard)
router.get('/list', auth, listFundingDocuments);

// Get approved funding documents
router.get('/approved', auth, getApprovedFundingDocuments);

// Get funding documents by TNA ID
router.get('/tna/:tnaId', auth, getFundingDocumentsByTNA);

// Get funding document by ID
router.get('/:id', auth, getFundingDocumentById);

// Review funding document (approve/reject)
router.post('/review/:tnaId', auth, reviewFundingDocument);

// Complete funding process
router.post('/complete/:tnaId', auth, completeFunding);

// PSTO Routes
// Get funding documents for PSTO
router.get('/psto/list', auth, getFundingDocumentsForPSTO);

// Submit funding document
router.post('/submit/:tnaId', auth, upload.single('document'), submitFundingDocument);

// File serving route - serves files from database (no auth required for file viewing)
router.get('/file/:tnaId/:documentType', serveFile);

// Update existing funding documents with RTEC data
router.post('/update-with-rtec-data', auth, updateFundingDocumentsWithRTECData);

module.exports = router;
