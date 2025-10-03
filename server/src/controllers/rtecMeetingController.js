const RTECMeeting = require('../models/RTECMeeting');
const RTECDocuments = require('../models/RTECDocuments');
const TNA = require('../models/TNA');
const SETUPApplication = require('../models/SETUPApplication');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Create RTEC meeting (only for approved RTEC documents)
const createRTECMeeting = async (req, res) => {
   try {
      const {
         tnaId,
         meetingTitle,
         meetingDescription,
         scheduledDate,
         scheduledTime,
         location,
         meetingType = 'physical',
         virtualMeetingLink,
         virtualMeetingId,
         virtualMeetingPassword,
         participants = [],
         notes
      } = req.body;
      
      const userId = req.user.id;

      console.log('=== CREATE RTEC MEETING DEBUG ===');
      console.log('TNA ID:', tnaId);
      console.log('User ID:', userId);
      console.log('Meeting Title:', meetingTitle);
      console.log('Request body:', req.body);
      console.log('Application ID from body:', req.body.applicationId);
      console.log('Proponent ID from body:', req.body.proponentId);

      // Validate inputs
      if (!mongoose.Types.ObjectId.isValid(tnaId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid TNA ID'
         });
      }

      if (!meetingTitle || !scheduledDate || !scheduledTime || !location) {
         return res.status(400).json({
            success: false,
            message: 'Meeting title, scheduled date, time, and location are required'
         });
      }

      // Find TNA
      const tna = await TNA.findById(tnaId)
         .populate('applicationId')
         .populate('proponentId');

      if (!tna) {
         return res.status(404).json({
            success: false,
            message: 'TNA not found'
         });
      }

      // Check if TNA has approved RTEC documents
      const rtecDocuments = await RTECDocuments.findOne({ tnaId });
      
      if (!rtecDocuments) {
         return res.status(400).json({
            success: false,
            message: 'RTEC documents must be requested and approved before scheduling a meeting'
         });
      }

      if (rtecDocuments.status !== 'documents_approved') {
         return res.status(400).json({
            success: false,
            message: 'RTEC documents must be approved before scheduling a meeting. Current status: ' + rtecDocuments.status
         });
      }

      // Check if meeting already exists for this TNA
      const existingMeeting = await RTECMeeting.findOne({ tnaId });
      if (existingMeeting) {
         return res.status(400).json({
            success: false,
            message: 'RTEC meeting already scheduled for this TNA'
         });
      }

      // Validate scheduled date is in the future
      console.log('Scheduled date from request:', scheduledDate);
      const meetingDate = new Date(scheduledDate);
      const currentDate = new Date();
      console.log('Parsed meeting date:', meetingDate);
      console.log('Current date:', currentDate);
      console.log('Meeting date is valid:', !isNaN(meetingDate.getTime()));
      console.log('Meeting date > current date:', meetingDate > currentDate);
      
      if (isNaN(meetingDate.getTime())) {
         return res.status(400).json({
            success: false,
            message: 'Invalid date format. Please use YYYY-MM-DD format'
         });
      }
      
      // Allow same day meetings but require the time to be in the future
      // Compare just the date part (ignore time for date comparison)
      const selectedDateOnly = new Date(meetingDate.getFullYear(), meetingDate.getMonth(), meetingDate.getDate());
      const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      
      // If it's the same date, allow it (time validation will be handled separately if needed)
      if (selectedDateOnly < currentDateOnly) {
         const selectedDateStr = meetingDate.toLocaleDateString();
         const currentDateStr = currentDate.toLocaleDateString();
         return res.status(400).json({
            success: false,
            message: `Meeting must be scheduled for today or a future date. You selected ${selectedDateStr}, but today is ${currentDateStr}. Please choose today or a future date.`
         });
      }

      // Create RTEC meeting
      const rtecMeeting = new RTECMeeting({
         tnaId: tna._id,
         rtecDocumentsId: rtecDocuments._id,
         applicationId: req.body.applicationId || tna.applicationId._id,
         proponentId: req.body.proponentId || tna.proponentId._id,
         programName: req.body.programName || tna.programName || 'SETUP',
         meetingTitle,
         meetingDescription,
         scheduledDate: meetingDate,
         scheduledTime,
         location,
         scheduledBy: userId,
         meetingType,
         virtualMeetingLink,
         virtualMeetingId,
         virtualMeetingPassword,
         participants,
         notes
      });

      // Add proponent as participant if not already included
      const proponentIncluded = participants.some(p => p.userId.toString() === tna.proponentId._id.toString());
      if (!proponentIncluded) {
         await rtecMeeting.addParticipant(tna.proponentId._id, 'member');
      }

      await rtecMeeting.save();

      // Update TNA status to RTEC scheduled
      await tna.markRTECScheduled(userId);

      // Create notifications for participants
      for (const participant of participants) {
         if (participant.userId) {
            await Notification.createNotification({
               recipientId: participant.userId,
               recipientType: 'psto',
               type: 'rtec_scheduled',
               title: 'RTEC Meeting Scheduled',
               message: `You have been invited to an RTEC meeting for ${tna.applicationId.companyName || tna.applicationId.enterpriseName}`,
               relatedEntityType: 'tna',
               relatedEntityId: tnaId,
               actionUrl: `/rtec-meetings`,
               actionText: 'View Meeting Details',
               priority: 'high',
               sentBy: userId
            });
         }
      }

      // Create notification for proponent
      await Notification.createNotification({
         recipientId: tna.proponentId._id,
         recipientType: 'proponent',
         type: 'rtec_scheduled',
         title: 'RTEC Meeting Scheduled',
         message: `An RTEC meeting has been scheduled for your application: ${tna.applicationId.companyName || tna.applicationId.enterpriseName}`,
         relatedEntityType: 'tna',
         relatedEntityId: tnaId,
         actionUrl: `/rtec-meetings`,
         actionText: 'View Meeting Details',
         priority: 'high',
         sentBy: userId
      });

      console.log('RTEC meeting created successfully');

      res.json({
         success: true,
         message: 'RTEC meeting scheduled successfully',
         data: rtecMeeting
      });

   } catch (error) {
      console.error('Error creating RTEC meeting:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Get RTEC meetings (for DOST-MIMAROPA dashboard)
const getRTECMeetings = async (req, res) => {
   try {
      const { status, page = 1, limit = 10, startDate, endDate } = req.query;
      const userId = req.user.id;

      const query = {};
      
      if (status) {
         query.status = status;
      }

      if (startDate && endDate) {
         query.scheduledDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
         };
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const rtecMeetings = await RTECMeeting.find(query)
         .populate('tnaId', 'scheduledDate location programName status')
         .populate('rtecDocumentsId', 'status requestedAt submittedAt reviewedAt')
         .populate('applicationId', 'enterpriseName companyName projectTitle programName businessActivity')
         .populate('proponentId', 'firstName lastName email')
         .populate('participants.userId', 'firstName lastName email')
         .populate('scheduledBy', 'firstName lastName')
         .sort({ scheduledDate: 1 })
         .skip(skip)
         .limit(limitNum);

      const total = await RTECMeeting.countDocuments(query);

      res.json({
         success: true,
         data: {
            docs: rtecMeetings,
            totalDocs: total,
            limit: limitNum,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum)
         }
      });

   } catch (error) {
      console.error('Error fetching RTEC meetings:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Get RTEC meeting by ID
const getRTECMeetingById = async (req, res) => {
   try {
      const { meetingId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(meetingId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid meeting ID'
         });
      }

      const rtecMeeting = await RTECMeeting.findById(meetingId)
         .populate('tnaId', 'scheduledDate location programName status')
         .populate('rtecDocumentsId', 'status requestedAt submittedAt reviewedAt')
         .populate('applicationId', 'enterpriseName companyName projectTitle programName businessActivity')
         .populate('proponentId', 'firstName lastName email')
         .populate('participants.userId', 'firstName lastName email')
         .populate('scheduledBy', 'firstName lastName');

      if (!rtecMeeting) {
         return res.status(404).json({
            success: false,
            message: 'RTEC meeting not found'
         });
      }

      res.json({
         success: true,
         data: rtecMeeting
      });

   } catch (error) {
      console.error('Error fetching RTEC meeting:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Update RTEC meeting
const updateRTECMeeting = async (req, res) => {
   try {
      const { meetingId } = req.params;
      const updateData = req.body;
      const userId = req.user.id;

      if (!mongoose.Types.ObjectId.isValid(meetingId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid meeting ID'
         });
      }

      const rtecMeeting = await RTECMeeting.findById(meetingId);

      if (!rtecMeeting) {
         return res.status(404).json({
            success: false,
            message: 'RTEC meeting not found'
         });
      }

      // Validate scheduled date if being updated
      if (updateData.scheduledDate) {
         const meetingDate = new Date(updateData.scheduledDate);
         if (meetingDate <= new Date()) {
            return res.status(400).json({
               success: false,
               message: 'Meeting must be scheduled for a future date'
            });
         }
      }

      // Update meeting
      Object.assign(rtecMeeting, updateData);
      await rtecMeeting.save();

      res.json({
         success: true,
         message: 'RTEC meeting updated successfully',
         data: rtecMeeting
      });

   } catch (error) {
      console.error('Error updating RTEC meeting:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Update meeting status
const updateMeetingStatus = async (req, res) => {
   try {
      const { meetingId } = req.params;
      const { status } = req.body;
      const userId = req.user.id;

      if (!mongoose.Types.ObjectId.isValid(meetingId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid meeting ID'
         });
      }

      const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'postponed'];
      if (!validStatuses.includes(status)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
         });
      }

      const rtecMeeting = await RTECMeeting.findById(meetingId);

      if (!rtecMeeting) {
         return res.status(404).json({
            success: false,
            message: 'RTEC meeting not found'
         });
      }

      await rtecMeeting.updateStatus(status);

      res.json({
         success: true,
         message: 'Meeting status updated successfully',
         data: rtecMeeting
      });

   } catch (error) {
      console.error('Error updating meeting status:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Add participant to meeting
const addParticipant = async (req, res) => {
   try {
      const { meetingId } = req.params;
      const { userId: participantId, role = 'member' } = req.body;

      if (!mongoose.Types.ObjectId.isValid(meetingId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid meeting ID'
         });
      }

      if (!mongoose.Types.ObjectId.isValid(participantId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid participant ID'
         });
      }

      const rtecMeeting = await RTECMeeting.findById(meetingId);

      if (!rtecMeeting) {
         return res.status(404).json({
            success: false,
            message: 'RTEC meeting not found'
         });
      }

      await rtecMeeting.addParticipant(participantId, role);

      res.json({
         success: true,
         message: 'Participant added successfully',
         data: rtecMeeting
      });

   } catch (error) {
      console.error('Error adding participant:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Confirm participant attendance
const confirmParticipant = async (req, res) => {
   try {
      const { meetingId, participantId } = req.params;
      const { status = 'confirmed' } = req.body;

      if (!mongoose.Types.ObjectId.isValid(meetingId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid meeting ID'
         });
      }

      if (!mongoose.Types.ObjectId.isValid(participantId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid participant ID'
         });
      }

      const rtecMeeting = await RTECMeeting.findById(meetingId);

      if (!rtecMeeting) {
         return res.status(404).json({
            success: false,
            message: 'RTEC meeting not found'
         });
      }

      await rtecMeeting.confirmParticipant(participantId, status);

      res.json({
         success: true,
         message: 'Participant status updated successfully',
         data: rtecMeeting
      });

   } catch (error) {
      console.error('Error confirming participant:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Get meetings for user (PSTO/Proponent)
const getUserMeetings = async (req, res) => {
   try {
      const userId = req.user.id;
      const { status, page = 1, limit = 10 } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const rtecMeetings = await RTECMeeting.getUserMeetings(userId, { status })
         .skip(skip)
         .limit(limitNum);

      const total = await RTECMeeting.countDocuments({
         $or: [
            { proponentId: userId },
            { 'participants.userId': userId },
            { scheduledBy: userId }
         ]
      });

      res.json({
         success: true,
         data: {
            docs: rtecMeetings,
            totalDocs: total,
            limit: limitNum,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum)
         }
      });

   } catch (error) {
      console.error('Error fetching user meetings:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Send meeting invitation to proponent
const sendProponentInvitation = async (req, res) => {
   try {
      const { meetingId } = req.params;
      const userId = req.user.id;

      if (!mongoose.Types.ObjectId.isValid(meetingId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid meeting ID'
         });
      }

      const rtecMeeting = await RTECMeeting.findById(meetingId)
         .populate('proponentId', 'firstName lastName email')
         .populate('applicationId', 'companyName enterpriseName');

      if (!rtecMeeting) {
         return res.status(404).json({
            success: false,
            message: 'RTEC meeting not found'
         });
      }

      // Add proponent as participant if not already included
      const proponentIncluded = rtecMeeting.participants.some(p => p.userId.toString() === rtecMeeting.proponentId._id.toString());
      if (!proponentIncluded) {
         await rtecMeeting.addParticipant(rtecMeeting.proponentId._id, 'member');
      }

      // Create notification for proponent
      await Notification.createNotification({
         recipientId: rtecMeeting.proponentId._id,
         recipientType: 'proponent',
         type: 'rtec_scheduled',
         title: 'RTEC Meeting Invitation',
         message: `You have been invited to an RTEC meeting for your application: ${rtecMeeting.applicationId.companyName || rtecMeeting.applicationId.enterpriseName}. Meeting scheduled for ${rtecMeeting.scheduledDate.toLocaleDateString()} at ${rtecMeeting.scheduledTime}`,
         relatedEntityType: 'tna',
         relatedEntityId: rtecMeeting.tnaId,
         actionUrl: `/rtec-meetings`,
         actionText: 'View Meeting Details',
         priority: 'high',
         sentBy: userId
      });

      res.json({
         success: true,
         message: 'Meeting invitation sent to proponent successfully',
         data: rtecMeeting
      });

   } catch (error) {
      console.error('Error sending proponent invitation:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Send meeting invitation to PSTO
const sendPSTOInvitation = async (req, res) => {
   try {
      const { meetingId } = req.params;
      const { pstoId } = req.body;
      const userId = req.user.id;

      if (!mongoose.Types.ObjectId.isValid(meetingId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid meeting ID'
         });
      }

      if (!mongoose.Types.ObjectId.isValid(pstoId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid PSTO ID'
         });
      }

      const rtecMeeting = await RTECMeeting.findById(meetingId)
         .populate('applicationId', 'companyName enterpriseName');

      if (!rtecMeeting) {
         return res.status(404).json({
            success: false,
            message: 'RTEC meeting not found'
         });
      }

      // Add PSTO as participant
      await rtecMeeting.addParticipant(pstoId, 'member');

      // Create notification for PSTO
      await Notification.createNotification({
         recipientId: pstoId,
         recipientType: 'psto',
         type: 'rtec_scheduled',
         title: 'RTEC Meeting Invitation',
         message: `You have been invited to an RTEC meeting for application: ${rtecMeeting.applicationId.companyName || rtecMeeting.applicationId.enterpriseName}. Meeting scheduled for ${rtecMeeting.scheduledDate.toLocaleDateString()} at ${rtecMeeting.scheduledTime}`,
         relatedEntityType: 'tna',
         relatedEntityId: rtecMeeting.tnaId,
         actionUrl: `/rtec-meetings`,
         actionText: 'View Meeting Details',
         priority: 'high',
         sentBy: userId
      });

      res.json({
         success: true,
         message: 'Meeting invitation sent to PSTO successfully',
         data: rtecMeeting
      });

   } catch (error) {
      console.error('Error sending PSTO invitation:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Get all participants for a meeting
const getMeetingParticipants = async (req, res) => {
   try {
      const { meetingId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(meetingId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid meeting ID'
         });
      }

      const rtecMeeting = await RTECMeeting.findById(meetingId)
         .populate('participants.userId', 'firstName lastName email role department');

      if (!rtecMeeting) {
         return res.status(404).json({
            success: false,
            message: 'RTEC meeting not found'
         });
      }

      res.json({
         success: true,
         data: rtecMeeting.participants
      });

   } catch (error) {
      console.error('Error fetching meeting participants:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Remove participant from meeting
const removeParticipant = async (req, res) => {
   try {
      const { meetingId, participantId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(meetingId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid meeting ID'
         });
      }

      if (!mongoose.Types.ObjectId.isValid(participantId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid participant ID'
         });
      }

      const rtecMeeting = await RTECMeeting.findById(meetingId);

      if (!rtecMeeting) {
         return res.status(404).json({
            success: false,
            message: 'RTEC meeting not found'
         });
      }

      // Remove participant
      rtecMeeting.participants = rtecMeeting.participants.filter(
         p => p.userId.toString() !== participantId
      );

      await rtecMeeting.save();

      res.json({
         success: true,
         message: 'Participant removed successfully',
         data: rtecMeeting
      });

   } catch (error) {
      console.error('Error removing participant:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Get available PSTO users for invitation
const getAvailablePSTOUsers = async (req, res) => {
   try {
      const pstoUsers = await User.find({ 
         role: 'psto',
         isActive: true 
      }).select('firstName lastName email department');

      res.json({
         success: true,
         data: pstoUsers
      });

   } catch (error) {
      console.error('Error fetching PSTO users:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Send bulk invitations to multiple PSTO users
const sendBulkPSTOInvitations = async (req, res) => {
   try {
      const { meetingId } = req.params;
      const { pstoIds } = req.body;
      const userId = req.user.id;

      if (!mongoose.Types.ObjectId.isValid(meetingId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid meeting ID'
         });
      }

      if (!Array.isArray(pstoIds) || pstoIds.length === 0) {
         return res.status(400).json({
            success: false,
            message: 'PSTO IDs array is required'
         });
      }

      const rtecMeeting = await RTECMeeting.findById(meetingId)
         .populate('applicationId', 'companyName enterpriseName');

      if (!rtecMeeting) {
         return res.status(404).json({
            success: false,
            message: 'RTEC meeting not found'
         });
      }

      const invitations = [];

      for (const pstoId of pstoIds) {
         if (mongoose.Types.ObjectId.isValid(pstoId)) {
            // Add PSTO as participant
            await rtecMeeting.addParticipant(pstoId, 'member');

            // Create notification for PSTO
            const notification = await Notification.createNotification({
               recipientId: pstoId,
               recipientType: 'psto',
               type: 'rtec_scheduled',
               title: 'RTEC Meeting Invitation',
               message: `You have been invited to an RTEC meeting for application: ${rtecMeeting.applicationId.companyName || rtecMeeting.applicationId.enterpriseName}. Meeting scheduled for ${rtecMeeting.scheduledDate.toLocaleDateString()} at ${rtecMeeting.scheduledTime}`,
               relatedEntityType: 'tna',
               relatedEntityId: rtecMeeting.tnaId,
               actionUrl: `/rtec-meetings`,
               actionText: 'View Meeting Details',
               priority: 'high',
               sentBy: userId
            });

            invitations.push(notification);
         }
      }

      res.json({
         success: true,
         message: `Meeting invitations sent to ${invitations.length} PSTO users successfully`,
         data: {
            meeting: rtecMeeting,
            invitationsSent: invitations.length
         }
      });

   } catch (error) {
      console.error('Error sending bulk PSTO invitations:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Delete RTEC meeting
const deleteRTECMeeting = async (req, res) => {
   try {
      const { meetingId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(meetingId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid meeting ID'
         });
      }

      const rtecMeeting = await RTECMeeting.findById(meetingId);

      if (!rtecMeeting) {
         return res.status(404).json({
            success: false,
            message: 'RTEC meeting not found'
         });
      }

      // Only allow deletion if meeting is not completed
      if (rtecMeeting.status === 'completed') {
         return res.status(400).json({
            success: false,
            message: 'Cannot delete completed meetings'
         });
      }

      await RTECMeeting.findByIdAndDelete(meetingId);

      res.json({
         success: true,
         message: 'RTEC meeting deleted successfully'
      });

   } catch (error) {
      console.error('Error deleting RTEC meeting:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

module.exports = {
   createRTECMeeting,
   getRTECMeetings,
   getRTECMeetingById,
   updateRTECMeeting,
   updateMeetingStatus,
   addParticipant,
   confirmParticipant,
   getUserMeetings,
   deleteRTECMeeting,
   sendProponentInvitation,
   sendPSTOInvitation,
   getMeetingParticipants,
   removeParticipant,
   getAvailablePSTOUsers,
   sendBulkPSTOInvitations
};
