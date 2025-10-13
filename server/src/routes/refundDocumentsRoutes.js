const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const {
   requestRefundDocuments,
   getRefundDocumentsByTNA,
   getRefundDocumentById,
   submitRefundDocument,
   reviewRefundDocument,
   listRefundDocuments,
   getApprovedRefundDocuments,
   getRefundDocumentsForPSTO,
   completeRefund
} = require('../controllers/refundDocumentsController');

// Configure multer for file uploads
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, 'uploads/');
   },
   filename: function (req, file, cb) {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'refundDocument-' + uniqueSuffix + path.extname(file.originalname));
   }
});

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
// Request refund documents from PSTO
router.post('/request/:tnaId', auth, requestRefundDocuments);

// Get all refund documents (for DOST-MIMAROPA dashboard)
router.get('/list', auth, listRefundDocuments);

// Get approved refund documents
router.get('/approved', auth, getApprovedRefundDocuments);

// Get refund documents by TNA ID
router.get('/tna/:tnaId', auth, getRefundDocumentsByTNA);

// Get refund document by ID
router.get('/:id', auth, getRefundDocumentById);

// Review refund document (approve/reject)
router.post('/review/:tnaId', auth, reviewRefundDocument);

// Complete refund process
router.post('/complete/:tnaId', auth, completeRefund);

// PSTO Routes
// Get refund documents for PSTO
router.get('/psto/list', auth, getRefundDocumentsForPSTO);

// Submit refund document
router.post('/submit/:tnaId', auth, upload.single('document'), submitRefundDocument);

module.exports = router;
