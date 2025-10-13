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

// Get RTEC completed applications for refund documents
router.get('/rtec-completed', auth, async (req, res) => {
   try {
      const TNA = require('../models/TNA');
      // Fetch TNAs with any status that indicates they're ready for refund
      const validStatuses = ['rtec_completed', 'rtec_documents_approved', 'dost_mimaropa_approved'];
      const rtecCompletedTNAs = await TNA.find({ status: { $in: validStatuses } })
         .populate('applicationId', 'enterpriseName projectTitle programName')
         .populate('proponentId', 'firstName lastName email')
         .sort({ updatedAt: -1 });
      
      console.log('Found RTEC completed TNAs:', rtecCompletedTNAs.length);
      console.log('Statuses found:', [...new Set(rtecCompletedTNAs.map(tna => tna.status))]);
      
      res.json({
         success: true,
         data: rtecCompletedTNAs
      });
   } catch (error) {
      console.error('Error fetching RTEC completed applications:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
});

// Upload signed TNA report (DOST MIMAROPA)
router.post('/:tnaId/upload-signed-report', auth, upload.single('signedTnaReport'), uploadSignedTNAReport);

// Download signed TNA report
router.get('/:tnaId/download-signed-report', auth, downloadSignedTNAReport);

module.exports = router;