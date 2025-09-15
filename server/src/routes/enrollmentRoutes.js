const express = require('express');
const router = express.Router();
const {
   getAllEnrollments,
   getEnrollmentById,
   createEnrollment,
   updateEnrollment,
   deleteEnrollment,
   getEnrollmentStats,
   getEnrollmentsForProponent
} = require('../controllers/enrollmentController');

// Test endpoint
router.get('/test', (req, res) => {
   res.json({ success: true, message: 'Enrollment API is working' });
});

// Enrollment management routes
router.get('/', getAllEnrollments);
router.get('/stats', getEnrollmentStats);
router.get('/proponent/:proponentId', getEnrollmentsForProponent);
router.get('/:id', getEnrollmentById);
router.post('/create', createEnrollment);
router.put('/:id', updateEnrollment);
router.delete('/:id', deleteEnrollment);

module.exports = router;