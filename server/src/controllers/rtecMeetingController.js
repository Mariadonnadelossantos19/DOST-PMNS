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
      
      console.log('🔍 RTEC Documents found:', {
         found: !!rtecDocuments,
         rtecDocumentsId: rtecDocuments?._id,
         status: rtecDocuments?.status,
         tnaId: rtecDocuments?.tnaId
      });
      
      if (!rtecDocuments) {
         console.log('❌ No RTEC documents found for TNA:', tnaId);
         return res.status(400).json({
            success: false,
            message: 'RTEC documents must be requested and approved before scheduling a meeting'
         });
      }

      if (rtecDocuments.status !== 'documents_approved') {
         console.log('❌ RTEC documents not approved. Status:', rtecDocuments.status);
         return res.status(400).json({
            success: false,
            message: 'RTEC documents must be approved before scheduling a meeting. Current status: ' + rtecDocuments.status
         });
      }

      // Check if meeting already exists for this TNA
      console.log('🔍 Checking for existing meeting for TNA:', tnaId);
      console.log('🔍 TNA ID type:', typeof tnaId);
      
      const existingMeeting = await RTECMeeting.findOne({ tnaId });
      console.log('🔍 Existing meeting found:', existingMeeting ? 'Yes' : 'No');
      
      if (existingMeeting) {
         console.log('🔍 EXISTING MEETING DETAILS:', {
            id: existingMeeting._id,
            status: existingMeeting.status,
            title: existingMeeting.meetingTitle,
            tnaId: existingMeeting.tnaId,
            applicationName: existingMeeting.applicationId?.enterpriseName || existingMeeting.applicationId?.companyName
         });
      }
      
      // Also check all meetings to see what's in the database
      const allMeetings = await RTECMeeting.find({}).select('_id tnaId meetingTitle status applicationId');
      console.log('🔍 All meetings in database:');
      allMeetings.forEach((meeting, index) => {
         console.log(`Meeting ${index + 1}:`, {
            id: meeting._id,
            tnaId: meeting.tnaId,
            tnaIdType: typeof meeting.tnaId,
            title: meeting.meetingTitle,
            status: meeting.status,
            applicationName: meeting.applicationId?.enterpriseName || meeting.applicationId?.companyName
         });
      });
      
      // Check specifically for meetings with the same TNA ID
      const meetingsForThisTNA = await RTECMeeting.find({ tnaId }).select('_id status meetingTitle applicationId');
      console.log('🔍 Meetings for this specific TNA:', meetingsForThisTNA.length);
      meetingsForThisTNA.forEach((meeting, index) => {
         console.log(`TNA Meeting ${index + 1}:`, {
            id: meeting._id,
            status: meeting.status,
            title: meeting.meetingTitle,
            applicationName: meeting.applicationId?.enterpriseName || meeting.applicationId?.companyName
         });
      });
      
      if (existingMeeting) {
         console.log('🔍 Existing meeting details:', {
            id: existingMeeting._id,
            status: existingMeeting.status,
            meetingTitle: existingMeeting.meetingTitle,
            scheduledDate: existingMeeting.scheduledDate
         });
         
         // Allow creating new meeting only if existing meeting is in revision_requested status
         if (existingMeeting.status === 'rtec_revision_requested') {
            console.log('🔄 Existing meeting is in revision_requested status, allowing new meeting creation');
         } else {
            console.log('❌ Meeting already exists for this TNA with status:', existingMeeting.status);
            return res.status(400).json({
               success: false,
               message: `A meeting has already been scheduled for this application. Please check the meetings list. Current meeting status: ${existingMeeting.status}. You can update the existing meeting or complete it before scheduling a new one.`
            });
         }
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

      console.log('🔍 Creating RTEC meeting with data:', {
         tnaId: tna._id,
         rtecDocumentsId: rtecDocuments._id,
         applicationId: req.body.applicationId || tna.applicationId._id,
         proponentId: req.body.proponentId || tna.proponentId._id,
         meetingTitle,
         status: 'scheduled'
      });

      // Add proponent as participant if not already included
      const proponentIncluded = participants.some(p => p.userId.toString() === tna.proponentId._id.toString());
      if (!proponentIncluded) {
         await rtecMeeting.addParticipant(tna.proponentId._id, 'member');
      }

      const savedMeeting = await rtecMeeting.save();

      console.log('🔍 RTEC meeting saved successfully:', {
         meetingId: savedMeeting._id,
         tnaId: savedMeeting.tnaId,
         rtecDocumentsId: savedMeeting.rtecDocumentsId,
         status: savedMeeting.status
      });

      // Verify the meeting was actually saved
      if (!savedMeeting._id) {
         console.error('❌ Meeting save failed - no ID returned');
         return res.status(500).json({
            success: false,
            message: 'Failed to save meeting'
         });
      }

      // Update TNA status to RTEC scheduled ONLY after meeting is successfully saved
      try {
         await tna.markRTECScheduled(userId);
         console.log('✅ TNA status updated to rtec_scheduled');
      } catch (tnaError) {
         console.error('❌ Error updating TNA status:', tnaError);
         // Don't fail the entire operation if TNA status update fails
      }

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

      console.log('🔍 RTEC MEETINGS API DEBUG:');
      console.log('Query:', query);
      console.log('Total meetings in database:', total);
      console.log('Returned meetings:', rtecMeetings.length);
      console.log('Meetings by status:', rtecMeetings.reduce((acc, meeting) => {
         acc[meeting.status] = (acc[meeting.status] || 0) + 1;
         return acc;
      }, {}));
      console.log('Meeting details:', rtecMeetings.map(m => ({
         id: m._id,
         title: m.meetingTitle,
         status: m.status,
         applicationName: m.applicationId?.enterpriseName || m.applicationId?.companyName
      })));

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

// Update participant's own status (for participants to accept/decline)
const updateMyParticipantStatus = async (req, res) => {
   try {
      console.log('🚀 UPDATE PARTICIPANT STATUS - FUNCTION CALLED');
      console.log('🔍 UPDATE PARTICIPANT STATUS - Starting...');
      console.log('🔍 REQUEST BODY:', req.body);
      console.log('🔍 REQUEST PARAMS:', req.params);
      console.log('🔍 REQUEST USER:', req.user);
      const { meetingId } = req.params;
      const { status } = req.body;
      const userId = req.user.id;

      console.log('🔍 Meeting ID:', meetingId);
      console.log('🔍 User ID:', userId);
      console.log('🔍 Status:', status);

      if (!mongoose.Types.ObjectId.isValid(meetingId)) {
         console.log('❌ Invalid meeting ID');
         return res.status(400).json({
            success: false,
            message: 'Invalid meeting ID'
         });
      }

      if (!['confirmed', 'declined'].includes(status)) {
         console.log('❌ Invalid status:', status);
         return res.status(400).json({
            success: false,
            message: 'Invalid status. Must be "confirmed" or "declined"'
         });
      }

      console.log('🔍 Finding meeting...');
      const rtecMeeting = await RTECMeeting.findById(meetingId);

      if (!rtecMeeting) {
         console.log('❌ Meeting not found');
         return res.status(404).json({
            success: false,
            message: 'RTEC meeting not found'
         });
      }

      console.log('🔍 Meeting found:', rtecMeeting.meetingTitle);
      console.log('🔍 Participants:', rtecMeeting.participants.length);

      // Find participant - handle both populated and non-populated userId
      console.log('🔍 All participants:', rtecMeeting.participants.map(p => ({
         userId: p.userId,
         userId_id: p.userId?._id,
         userId_string: p.userId?.toString(),
         status: p.status
      })));
      
      // Find participant using multiple comparison methods
      const participant = rtecMeeting.participants.find(p => {
         // Try multiple comparison methods
         const participantId1 = p.userId._id?.toString();
         const participantId2 = p.userId?.toString();
         const participantId3 = p.userId?.id?.toString();
         const currentUserId = userId.toString();
         
         console.log('🔍 Comparing:', {
            participantId1,
            participantId2,
            participantId3,
            currentUserId,
            match1: participantId1 === currentUserId,
            match2: participantId2 === currentUserId,
            match3: participantId3 === currentUserId
         });
         
         return participantId1 === currentUserId || participantId2 === currentUserId || participantId3 === currentUserId;
      });
      
      console.log('🔍 Participant found:', participant ? 'YES' : 'NO');
      
      if (!participant) {
         console.log('❌ User not found in participants');
         console.log('🔍 Current user ID:', userId);
         console.log('🔍 Current user ID type:', typeof userId);
         console.log('🔍 Available participants:', rtecMeeting.participants.map(p => ({
            userId: p.userId,
            userId_id: p.userId?._id,
            userId_string: p.userId?.toString(),
            userId_type: typeof p.userId,
            status: p.status
         })));
         console.log('🔍 Meeting ID:', meetingId);
         console.log('🔍 Meeting title:', rtecMeeting.meetingTitle);
         console.log('🔍 Meeting participants count:', rtecMeeting.participants.length);
         return res.status(404).json({
            success: false,
            message: 'You are not a participant in this meeting. Please ensure you were properly invited to this meeting.',
            debug: {
               userId: userId,
               participantsCount: rtecMeeting.participants.length,
               meetingId: meetingId
            }
         });
      }

      console.log('🔍 Participant found:', {
         userId: participant.userId,
         currentStatus: participant.status,
         newStatus: status
      });

      // FIRST: Validate and fix all participant statuses BEFORE any operations
      console.log('🔍 Validating all participant statuses FIRST...');
      const fixedCount = rtecMeeting.validateParticipantStatuses();
      if (fixedCount > 0) {
         console.log(`🔧 Fixed ${fixedCount} invalid participant statuses`);
      }
      
      // THEN: Update participant status
      participant.status = status;
      participant.respondedAt = new Date();
      
      console.log('🔍 Saving meeting...');
      await rtecMeeting.save();

      console.log('✅ Participant status updated successfully');

      res.json({
         success: true,
         message: `Meeting invitation ${status} successfully`,
         data: rtecMeeting
      });

   } catch (error) {
      console.error('💥 Error updating participant status:', error);
      console.error('💥 Error stack:', error.stack);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Resend invitation to participant
const resendInvitation = async (req, res) => {
   try {
      console.log('=== RESEND INVITATION DEBUG ===');
      const { meetingId } = req.params;
      const { participantId } = req.body;
      const userId = req.user.id;

      console.log('Meeting ID:', meetingId);
      console.log('Participant ID:', participantId);
      console.log('User ID:', userId);

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

      const rtecMeeting = await RTECMeeting.findById(meetingId)
         .populate('proponentId', 'firstName lastName email')
         .populate('applicationId', 'companyName enterpriseName');

      if (!rtecMeeting) {
         console.log('❌ RTEC meeting not found');
         return res.status(404).json({
            success: false,
            message: 'RTEC meeting not found'
         });
      }

      console.log('✅ RTEC meeting found:', rtecMeeting.meetingTitle);
      console.log('Participants count:', rtecMeeting.participants.length);
      console.log('All participants:', rtecMeeting.participants.map(p => ({
         userId: p.userId,
         userId_id: p.userId?._id,
         status: p.status
      })));

      // Find participant - handle both populated and non-populated userId
      console.log('🔍 Finding participant with ID:', participantId);
      console.log('🔍 Available participants:', rtecMeeting.participants.map(p => ({
         userId: p.userId,
         userId_id: p.userId?._id,
         userId_string: p.userId?.toString(),
         status: p.status
      })));
      
      const participant = rtecMeeting.participants.find(p => {
         const participantUserId1 = p.userId._id?.toString();
         const participantUserId2 = p.userId?.toString();
         const participantUserId3 = p.userId?.id?.toString();
         const participantUserId = participantUserId1 || participantUserId2 || participantUserId3;
         
         console.log('🔍 Comparing participant:', {
            participantUserId1,
            participantUserId2,
            participantUserId3,
            participantUserId,
            participantId,
            match1: participantUserId1 === participantId,
            match2: participantUserId2 === participantId,
            match3: participantUserId3 === participantId,
            finalMatch: participantUserId === participantId
         });
         return participantUserId === participantId;
      });
      
      if (!participant) {
         console.log('❌ Participant not found');
         return res.status(404).json({
            success: false,
            message: 'Participant not found in this meeting'
         });
      }

      console.log('✅ Participant found:', {
         userId: participant.userId,
         status: participant.status
      });

      // FIRST: Validate and fix all participant statuses BEFORE any operations
      console.log('🔍 Validating all participant statuses FIRST...');
      const fixedCount = rtecMeeting.validateParticipantStatuses();
      if (fixedCount > 0) {
         console.log(`🔧 Fixed ${fixedCount} invalid participant statuses`);
      }
      
      // THEN: Use the model's resend invitation method
      console.log('🔍 Using RTECMeeting.resendInvitation method...');
      await rtecMeeting.resendInvitation(participantId);
      
      // Create notification for the participant about the resent invitation
      console.log('🔍 Creating notification for resent invitation...');
      const participantUser = await User.findById(participantId);
      const recipientType = participantUser?.role === 'proponent' ? 'proponent' : 'psto';
      
      await Notification.createNotification({
         recipientId: participantId,
         recipientType: recipientType,
         type: 'rtec_scheduled',
         title: 'RTEC Meeting Invitation (Resent)',
         message: `You have been re-invited to an RTEC meeting for application: ${rtecMeeting.applicationId.companyName || rtecMeeting.applicationId.enterpriseName}. Meeting scheduled for ${rtecMeeting.scheduledDate.toLocaleDateString()} at ${rtecMeeting.scheduledTime}`,
         relatedEntityType: 'tna',
         relatedEntityId: rtecMeeting.tnaId,
         actionUrl: `/rtec-meetings`,
         actionText: 'View Meeting Details',
         priority: 'high',
         sentBy: userId
      });
      
      console.log('✅ Resend invitation completed successfully');
      console.log('✅ Notification created for participant');
      console.log('✅ Participant will see the resent invitation in their interface');

      res.json({
         success: true,
         message: 'Invitation resent successfully',
         data: rtecMeeting
      });

   } catch (error) {
      console.error('💥 RESEND INVITATION ERROR:', error);
      console.error('💥 Error name:', error.name);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error stack:', error.stack);
      
      // Handle specific error types
      if (error.name === 'ValidationError') {
         return res.status(400).json({
            success: false,
            message: 'Database validation error',
            error: error.message,
            details: error.errors
         });
      }
      
      if (error.name === 'CastError') {
         return res.status(400).json({
            success: false,
            message: 'Invalid ID format',
            error: error.message
         });
      }
      
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message,
         details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
   }
};

// Get meetings for user (PSTO/Proponent)
const getUserMeetings = async (req, res) => {
   try {
      console.log('🔍 GET USER MEETINGS - Starting...');
      const userId = req.user.id;
      const { status, page = 1, limit = 10 } = req.query;
      
      console.log('🔍 User ID:', userId);
      console.log('🔍 User role:', req.user.role);
      console.log('🔍 Query params:', { status, page, limit });

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;
      
      console.log('🔍 Pagination:', { pageNum, limitNum, skip });

      console.log('🔍 Calling RTECMeeting.getUserMeetings...');
      
      // Use direct query instead of static method to avoid population issues
      const query = {
         $or: [
            { proponentId: userId },
            { 'participants.userId': userId },
            { scheduledBy: userId }
         ]
      };
      
      if (status) {
         query.status = status;
      }
      
      console.log('🔍 Query:', JSON.stringify(query, null, 2));
      
      const rtecMeetings = await RTECMeeting.find(query)
         .populate('applicationId', 'enterpriseName companyName projectTitle programName businessActivity')
         .populate('proponentId', 'firstName lastName email')
         .populate('participants.userId', 'firstName lastName email')
         .populate('scheduledBy', 'firstName lastName')
         .sort({ scheduledDate: 1 })
         .skip(skip)
         .limit(limitNum);
      
      console.log('📊 Found meetings:', rtecMeetings.length);

      console.log('🔍 Counting total meetings...');
      const total = await RTECMeeting.countDocuments(query);
      
      console.log('📈 Total count:', total);

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
      console.error('💥 Error fetching user meetings:', error);
      console.error('💥 Error stack:', error.stack);
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
      console.log('🔍 Adding PSTO as participant:', pstoId);
      await rtecMeeting.addParticipant(pstoId, 'member');
      console.log('✅ PSTO added as participant successfully');
      console.log('🔍 Meeting participants after adding:', rtecMeeting.participants.map(p => ({
         userId: p.userId,
         role: p.role,
         status: p.status
      })));

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
      console.log('=== FETCHING AVAILABLE PSTO USERS ===');
      console.log('Request user:', req.user);
      console.log('Request method:', req.method);
      console.log('Request URL:', req.url);
      
      const pstoUsers = await User.find({ 
         role: 'psto',
         status: 'active'
      }).select('firstName lastName email department province');

      console.log('Found PSTO users:', pstoUsers.length);
      console.log('PSTO users:', pstoUsers);

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
            console.log('🔍 Adding PSTO as participant (bulk):', pstoId);
            await rtecMeeting.addParticipant(pstoId, 'member');
            console.log('✅ PSTO added as participant successfully (bulk)');

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

// Complete RTEC process
const completeRTEC = async (req, res) => {
   try {
      const { meetingId } = req.params;
      const { evaluationData } = req.body;
      const userId = req.user.id;

      console.log('=== COMPLETE RTEC DEBUG ===');
      console.log('Meeting ID:', meetingId);
      console.log('User ID:', userId);
      console.log('Evaluation Data:', evaluationData);
      console.log('Request Body:', req.body);
      console.log('Request Params:', req.params);

      // Validate evaluation data if provided
      if (evaluationData) {
         console.log('🔍 Validating evaluation data...');
         console.log('🔍 Evaluation outcome:', evaluationData.evaluationOutcome);
         console.log('🔍 Evaluation comment:', evaluationData.evaluationComment);
         console.log('🔍 Documents to revise:', evaluationData.documentsToRevise);
         console.log('🔍 Available documents:', evaluationData.availableDocuments);
         
         if (evaluationData.evaluationOutcome && !['with revision', 'approved', 'endorsed for approval (with comment)'].includes(evaluationData.evaluationOutcome)) {
            console.log('❌ Invalid evaluation outcome:', evaluationData.evaluationOutcome);
            return res.status(400).json({
               success: false,
               message: 'Invalid evaluation outcome. Must be "with revision", "approved", or "endorsed for approval (with comment)"'
            });
         }
         
         // Check if evaluation outcome is provided
         if (!evaluationData.evaluationOutcome) {
            console.log('❌ Missing evaluation outcome');
            return res.status(400).json({
               success: false,
               message: 'Evaluation outcome is required'
            });
         }
         
         console.log('✅ Evaluation data validation passed');
      }

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

      // Debug current meeting status
      console.log('🔍 Current meeting status:', rtecMeeting.status);
      console.log('🔍 Meeting details:', {
         id: rtecMeeting._id,
         status: rtecMeeting.status,
         title: rtecMeeting.meetingTitle,
         scheduledDate: rtecMeeting.scheduledDate,
         participants: rtecMeeting.participants?.length || 0
      });

      // Check if meeting is completed or can be auto-completed
      if (rtecMeeting.status === 'confirmed') {
         console.log('🔄 Auto-completing meeting from confirmed status...');
         rtecMeeting.status = 'completed';
         rtecMeeting.completedAt = new Date();
         rtecMeeting.completedBy = userId;
         await rtecMeeting.save();
         console.log('✅ Meeting auto-completed successfully');
      } else if (rtecMeeting.status !== 'completed' && rtecMeeting.status !== 'rtec_completed' && rtecMeeting.status !== 'rtec_revision_requested' && rtecMeeting.status !== 'rtec_endorsed_for_approval') {
         return res.status(400).json({
            success: false,
            message: `Meeting must be completed before finalizing RTEC. Current status: ${rtecMeeting.status}. Please update the meeting status to 'completed' first.`
         });
      }

      // Check if RTEC is already completed - but allow evaluation if it's for revision
      if (rtecMeeting.rtecCompleted || rtecMeeting.status === 'rtec_completed') {
         // Allow evaluation if it's for revision purposes
         if (evaluationData && evaluationData.evaluationOutcome === 'with revision') {
            console.log('🔄 Allowing RTEC evaluation for revision purposes');
         } else {
            return res.status(400).json({
               success: false,
               message: 'RTEC has already been completed for this meeting',
               data: {
                  meeting: rtecMeeting,
                  rtecCompleted: true,
                  completedAt: rtecMeeting.rtecCompletedAt
               }
            });
         }
      }

      // Prepare update data based on evaluation outcome
      let updateData = {
         rtecCompletedAt: new Date(),
         rtecCompletedBy: userId
      };

      // Add evaluation data if provided
      if (evaluationData) {
         updateData.evaluationOutcome = evaluationData.evaluationOutcome;
         updateData.evaluationComment = evaluationData.evaluationComment;
         updateData.recommendations = evaluationData.recommendations;
         updateData.nextSteps = evaluationData.nextSteps;
         
         // Set completion status based on outcome
         if (evaluationData.evaluationOutcome === 'with revision') {
            updateData.rtecCompleted = false;
            updateData.status = 'rtec_revision_requested';
         } else if (evaluationData.evaluationOutcome === 'approved') {
            updateData.rtecCompleted = true;
            updateData.status = 'rtec_completed';
         } else if (evaluationData.evaluationOutcome === 'endorsed for approval (with comment)') {
            updateData.rtecCompleted = false;
            updateData.status = 'rtec_endorsed_for_approval';
         }
      } else {
         // Default to completed if no evaluation data
         updateData.rtecCompleted = true;
         updateData.status = 'rtec_completed';
      }

      // Update meeting with appropriate status
      const updatedMeeting = await RTECMeeting.findByIdAndUpdate(
         meetingId,
         updateData,
         { new: true }
      );

      // Handle different evaluation outcomes
      if (evaluationData && evaluationData.evaluationOutcome === 'with revision') {
         console.log('🔄 Handling "with revision" outcome...');
         
         // Prepare documents to revise array (moved outside if block for scope)
         const documentsToRevise = evaluationData.documentsToRevise?.map(docType => {
            // Find the document details from available documents
            const docDetails = evaluationData.availableDocuments?.find(doc => doc.type === docType);
            return {
               type: docType,
               name: docDetails?.name || docType,
               reason: evaluationData.evaluationComment
            };
         }) || [];
         
         console.log('🔍 Documents to revise prepared:', documentsToRevise);
         console.log('🔍 Evaluation data documentsToRevise:', evaluationData.documentsToRevise);
         console.log('🔍 Available documents:', evaluationData.availableDocuments);
         
         // Update RTEC documents to request revision
         if (rtecMeeting.rtecDocumentsId) {
            console.log('🔍 Updating RTEC documents with revision request...');
            console.log('🔍 RTEC Documents ID:', rtecMeeting.rtecDocumentsId);
            console.log('🔍 Update data:', {
               status: 'documents_revision_requested',
               revisionRequestedAt: new Date(),
               revisionRequestedBy: userId,
               revisionComments: evaluationData.evaluationComment,
               documentsToRevise: documentsToRevise
            });
            
            const updatedDoc = await RTECDocuments.findByIdAndUpdate(
               rtecMeeting.rtecDocumentsId,
               {
                  status: 'documents_revision_requested',
                  revisionRequestedAt: new Date(),
                  revisionRequestedBy: userId,
                  revisionComments: evaluationData.evaluationComment,
                  documentsToRevise: documentsToRevise
               },
               { new: true }
            );
            
            console.log('🔍 RTEC documents updated successfully:', {
               id: updatedDoc._id,
               status: updatedDoc.status,
               documentsToRevise: updatedDoc.documentsToRevise,
               revisionComments: updatedDoc.revisionComments
            });
         }
      } else if (evaluationData && evaluationData.evaluationOutcome === 'endorsed for approval (with comment)') {
         console.log('🔄 Handling "endorsed for approval (with comment)" outcome...');
         
         // For "endorsed for approval (with comment)", only add "Response to RTEC Comments" as additional document
         const additionalDocumentsRequired = [{
            type: 'response to rtec comments',
            name: 'Response to RTEC Comments',
            description: 'Proponent\'s response addressing the RTEC committee\'s comments and recommendations',
            reason: evaluationData.evaluationComment,
            documentStatus: 'pending'
         }];
         
         // Note: Response to RTEC Comments will be handled separately by the proponent
         // No need to automatically add it here to avoid duplication
         
         console.log('🔍 Additional documents required prepared:', additionalDocumentsRequired);
         console.log('🔍 Evaluation data documentsToRevise:', evaluationData.documentsToRevise);
         console.log('🔍 Available documents:', evaluationData.availableDocuments);
         
         // Update RTEC documents to add additional document requirements
         if (rtecMeeting.rtecDocumentsId) {
            console.log('🔍 Updating RTEC documents with additional document requirements...');
            console.log('🔍 RTEC Documents ID:', rtecMeeting.rtecDocumentsId);
            console.log('🔍 Update data:', {
               status: 'additional_documents_required',
               additionalDocumentsRequired: additionalDocumentsRequired
            });
            
            const updatedDoc = await RTECDocuments.findByIdAndUpdate(
               rtecMeeting.rtecDocumentsId,
               {
                  status: 'additional_documents_required',
                  additionalDocumentsRequired: additionalDocumentsRequired
               },
               { new: true }
            );
            
            console.log('🔍 RTEC documents updated with additional requirements successfully:', {
               id: updatedDoc._id,
               status: updatedDoc.status,
               additionalDocumentsRequired: updatedDoc.additionalDocumentsRequired
            });
         }

         // Update TNA status to revision requested
         if (rtecMeeting.tnaId) {
            await TNA.findByIdAndUpdate(
               rtecMeeting.tnaId,
               {
                  status: 'rtec_revision_requested',
                  revisionRequestedAt: new Date()
               }
            );
         }

         // Create notification for PSTO to handle document revision requirements
         if (rtecMeeting.scheduledBy) {
            const documentsList = documentsToRevise.map(doc => `• ${doc.name}`).join('\n');
            console.log('🔍 Creating notification with data:', {
               recipientId: rtecMeeting.scheduledBy,
               recipientType: 'psto',
               type: 'rtec_revision_requested',
               title: 'RTEC Documents Revision Required',
               message: `DOST-MIMAROPA has requested revision of specific RTEC documents for "${rtecMeeting.meetingTitle}".\n\nDocuments requiring revision:\n${documentsList}\n\nPlease coordinate with the proponent for document resubmission.`,
               relatedEntityType: 'rtec',
               relatedEntityId: rtecMeeting._id,
               actionUrl: `/rtec-meetings`,
               actionText: 'View Meeting Details',
               priority: 'high',
               sentBy: userId
            });
            
            await Notification.createNotification({
               recipientId: rtecMeeting.scheduledBy,
               recipientType: 'psto',
               type: 'rtec_revision_requested',
               title: 'RTEC Documents Revision Required',
               message: `DOST-MIMAROPA has requested revision of specific RTEC documents for "${rtecMeeting.meetingTitle}".\n\nDocuments requiring revision:\n${documentsList}\n\nPlease coordinate with the proponent for document resubmission.`,
               relatedEntityType: 'rtec',
               relatedEntityId: rtecMeeting._id,
               actionUrl: `/rtec-meetings`,
               actionText: 'View Meeting Details',
               priority: 'high',
               sentBy: userId
            });
         }

         console.log('✅ Revision workflow initiated');
      } else {
         console.log('✅ Handling "approved" outcome...');
         
         // Update related RTEC documents status to completed
         if (rtecMeeting.rtecDocumentsId) {
            await RTECDocuments.findByIdAndUpdate(
               rtecMeeting.rtecDocumentsId,
               {
                  status: 'rtec_completed',
                  rtecCompletedAt: new Date(),
                  rtecCompletedBy: userId
               }
            );
         }

         // Update TNA status to completed
         if (rtecMeeting.tnaId) {
            await TNA.findByIdAndUpdate(
               rtecMeeting.tnaId,
               {
                  status: 'rtec_completed',
                  rtecCompletedAt: new Date()
               }
            );
         }
      }

      // Create notification for proponent
      if (rtecMeeting.proponentId) {
         await Notification.createNotification({
            recipientId: rtecMeeting.proponentId,
            recipientType: 'proponent',
            type: 'rtec_completed',
            title: 'RTEC Evaluation Completed',
            message: `Your RTEC evaluation for "${rtecMeeting.meetingTitle}" has been completed.`,
            relatedEntityType: 'rtec',
            relatedEntityId: meetingId,
            actionUrl: `/applications`,
            actionText: 'View Application',
            priority: 'medium',
            sentBy: userId
         });
      }

      console.log('✅ RTEC completed successfully for meeting:', meetingId);

      res.json({
         success: true,
         message: 'RTEC completed successfully',
         data: {
            meeting: updatedMeeting,
            rtecCompleted: true,
            completedAt: new Date()
         }
      });

   } catch (error) {
      console.error('💥 Error completing RTEC:', error);
      console.error('💥 Error name:', error.name);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error stack:', error.stack);
      
      // Handle specific error types
      if (error.name === 'ValidationError') {
         return res.status(400).json({
            success: false,
            message: 'Database validation error',
            error: error.message,
            details: error.errors
         });
      }
      
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Create batch RTEC meeting for multiple applications from same PSTO
const createBatchRTECMeeting = async (req, res) => {
   try {
      const {
         psto,
         meetingTitle,
         meetingDescription,
         scheduledDate,
         scheduledTime,
         location,
         meetingType = 'physical',
         virtualMeetingLink,
         virtualMeetingId,
         virtualMeetingPassword,
         notes,
         rtecDocumentIds = []
      } = req.body;
      
      const userId = req.user.id;

      console.log('=== CREATE BATCH RTEC MEETING DEBUG ===');
      console.log('PSTO:', psto);
      console.log('User ID:', userId);
      console.log('Meeting Title:', meetingTitle);
      console.log('Scheduled Date:', scheduledDate);
      console.log('Scheduled Time:', scheduledTime);
      console.log('Location:', location);
      console.log('RTEC Document IDs:', rtecDocumentIds);
      console.log('RTEC Document IDs length:', rtecDocumentIds.length);
      console.log('RTEC Document IDs types:', rtecDocumentIds.map(id => typeof id));
      console.log('Request body:', req.body);

      // Validate inputs
      if (!psto || !meetingTitle || !scheduledDate || !scheduledTime || !location) {
         console.log('❌ Validation failed:');
         console.log('PSTO:', psto, 'valid:', !!psto);
         console.log('Meeting Title:', meetingTitle, 'valid:', !!meetingTitle);
         console.log('Scheduled Date:', scheduledDate, 'valid:', !!scheduledDate);
         console.log('Scheduled Time:', scheduledTime, 'valid:', !!scheduledTime);
         console.log('Location:', location, 'valid:', !!location);
         return res.status(400).json({
            success: false,
            message: 'PSTO, meeting title, scheduled date, time, and location are required'
         });
      }

      if (!rtecDocumentIds || rtecDocumentIds.length === 0) {
         return res.status(400).json({
            success: false,
            message: 'At least one RTEC document must be selected for batch meeting'
         });
      }

      // Validate all RTEC document IDs
      for (const docId of rtecDocumentIds) {
         if (!mongoose.Types.ObjectId.isValid(docId)) {
            return res.status(400).json({
               success: false,
               message: `Invalid RTEC document ID: ${docId}`
            });
         }
      }

      // Debug: Check what RTEC documents exist for these document IDs
      console.log('🔍 Debugging RTEC documents query...');
      console.log('RTEC Document IDs to search:', rtecDocumentIds);
      
      // Find the RTEC documents by their IDs
      const rtecDocuments = await RTECDocuments.find({
         _id: { $in: rtecDocumentIds },
         status: 'documents_approved'
      })
      .populate('applicationId', 'enterpriseName companyName projectTitle')
      .populate('proponentId', 'firstName lastName email province')
      .populate('tnaId', 'status signedTnaReport');

      console.log('✅ Found approved RTEC documents for batch:', rtecDocuments.length);
      console.log('📋 Document details:', rtecDocuments.map(doc => ({
         id: doc._id,
         applicationId: doc.applicationId?._id,
         status: doc.status,
         enterpriseName: doc.applicationId?.enterpriseName
      })));

      if (rtecDocuments.length === 0) {
         return res.status(400).json({
            success: false,
            message: 'No approved RTEC documents found for the selected applications'
         });
      }

      // Verify all documents are from the same PSTO
      const provinces = [...new Set(rtecDocuments.map(doc => doc.proponentId?.province).filter(Boolean))];
      if (provinces.length > 1 || (provinces.length === 1 && provinces[0] !== psto)) {
         return res.status(400).json({
            success: false,
            message: 'All applications must be from the same PSTO province'
         });
      }

      // Create the batch meeting
      const batchMeeting = new RTECMeeting({
         meetingTitle,
         meetingDescription,
         scheduledDate: new Date(scheduledDate),
         scheduledTime,
         location,
         meetingType,
         virtualMeetingLink,
         virtualMeetingId,
         virtualMeetingPassword,
         notes,
         status: 'rtec_scheduled',
         createdBy: userId,
         scheduledBy: userId, // Add required scheduledBy field
         isBatchMeeting: true,
         pstoProvince: psto,
         applications: rtecDocuments.map(doc => ({
            applicationId: doc.applicationId._id,
            status: 'scheduled'
         }))
      });

      let savedMeeting;
      try {
         savedMeeting = await batchMeeting.save();
         console.log('✅ Batch meeting created:', savedMeeting._id);
      } catch (saveError) {
         console.error('❌ Failed to save batch meeting:', saveError);
         console.error('Save error details:', saveError.message);
         console.error('Save error validation:', saveError.errors);
         return res.status(400).json({
            success: false,
            message: 'Failed to save batch meeting',
            error: saveError.message,
            details: saveError.errors
         });
      }

      // Update TNA status for all applications
      const updatePromises = rtecDocuments.map(async (doc) => {
         try {
            if (doc.tnaId && doc.tnaId._id) {
               await TNA.findByIdAndUpdate(doc.tnaId._id, {
                  status: 'rtec_scheduled',
                  scheduledDate: new Date(scheduledDate),
                  meetingId: savedMeeting._id
               });
               console.log(`✅ Updated TNA ${doc.tnaId._id} to rtec_scheduled`);
            }
         } catch (error) {
            console.error(`❌ Failed to update TNA ${doc.tnaId?._id}:`, error);
         }
      });

      await Promise.all(updatePromises);

      // Create notifications for all proponents
      const notificationPromises = rtecDocuments.map(async (doc) => {
         if (doc.proponentId && doc.proponentId._id) {
            const notification = new Notification({
               userId: doc.proponentId._id,
               type: 'rtec_meeting_scheduled',
               title: 'RTEC Meeting Scheduled',
               message: `Your application "${doc.applicationId?.enterpriseName || doc.applicationId?.companyName}" has been scheduled for RTEC meeting on ${scheduledDate} at ${scheduledTime}`,
               relatedId: savedMeeting._id,
               relatedType: 'rtec_meeting'
            });
            return notification.save();
         }
      });

      await Promise.all(notificationPromises.filter(Boolean));

      console.log('✅ Batch meeting creation completed successfully');

      return res.json({
         success: true,
         message: `Successfully created batch meeting for ${rtecDocuments.length} applications from ${psto}`,
         data: {
            meetingId: savedMeeting._id,
            meetingTitle: savedMeeting.meetingTitle,
            scheduledDate: savedMeeting.scheduledDate,
            applicationsCount: rtecDocuments.length,
            psto: psto
         }
      });

   } catch (error) {
      console.error('Error creating batch RTEC meeting:', error);
      
      if (error.name === 'ValidationError') {
         return res.status(400).json({
            success: false,
            message: 'Database validation error',
            error: error.message,
            details: error.errors
         });
      }
      
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

module.exports = {
   createRTECMeeting,
   createBatchRTECMeeting,
   getRTECMeetings,
   getRTECMeetingById,
   updateRTECMeeting,
   updateMeetingStatus,
   addParticipant,
   confirmParticipant,
   updateMyParticipantStatus,
   resendInvitation,
   getUserMeetings,
   deleteRTECMeeting,
   sendProponentInvitation,
   sendPSTOInvitation,
   getMeetingParticipants,
   removeParticipant,
   getAvailablePSTOUsers,
   sendBulkPSTOInvitations,
   completeRTEC
};
