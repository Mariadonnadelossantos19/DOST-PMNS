const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
   getAllEnrollments,
   getEnrollmentById,
   createEnrollment,
   updateEnrollment,
   updateStageStatus,
   deleteEnrollment,
   getEnrollmentStats,
   getServiceOptions,
   submitTnaEnrollment,
   reviewTnaEnrollment,
   getTnaEnrollmentsForReview
} = require('../controllers/enrollmentController');

// Test endpoint
router.get('/test', (req, res) => {
   res.json({ success: true, message: 'Enrollment API is working' });
});

// Test review endpoint
router.post('/test-review', (req, res) => {
   console.log('Test review request:', req.body);
   res.json({ success: true, message: 'Test review endpoint working', data: req.body });
});

// Enrollment management routes
router.get('/', getAllEnrollments);
router.get('/stats', getEnrollmentStats);
router.get('/service-options', getServiceOptions);
router.get('/:id', getEnrollmentById);
router.post('/create', createEnrollment);
router.put('/:id', updateEnrollment);
router.patch('/:id/stage', updateStageStatus);
router.delete('/:id', deleteEnrollment);

// TNA workflow routes
router.post('/:id/submit-tna', upload.fields([
   { name: 'letterOfIntent', maxCount: 1 },
   { name: 'dostTnaForm', maxCount: 1 },
   { name: 'enterpriseProfile', maxCount: 1 }
]), submitTnaEnrollment);
router.post('/:id/review-tna', reviewTnaEnrollment);
router.get('/tna/for-review', getTnaEnrollmentsForReview);

module.exports = router;
