const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
   scheduleTNA,
   listTNAs,
   markTNAAsCompleted,
   markTNAAsInProgress,
   uploadTNAReport,
   downloadTNAReport,
   forwardTNAToDostMimaropa,
   getTNAReportsForDostMimaropa,
   reviewTNAReport,
   getApprovedTNAs,
   uploadSignedTNAReport,
   downloadSignedTNAReport
} = require('../controllers/tnaController');

// Schedule TNA
router.post('/schedule', auth, scheduleTNA);

// List TNAs
router.get('/list', auth, listTNAs);

// Mark TNA as completed
router.put('/:id/mark-completed', auth, markTNAAsCompleted);

// Mark TNA as in progress
router.put('/:id/mark-in-progress', auth, markTNAAsInProgress);

// Upload TNA report
router.post('/upload-report', auth, upload.single('reportFile'), uploadTNAReport);

// Download TNA report
router.get('/:tnaId/download-report', auth, downloadTNAReport);

// Forward TNA to DOST MIMAROPA
router.post('/:tnaId/forward-to-dost-mimaropa', auth, forwardTNAToDostMimaropa);

// Get TNA reports for DOST MIMAROPA
router.get('/dost-mimaropa/reports', auth, getTNAReportsForDostMimaropa);

// Review TNA report (DOST MIMAROPA)
router.patch('/:tnaId/dost-mimaropa/review', auth, reviewTNAReport);

// Get approved TNAs for DOST MIMAROPA
router.get('/dost-mimaropa/approved', auth, getApprovedTNAs);

// Upload signed TNA report (DOST MIMAROPA)
router.post('/:tnaId/upload-signed-report', auth, upload.single('signedTnaReport'), uploadSignedTNAReport);

// Download signed TNA report
router.get('/:tnaId/download-signed-report', auth, downloadSignedTNAReport);

module.exports = router;