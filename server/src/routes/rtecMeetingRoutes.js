const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
   createRTECMeeting,
   getRTECMeetings,
   getRTECMeetingById,
   updateRTECMeeting,
   updateMeetingStatus,
   addParticipant,
   confirmParticipant,
   updateMyParticipantStatus,
   getUserMeetings,
   deleteRTECMeeting,
   sendProponentInvitation,
   sendPSTOInvitation,
   getMeetingParticipants,
   removeParticipant,
   getAvailablePSTOUsers,
   sendBulkPSTOInvitations
} = require('../controllers/rtecMeetingController');

// Create RTEC meeting (DOST-MIMAROPA only)
router.post('/create', auth, createRTECMeeting);

// Get all RTEC meetings (DOST-MIMAROPA dashboard)
router.get('/list', auth, getRTECMeetings);

// Get RTEC meeting by ID
router.get('/:meetingId', auth, getRTECMeetingById);

// Update RTEC meeting
router.put('/:meetingId', auth, updateRTECMeeting);

// Update meeting status
router.patch('/:meetingId/status', auth, updateMeetingStatus);

// Add participant to meeting
router.post('/:meetingId/participants', auth, addParticipant);

// Confirm participant attendance
router.patch('/:meetingId/participants/:participantId', auth, confirmParticipant);

// Update participant's own status (accept/decline invitation)
router.patch('/:meetingId/participants/me', auth, updateMyParticipantStatus);

// Get meetings for user (PSTO/Proponent)
router.get('/user/my-meetings', auth, getUserMeetings);

// Delete RTEC meeting
router.delete('/:meetingId', auth, deleteRTECMeeting);

// Send meeting invitation to proponent
router.post('/:meetingId/invite-proponent', auth, sendProponentInvitation);

// Send meeting invitation to PSTO
router.post('/:meetingId/invite-psto', auth, sendPSTOInvitation);

// Send bulk invitations to multiple PSTO users
router.post('/:meetingId/invite-psto-bulk', auth, sendBulkPSTOInvitations);

// Get meeting participants
router.get('/:meetingId/participants', auth, getMeetingParticipants);

// Remove participant from meeting
router.delete('/:meetingId/participants/:participantId', auth, removeParticipant);

// Get available PSTO users for invitation
router.get('/available-psto-users', auth, getAvailablePSTOUsers);

module.exports = router;
