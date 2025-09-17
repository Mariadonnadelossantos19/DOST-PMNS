const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Import controllers
const setupController = require('../controllers/setupController');
const giaController = require('../controllers/giaController');
const cestController = require('../controllers/cestController');
const sscpController = require('../controllers/sscpController');

// Test endpoint for debugging
router.post('/setup/test', upload.any(), (req, res) => {
   console.log('Test endpoint - req.body:', req.body);
   console.log('Test endpoint - req.files:', req.files);
   console.log('Test endpoint - Content-Type:', req.get('Content-Type'));
   res.json({
      success: true,
      body: req.body,
      files: req.files,
      contentType: req.get('Content-Type')
   });
});

// SETUP Program Routes
router.post('/setup/submit', auth, upload.any(), setupController.submitApplication);

router.get('/setup/my-applications', auth, setupController.getMyApplications);
router.get('/setup/:id', auth, setupController.getApplicationById);
router.put('/setup/:id', auth, setupController.updateApplication);
router.put('/setup/:id/status', auth, setupController.updateApplicationStatus);
router.post('/setup/:id/documents', auth, upload.any(), setupController.uploadDocuments);
router.post('/setup/:id/resubmit', auth, setupController.resubmitApplication);
router.get('/setup/:id/download/:fileType', auth, setupController.downloadFile);
router.get('/setup/stats/overview', auth, setupController.getApplicationStats);

// GIA Program Routes
router.post('/gia/submit', auth, upload.fields([
   { name: 'researchProposal', maxCount: 1 },
   { name: 'curriculumVitae', maxCount: 1 },
   { name: 'endorsementLetter', maxCount: 1 }
]), giaController.submitApplication);

router.get('/gia/my-applications', auth, giaController.getMyApplications);
router.get('/gia/:id', auth, giaController.getApplicationById);
router.put('/gia/:id/status', auth, giaController.updateApplicationStatus);
router.get('/gia/:id/download/:fileType', auth, giaController.downloadFile);
router.get('/gia/stats/overview', auth, giaController.getApplicationStats);

// CEST Program Routes
router.post('/cest/submit', auth, upload.fields([
   { name: 'communityProfile', maxCount: 1 },
   { name: 'projectProposal', maxCount: 1 },
   { name: 'partnershipAgreement', maxCount: 1 }
]), cestController.submitApplication);

router.get('/cest/my-applications', auth, cestController.getMyApplications);
router.get('/cest/:id', auth, cestController.getApplicationById);
router.put('/cest/:id/status', auth, cestController.updateApplicationStatus);
router.get('/cest/:id/download/:fileType', auth, cestController.downloadFile);
router.get('/cest/stats/overview', auth, cestController.getApplicationStats);

// SSCP Program Routes
router.post('/sscp/submit', auth, upload.fields([
   { name: 'businessPlan', maxCount: 1 },
   { name: 'financialProjections', maxCount: 1 },
   { name: 'marketAnalysis', maxCount: 1 },
   { name: 'technicalSpecifications', maxCount: 1 }
]), sscpController.submitApplication);

router.get('/sscp/my-applications', auth, sscpController.getMyApplications);
router.get('/sscp/:id', auth, sscpController.getApplicationById);
router.put('/sscp/:id/status', auth, sscpController.updateApplicationStatus);
router.get('/sscp/:id/download/:fileType', auth, sscpController.downloadFile);
router.get('/sscp/stats/overview', auth, sscpController.getApplicationStats);

// PSTO Review Routes (for PSTO users to review applications)
router.get('/psto/applications', auth, setupController.getPSTOApplications);
router.get('/psto/applications/:id', auth, setupController.getPSTOApplicationById);
router.put('/psto/applications/:id/review', auth, setupController.reviewApplication);
router.get('/psto/applications/:id/download/:fileType', auth, setupController.downloadFile);

// Manual fix endpoint for PSTO assignment
router.post('/setup/fix-psto-assignment/:id', setupController.fixPSTOAssignment);

module.exports = router;
