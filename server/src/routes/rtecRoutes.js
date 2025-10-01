const express = require('express');
const router = express.Router();
const rtecController = require('../controllers/rtecController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create RTEC meeting (DOST MIMAROPA)
router.post('/create', auth, rtecController.createRTECMeeting);

// Get RTEC meetings (DOST MIMAROPA)
router.get('/dost-mimaropa', auth, rtecController.getRTECMeetings);

// Get RTEC meetings (PSTO)
router.get('/psto', auth, rtecController.getPSTORtecMeetings);

// Get single RTEC meeting
router.get('/:id', auth, rtecController.getRTECMeeting);

// Send meeting invitation
router.post('/:id/send-invitation', auth, rtecController.sendMeetingInvitation);

// Request proposal submission
router.post('/:id/request-proposal', auth, rtecController.requestProposalSubmission);

// Submit document (PSTO)
router.post('/:id/submit-document', auth, upload.single('file'), rtecController.submitDocument);

// Review document (DOST MIMAROPA)
router.post('/:id/review-document', auth, rtecController.reviewDocument);

// Complete evaluation
router.post('/:id/complete-evaluation', auth, rtecController.completeEvaluation);

// Reschedule meeting
router.put('/:id/reschedule', auth, rtecController.rescheduleMeeting);

// Cancel meeting
router.put('/:id/cancel', auth, rtecController.cancelMeeting);

// Get document status
router.get('/:id/documents', auth, rtecController.getDocumentStatus);

// Get TNAs ready for RTEC scheduling
router.get('/tna/ready-for-rtec', auth, rtecController.getTNAsReadyForRTEC);

// Get RTEC statistics
router.get('/statistics', auth, rtecController.getRTECStatistics);

module.exports = router;
