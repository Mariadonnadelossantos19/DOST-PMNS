const express = require('express');
const router = express.Router();
const { 
   scheduleTNA, 
   getTNAList, 
   getTNADetails, 
   updateTNAStatus, 
   uploadTNAReport,
   submitTNAReportToDostMimaropa,
   getTNAReportsForDostMimaropa,
   reviewTNAReport
} = require('../controllers/tnaController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// TNA management routes
router.post('/schedule', auth, scheduleTNA);
router.get('/list', auth, getTNAList);
router.get('/:tnaId', auth, getTNADetails);
router.patch('/:tnaId/status', auth, updateTNAStatus);
router.post('/upload-report', auth, upload.single('reportFile'), uploadTNAReport);

// TNA report submission to DOST MIMAROPA
router.post('/:tnaId/submit-to-dost', auth, submitTNAReportToDostMimaropa);

// DOST MIMAROPA TNA report review routes
router.get('/dost-mimaropa/reports', auth, getTNAReportsForDostMimaropa);
router.patch('/:tnaId/dost-mimaropa/review', auth, reviewTNAReport);

router.get('/:tnaId/download-report', auth, (req, res) => {
   // This will be handled by the TNA controller
   res.json({ message: 'Download TNA report endpoint' });
});

module.exports = router;
