const RTEC = require('../models/RTEC');
const TNA = require('../models/TNA');
const SETUPApplication = require('../models/SETUPApplication');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Create RTEC meeting (DOST MIMAROPA schedules)
const createRTECMeeting = async (req, res) => {
   try {
      console.log('=== RTEC MEETING CREATION DEBUG ===');
      console.log('Request body:', req.body);
      console.log('User:', req.user);

      const {
         tnaId,
         meetingTitle,
         meetingDate,
         meetingTime,
         meetingLocation,
         meetingType,
         meetingLink,
         committeeMembers,
         contactPerson,
         agenda,
         objectives,
         notes
      } = req.body;

      const scheduledBy = req.user._id || req.user.id;

      // Validate TNA ID
      if (!tnaId || !mongoose.Types.ObjectId.isValid(tnaId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid TNA ID'
         });
      }

      // Get TNA details
      const tna = await TNA.findById(tnaId)
         .populate('applicationId')
         .populate('proponentId')
         .populate('scheduledBy');

      if (!tna) {
         return res.status(404).json({
            success: false,
            message: 'TNA not found'
         });
      }

      // Check if TNA is ready for RTEC (signed by RD)
      if (tna.status !== 'signed_by_rd') {
         return res.status(400).json({
            success: false,
            message: 'TNA must be signed by RD before scheduling RTEC meeting'
         });
      }

      // Check if pre-meeting documents are submitted AND approved
      const existingRTEC = await RTEC.findOne({ tnaId: tnaId });
      if (existingRTEC) {
         const preMeetingDocsSubmitted = existingRTEC.preMeetingDocuments.every(doc => doc.isSubmitted);
         const preMeetingDocsApproved = existingRTEC.preMeetingDocuments.every(doc => doc.status === 'approved');
         
         if (!preMeetingDocsSubmitted) {
            return res.status(400).json({
               success: false,
               message: 'All pre-meeting documents must be submitted before scheduling RTEC meeting',
               requiredDocuments: existingRTEC.preMeetingDocuments.map(doc => ({
                  documentType: doc.documentType,
                  documentName: doc.documentName,
                  isSubmitted: doc.isSubmitted,
                  status: doc.status
               }))
            });
         }
         
         if (!preMeetingDocsApproved) {
            return res.status(400).json({
               success: false,
               message: 'All pre-meeting documents must be reviewed and approved before scheduling RTEC meeting',
               requiredDocuments: existingRTEC.preMeetingDocuments.map(doc => ({
                  documentType: doc.documentType,
                  documentName: doc.documentName,
                  isSubmitted: doc.isSubmitted,
                  status: doc.status
               }))
            });
         }
      }

      // Create RTEC meeting
      const rtecMeeting = new RTEC({
         tnaId,
         applicationId: tna.applicationId._id,
         proponentId: tna.proponentId._id,
         meetingTitle,
         meetingDate: new Date(meetingDate),
         meetingTime,
         meetingLocation,
         meetingMode: meetingType || 'physical',
         meetingLink,
         committeeMembers,
         contactPerson,
         agenda,
         objectives,
         notes,
         scheduledBy,
         pstoId: tna.scheduledBy._id
      });

      // Initialize required documents
      await rtecMeeting.initializeRequiredDocuments();

      // Save RTEC meeting
      await rtecMeeting.save();

      // Update TNA status
      await tna.markRTECScheduled(scheduledBy);

      // Create notification for PSTO
      const notification = new Notification({
         recipientId: tna.scheduledBy._id,
         recipientType: 'psto',
         sentBy: scheduledBy,
         type: 'rtec_scheduled',
         title: 'RTEC Meeting Scheduled',
         message: `RTEC meeting has been scheduled for ${meetingTitle} on ${new Date(meetingDate).toLocaleDateString()}`,
         relatedEntityId: rtecMeeting._id,
         relatedEntityType: 'rtec'
      });
      await notification.save();

      // Populate the response
      await rtecMeeting.populate([
         { path: 'tnaId', populate: ['applicationId', 'proponentId'] },
         { path: 'scheduledBy', select: 'firstName lastName email' },
         { path: 'pstoId', select: 'firstName lastName email' }
      ]);

      res.status(201).json({
         success: true,
         message: 'RTEC meeting created successfully',
         data: rtecMeeting
      });

   } catch (error) {
      console.error('Error creating RTEC meeting:', error);
      res.status(500).json({
         success: false,
         message: 'Failed to create RTEC meeting',
         error: error.message
      });
   }
};

// Get RTEC meetings (DOST MIMAROPA view)
const getRTECMeetings = async (req, res) => {
   try {
      const { status, page = 1, limit = 10 } = req.query;
      const userId = req.user._id || req.user.id;

      let query = { scheduledBy: userId };
      if (status) {
         query.status = status;
      }

      const rtecMeetings = await RTEC.find(query)
         .populate([
            { path: 'tnaId', populate: ['applicationId', 'proponentId'] },
            { path: 'scheduledBy', select: 'firstName lastName email' },
            { path: 'pstoId', select: 'firstName lastName email' }
         ])
         .sort({ meetingDate: -1 })
         .limit(limit * 1)
         .skip((page - 1) * limit);

      const total = await RTEC.countDocuments(query);

      res.json({
         success: true,
         data: rtecMeetings,
         pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
         }
      });

   } catch (error) {
      console.error('Error fetching RTEC meetings:', error);
      res.status(500).json({
         success: false,
         message: 'Failed to fetch RTEC meetings',
         error: error.message
      });
   }
};

// Get RTEC meetings for PSTO
const getPSTORtecMeetings = async (req, res) => {
   try {
      const { status, page = 1, limit = 10 } = req.query;
      const userId = req.user._id || req.user.id;

      console.log('=== PSTO RTEC MEETINGS DEBUG ===');
      console.log('PSTO User ID:', userId);
      console.log('Query status filter:', status);

      let query = { pstoId: userId };
      if (status) {
         query.status = status;
      }

      console.log('Query:', query);

      // First, let's see all RTEC records for debugging
      const allRTECs = await RTEC.find({}).select('_id pstoId status tnaId meetingTitle');
      console.log('All RTEC records:', allRTECs.map(r => ({
         id: r._id,
         pstoId: r.pstoId,
         status: r.status,
         tnaId: r.tnaId,
         title: r.meetingTitle
      })));

      const rtecMeetings = await RTEC.find(query)
         .populate([
            { path: 'tnaId', populate: ['applicationId', 'proponentId'] },
            { path: 'applicationId', select: 'applicationId enterpriseName programName' },
            { path: 'proponentId', select: 'firstName lastName email' },
            { path: 'scheduledBy', select: 'firstName lastName email' },
            { path: 'pstoId', select: 'firstName lastName email' }
         ])
         .sort({ meetingDate: -1 })
         .limit(limit * 1)
         .skip((page - 1) * limit);

      console.log('Found RTEC meetings for PSTO:', rtecMeetings.length);
      console.log('RTEC meetings:', rtecMeetings.map(r => ({
         id: r._id,
         status: r.status,
         title: r.meetingTitle,
         pstoId: r.pstoId
      })));

      const total = await RTEC.countDocuments(query);

      res.json({
         success: true,
         data: rtecMeetings,
         pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
         }
      });

   } catch (error) {
      console.error('Error fetching PSTO RTEC meetings:', error);
      res.status(500).json({
         success: false,
         message: 'Failed to fetch RTEC meetings',
         error: error.message
      });
   }
};

// Get single RTEC meeting
const getRTECMeeting = async (req, res) => {
   try {
      const { id } = req.params;

      const rtecMeeting = await RTEC.findById(id)
         .populate([
            { path: 'tnaId', populate: ['applicationId', 'proponentId'] },
            { path: 'scheduledBy', select: 'firstName lastName email' },
            { path: 'pstoId', select: 'firstName lastName email' }
         ]);

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
         message: 'Failed to fetch RTEC meeting',
         error: error.message
      });
   }
};

// Send meeting invitation
const sendMeetingInvitation = async (req, res) => {
   try {
      const { id } = req.params;
      const userId = req.user._id || req.user.id;

      const rtecMeeting = await RTEC.findById(id);
      if (!rtecMeeting) {
         return res.status(404).json({
            success: false,
            message: 'RTEC meeting not found'
         });
      }

      // Send invitation
      await rtecMeeting.sendInvitation(userId);

      // Create notifications for committee members
      for (const member of rtecMeeting.committeeMembers) {
         // Find user by email to get proper recipientId
         const user = await User.findOne({ email: member.email });
         if (user) {
            const notification = new Notification({
               recipientId: user._id,
               recipientType: user.role,
               sentBy: userId,
               type: 'meeting_invitation',
               title: 'RTEC Meeting Invitation',
               message: `You are invited to attend RTEC meeting: ${rtecMeeting.meetingTitle} on ${rtecMeeting.formattedMeetingDate}`,
               relatedEntityId: rtecMeeting._id,
               relatedEntityType: 'RTEC'
            });
            await notification.save();
         }
      }

      res.json({
         success: true,
         message: 'Meeting invitation sent successfully'
      });

   } catch (error) {
      console.error('Error sending meeting invitation:', error);
      res.status(500).json({
         success: false,
         message: 'Failed to send meeting invitation',
         error: error.message
      });
   }
};

// Request proposal submission
const requestProposalSubmission = async (req, res) => {
   try {
      const { id } = req.params;
      const userId = req.user._id || req.user.id;

      const rtecMeeting = await RTEC.findById(id);
      if (!rtecMeeting) {
         return res.status(404).json({
            success: false,
            message: 'RTEC meeting not found'
         });
      }

      // Request proposal
      await rtecMeeting.requestProposal(userId);

      // Create notification for PSTO
      const notification = new Notification({
         recipientId: rtecMeeting.pstoId,
         recipientType: 'psto',
         sentBy: userId,
         type: 'proposal_request',
         title: 'Proposal Submission Requested',
         message: `Please submit the required documents for RTEC meeting: ${rtecMeeting.meetingTitle}`,
         relatedEntityId: rtecMeeting._id,
         relatedEntityType: 'rtec'
      });
      await notification.save();

      res.json({
         success: true,
         message: 'Proposal submission requested successfully'
      });

   } catch (error) {
      console.error('Error requesting proposal submission:', error);
      res.status(500).json({
         success: false,
         message: 'Failed to request proposal submission',
         error: error.message
      });
   }
};

// Submit document (PSTO)
const submitDocument = async (req, res) => {
   try {
      const { id } = req.params;
      const { documentType, remarks } = req.body;
      const userId = req.user._id || req.user.id;

      if (!req.file) {
         return res.status(400).json({
            success: false,
            message: 'No file uploaded'
         });
      }

      const rtecMeeting = await RTEC.findById(id);
      if (!rtecMeeting) {
         return res.status(404).json({
            success: false,
            message: 'RTEC meeting not found'
         });
      }

      const fileData = {
         filename: req.file.filename,
         originalName: req.file.originalname,
         path: req.file.path,
         size: req.file.size,
         mimetype: req.file.mimetype
      };

      // Submit document with remarks
      await rtecMeeting.submitDocument(documentType, fileData, userId, remarks);

      res.json({
         success: true,
         message: 'Document submitted successfully'
      });

   } catch (error) {
      console.error('Error submitting document:', error);
      res.status(500).json({
         success: false,
         message: 'Failed to submit document',
         error: error.message
      });
   }
};

// Review document (DOST MIMAROPA)
const reviewDocument = async (req, res) => {
   try {
      const { id } = req.params;
      const { documentType, status, remarks } = req.body;
      const userId = req.user._id || req.user.id;

      const rtecMeeting = await RTEC.findById(id);
      if (!rtecMeeting) {
         return res.status(404).json({
            success: false,
            message: 'RTEC meeting not found'
         });
      }

      // Review document
      await rtecMeeting.reviewDocument(documentType, status, remarks, userId);

      res.json({
         success: true,
         message: 'Document reviewed successfully'
      });

   } catch (error) {
      console.error('Error reviewing document:', error);
      res.status(500).json({
         success: false,
         message: 'Failed to review document',
         error: error.message
      });
   }
};

// Get documents for review (DOST MIMAROPA)
const getDocumentsForReview = async (req, res) => {
   try {
      const { id } = req.params;
      
      const rtecMeeting = await RTEC.findById(id)
         .populate([
            { path: 'tnaId', populate: ['applicationId', 'proponentId'] },
            { path: 'scheduledBy', select: 'firstName lastName email' },
            { path: 'pstoId', select: 'firstName lastName email' }
         ]);

      if (!rtecMeeting) {
         return res.status(404).json({
            success: false,
            message: 'RTEC meeting not found'
         });
      }

      res.json({
         success: true,
         data: {
            rtecMeeting,
            preMeetingDocuments: rtecMeeting.preMeetingDocuments || [],
            postMeetingDocuments: rtecMeeting.postMeetingDocuments || []
         }
      });

   } catch (error) {
      console.error('Error fetching documents for review:', error);
      res.status(500).json({
         success: false,
         message: 'Failed to fetch documents for review',
         error: error.message
      });
   }
};

// Complete evaluation
const completeEvaluation = async (req, res) => {
   try {
      const { id } = req.params;
      const { evaluationResults } = req.body;
      const userId = req.user._id || req.user.id;

      const rtecMeeting = await RTEC.findById(id);
      if (!rtecMeeting) {
         return res.status(404).json({
            success: false,
            message: 'RTEC meeting not found'
         });
      }

      // Complete evaluation
      await rtecMeeting.completeEvaluation(evaluationResults, userId);

      // Update TNA status
      const tna = await TNA.findById(rtecMeeting.tnaId);
      if (tna) {
         await tna.markRTECCompleted(userId);
      }

      res.json({
         success: true,
         message: 'Evaluation completed successfully'
      });

   } catch (error) {
      console.error('Error completing evaluation:', error);
      res.status(500).json({
         success: false,
         message: 'Failed to complete evaluation',
         error: error.message
      });
   }
};

// Reschedule meeting
const rescheduleMeeting = async (req, res) => {
   try {
      const { id } = req.params;
      const { newDate, newTime, reason } = req.body;
      const userId = req.user._id || req.user.id;

      const rtecMeeting = await RTEC.findById(id);
      if (!rtecMeeting) {
         return res.status(404).json({
            success: false,
            message: 'RTEC meeting not found'
         });
      }

      // Reschedule meeting
      await rtecMeeting.rescheduleMeeting(newDate, newTime, reason, userId);

      res.json({
         success: true,
         message: 'Meeting rescheduled successfully'
      });

   } catch (error) {
      console.error('Error rescheduling meeting:', error);
      res.status(500).json({
         success: false,
         message: 'Failed to reschedule meeting',
         error: error.message
      });
   }
};

// Cancel meeting
const cancelMeeting = async (req, res) => {
   try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user._id || req.user.id;

      const rtecMeeting = await RTEC.findById(id);
      if (!rtecMeeting) {
         return res.status(404).json({
            success: false,
            message: 'RTEC meeting not found'
         });
      }

      // Cancel meeting
      await rtecMeeting.cancelMeeting(reason, userId);

      res.json({
         success: true,
         message: 'Meeting cancelled successfully'
      });

   } catch (error) {
      console.error('Error cancelling meeting:', error);
      res.status(500).json({
         success: false,
         message: 'Failed to cancel meeting',
         error: error.message
      });
   }
};

// Get document status
const getDocumentStatus = async (req, res) => {
   try {
      const { id } = req.params;

      const rtecMeeting = await RTEC.findById(id);
      if (!rtecMeeting) {
         return res.status(404).json({
            success: false,
            message: 'RTEC meeting not found'
         });
      }

      const documentStatus = rtecMeeting.requiredDocuments.map(doc => ({
         documentType: doc.documentType,
         documentName: doc.documentName,
         description: doc.description,
         isSubmitted: doc.isSubmitted,
         submittedAt: doc.submittedAt,
         status: doc.status,
         remarks: doc.remarks
      }));

      res.json({
         success: true,
         data: documentStatus
      });

   } catch (error) {
      console.error('Error fetching document status:', error);
      res.status(500).json({
         success: false,
         message: 'Failed to fetch document status',
         error: error.message
      });
   }
};

// Get TNAs ready for RTEC scheduling (signed by RD)
const getTNAsReadyForRTEC = async (req, res) => {
   try {
      console.log('=== STARTING getTNAsReadyForRTEC ===');
      
      // STEP 1: Clean up ALL draft RTEC records immediately
      console.log('STEP 1: Cleaning up draft RTEC records...');
      const draftCleanup = await RTEC.deleteMany({ status: 'draft' });
      console.log(`✅ Cleaned up ${draftCleanup.deletedCount} draft RTEC records`);

      // STEP 2: Get all TNAs with signed_by_rd status
      console.log('STEP 2: Fetching TNAs with signed_by_rd status...');
      const tnas = await TNA.find({ status: 'signed_by_rd' })
         .populate([
            { path: 'applicationId', select: 'applicationId enterpriseName status' },
            { path: 'proponentId', select: 'firstName lastName email' },
            { path: 'scheduledBy', select: 'firstName lastName email' }
         ])
         .sort({ rdSignedAt: -1 });

      console.log(`✅ Found ${tnas.length} TNAs with signed_by_rd status`);
      
      if (tnas.length === 0) {
         console.log('❌ No TNAs found with signed_by_rd status');
         return res.json({ success: true, data: [] });
      }

      // STEP 3: Process each TNA and check for approved documents
      console.log('STEP 3: Processing each TNA and checking document status...');
      const readyTNAs = [];
      
      for (let i = 0; i < tnas.length; i++) {
         const tna = tnas[i];
         console.log(`\n--- TNA ${i + 1}/${tnas.length}: ${tna._id} ---`);
         
         // Log TNA details
         console.log(`📋 Application: ${tna.applicationId?.applicationId || 'MISSING'}`);
         console.log(`🏢 Enterprise: ${tna.applicationId?.enterpriseName || 'MISSING'}`);
         console.log(`👤 Proponent: ${tna.proponentId?.firstName || 'MISSING'} ${tna.proponentId?.lastName || ''}`);
         console.log(`🏛️ PSTO: ${tna.scheduledBy?.firstName || 'MISSING'} ${tna.scheduledBy?.lastName || ''}`);
         
         // Skip TNAs with missing critical data
         if (!tna.applicationId || !tna.proponentId || !tna.scheduledBy) {
            console.log(`⏭️ SKIPPED - Missing critical data`);
            continue;
         }

         // Check for existing RTEC (only scheduled/completed, not draft since we deleted those)
         const existingRTEC = await RTEC.findOne({
            tnaId: tna._id,
            status: { $in: ['scheduled', 'completed', 'cancelled'] }
         });
         
         if (existingRTEC) {
            console.log(`⏭️ SKIPPED - Already has RTEC with status: ${existingRTEC.status}`);
            continue;
         }

         // Check if there's an RTEC with document submission status
         const rtecWithDocuments = await RTEC.findOne({
            tnaId: tna._id,
            status: { $in: ['documents_requested', 'documents_submitted', 'documents_approved'] }
         });

         if (!rtecWithDocuments) {
            console.log(`⏭️ SKIPPED - No document submission process started`);
            continue;
         }

         // Only add to ready list if documents are approved
         if (rtecWithDocuments.status === 'documents_approved') {
            console.log(`✅ ADDED to ready list - Documents approved`);
            readyTNAs.push(tna);
         } else {
            console.log(`⏭️ SKIPPED - Documents not yet approved (status: ${rtecWithDocuments.status})`);
         }
      }

      console.log(`\n🎯 FINAL RESULT: ${readyTNAs.length} TNAs ready for RTEC scheduling`);
      console.log('Ready TNA IDs:', readyTNAs.map(tna => tna._id.toString()));

      res.json({
         success: true,
         data: readyTNAs
      });

   } catch (error) {
      console.error('❌ ERROR in getTNAsReadyForRTEC:', error);
      res.status(500).json({
         success: false,
         message: 'Failed to fetch TNAs ready for RTEC',
         error: error.message
      });
   }
};

// Get TNAs that need document submission request (signed by RD but no document process started)
const getTNAsNeedingDocuments = async (req, res) => {
   try {
      console.log('=== STARTING getTNAsNeedingDocuments ===');
      
      // Get all TNAs with signed_by_rd status
      const tnas = await TNA.find({ status: 'signed_by_rd' })
         .populate([
            { path: 'applicationId', select: 'applicationId enterpriseName status' },
            { path: 'proponentId', select: 'firstName lastName email' },
            { path: 'scheduledBy', select: 'firstName lastName email' }
         ])
         .sort({ rdSignedAt: -1 });

      console.log(`✅ Found ${tnas.length} TNAs with signed_by_rd status`);
      
      const tnasNeedingDocuments = [];
      
      for (const tna of tnas) {
         // Skip TNAs with missing critical data
         if (!tna.applicationId || !tna.proponentId || !tna.scheduledBy) {
            continue;
         }

         // Check if there's already an RTEC record for this TNA
         const existingRTEC = await RTEC.findOne({ tnaId: tna._id });
         
         if (!existingRTEC) {
            // No RTEC record exists, so documents haven't been requested yet
            tnasNeedingDocuments.push(tna);
            console.log(`✅ TNA ${tna._id} needs document request`);
         } else {
            console.log(`⏭️ TNA ${tna._id} already has RTEC record with status: ${existingRTEC.status}`);
         }
      }

      console.log(`\n🎯 FINAL RESULT: ${tnasNeedingDocuments.length} TNAs needing document requests`);

      res.json({
         success: true,
         data: tnasNeedingDocuments
      });

   } catch (error) {
      console.error('❌ ERROR in getTNAsNeedingDocuments:', error);
      res.status(500).json({
         success: false,
         message: 'Failed to fetch TNAs needing documents',
         error: error.message
      });
   }
};

// Get RTEC statistics
const getRTECStatistics = async (req, res) => {
   try {
      const userId = req.user._id || req.user.id;
      const userRole = req.user.role;

      let query = {};
      if (userRole === 'dost_mimaropa') {
         query.scheduledBy = userId;
      } else if (userRole === 'psto') {
         query.pstoId = userId;
      }

      const totalMeetings = await RTEC.countDocuments(query);
      const scheduledMeetings = await RTEC.countDocuments({ ...query, status: 'scheduled' });
      const meetingsSent = await RTEC.countDocuments({ ...query, status: 'meeting_sent' });
      const proposalRequested = await RTEC.countDocuments({ ...query, status: 'proposal_requested' });
      const proposalSubmitted = await RTEC.countDocuments({ ...query, status: 'proposal_submitted' });
      const underReview = await RTEC.countDocuments({ ...query, status: 'under_review' });
      const approved = await RTEC.countDocuments({ ...query, status: 'approved' });
      const rejected = await RTEC.countDocuments({ ...query, status: 'rejected' });
      const completed = await RTEC.countDocuments({ ...query, status: 'completed' });

      res.json({
         success: true,
         data: {
            totalMeetings,
            scheduledMeetings,
            meetingsSent,
            proposalRequested,
            proposalSubmitted,
            underReview,
            approved,
            rejected,
            completed
         }
      });

   } catch (error) {
      console.error('Error fetching RTEC statistics:', error);
      res.status(500).json({
         success: false,
         message: 'Failed to fetch RTEC statistics',
         error: error.message
      });
   }
};

// Request document submission from PSTO (DOST MIMAROPA sends request)
const requestDocumentSubmission = async (req, res) => {
   try {
      const { tnaId, message } = req.body;
      const requestedBy = req.user._id || req.user.id;

      // Validate TNA ID
      if (!tnaId || !mongoose.Types.ObjectId.isValid(tnaId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid TNA ID'
         });
      }

      // Get TNA details
      const tna = await TNA.findById(tnaId)
         .populate('applicationId')
         .populate('proponentId')
         .populate('scheduledBy');

      if (!tna) {
         return res.status(404).json({
            success: false,
            message: 'TNA not found'
         });
      }

      // Check if TNA is ready for RTEC (signed by RD)
      if (tna.status !== 'signed_by_rd') {
         return res.status(400).json({
            success: false,
            message: 'TNA must be signed by RD before requesting documents'
         });
      }

      // Check if RTEC already exists
      let rtecMeeting = await RTEC.findOne({ tnaId: tnaId });
      
      console.log('=== DOCUMENT REQUEST DEBUG ===');
      console.log('TNA ID:', tnaId);
      console.log('TNA scheduledBy (PSTO):', tna.scheduledBy);
      console.log('Existing RTEC:', rtecMeeting ? rtecMeeting._id : 'None');
      
      if (!rtecMeeting) {
         // Create RTEC for document submission
         rtecMeeting = new RTEC({
            tnaId,
            applicationId: tna.applicationId._id,
            proponentId: tna.proponentId._id,
            pstoId: tna.scheduledBy._id,
            meetingTitle: `RTEC Document Submission - ${tna.applicationId.programName}`,
            meetingDate: new Date(), // Placeholder date
            meetingTime: 'TBD',
            meetingLocation: 'TBD',
            status: 'documents_requested',
            scheduledBy: requestedBy,
            contactPerson: {
               name: 'TBD',
               position: 'TBD',
               email: 'TBD',
               phone: 'TBD'
            }
         });

         // Initialize required documents
         await rtecMeeting.initializeRequiredDocuments();
         await rtecMeeting.save();
         
         console.log('Created new RTEC:', {
            id: rtecMeeting._id,
            pstoId: rtecMeeting.pstoId,
            status: rtecMeeting.status,
            title: rtecMeeting.meetingTitle
         });
      } else {
         // Update existing RTEC status
         rtecMeeting.status = 'documents_requested';
         await rtecMeeting.save();
         
         console.log('Updated existing RTEC:', {
            id: rtecMeeting._id,
            pstoId: rtecMeeting.pstoId,
            status: rtecMeeting.status
         });
      }

      // Create notification for PSTO
      const notification = new Notification({
         recipientId: tna.scheduledBy._id,
         recipientType: 'psto',
         sentBy: requestedBy,
         type: 'rtec_document_request',
         title: 'RTEC Document Submission Required',
         message: `Please submit the required pre-meeting documents for TNA ${tna.tnaId}. ${message || 'The following documents are required: Approved TNA Report, Risk Management Plan, and Financial Statements.'}`,
         relatedEntityId: rtecMeeting._id,
         relatedEntityType: 'rtec',
         isRead: false
      });

      await notification.save();

      // Update TNA status
      await tna.forwardToRTEC(requestedBy);

      res.status(201).json({
         success: true,
         message: 'Document submission request sent to PSTO',
         data: {
            rtecId: rtecMeeting._id,
            notificationId: notification._id
         }
      });

   } catch (error) {
      console.error('Error requesting document submission:', error);
      res.status(500).json({
         success: false,
         message: 'Error requesting document submission',
         error: error.message
      });
   }
};

// Create RTEC for document submission (PSTO submits pre-meeting documents)
const createRTECForDocuments = async (req, res) => {
   try {
      const { tnaId } = req.body;
      const pstoId = req.user._id || req.user.id;

      // Validate TNA ID
      if (!tnaId || !mongoose.Types.ObjectId.isValid(tnaId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid TNA ID'
         });
      }

      // Get TNA details
      const tna = await TNA.findById(tnaId)
         .populate('applicationId')
         .populate('proponentId')
         .populate('scheduledBy');

      if (!tna) {
         return res.status(404).json({
            success: false,
            message: 'TNA not found'
         });
      }

      // Check if TNA is ready for RTEC (signed by RD)
      if (tna.status !== 'signed_by_rd') {
         return res.status(400).json({
            success: false,
            message: 'TNA must be signed by RD before submitting documents'
         });
      }

      // Check if RTEC already exists
      const existingRTEC = await RTEC.findOne({ tnaId: tnaId });
      if (existingRTEC) {
         return res.status(400).json({
            success: false,
            message: 'RTEC already exists for this TNA',
            rtecId: existingRTEC._id
         });
      }

      // Create RTEC for document submission
      const rtecMeeting = new RTEC({
         tnaId,
         applicationId: tna.applicationId._id,
         proponentId: tna.proponentId._id,
         pstoId,
         meetingTitle: `RTEC Document Submission - ${tna.applicationId.programName}`,
         meetingDate: new Date(), // Placeholder date
         meetingTime: 'TBD',
         meetingLocation: 'TBD',
         status: 'draft',
         scheduledBy: pstoId,
         contactPerson: {
            name: 'TBD',
            position: 'TBD',
            email: 'TBD',
            phone: 'TBD'
         }
      });

      // Initialize required documents
      await rtecMeeting.initializeRequiredDocuments();

      // Update TNA status
      await tna.forwardToRTEC();

      res.status(201).json({
         success: true,
         message: 'RTEC created for document submission',
         data: rtecMeeting
      });

   } catch (error) {
      console.error('Error creating RTEC for documents:', error);
      res.status(500).json({
         success: false,
         message: 'Error creating RTEC for documents',
         error: error.message
      });
   }
};

// Clean up draft RTEC records
const cleanupDraftRTECs = async (req, res) => {
   try {
      console.log('=== CLEANUP DRAFT RTEC RECORDS ===');
      
      const draftRTECs = await RTEC.find({ status: 'draft' });
      console.log(`Found ${draftRTECs.length} draft RTEC records to clean up`);
      
      const deleteResult = await RTEC.deleteMany({ status: 'draft' });
      console.log(`Deleted ${deleteResult.deletedCount} draft RTEC records`);
      
      res.json({
         success: true,
         message: `Cleaned up ${deleteResult.deletedCount} draft RTEC records`,
         deletedCount: deleteResult.deletedCount
      });

   } catch (error) {
      console.error('Error cleaning up draft RTECs:', error);
      res.status(500).json({
         success: false,
         message: 'Cleanup failed',
         error: error.message
      });
   }
};

// Debug endpoint to check TNA data
const debugTNAData = async (req, res) => {
   try {
      console.log('=== DEBUG TNA DATA ===');
      
      // Get ALL TNAs first to see what exists
      const allTnas = await TNA.find({}).select('_id status rdSignedAt');
      console.log('All TNAs in database:', allTnas.length);
      console.log('TNA statuses:', allTnas.map(tna => ({ id: tna._id, status: tna.status })));
      
      // Get all TNAs with signed_by_rd status
      const tnas = await TNA.find({ status: 'signed_by_rd' })
         .populate([
            { path: 'applicationId', select: 'applicationId enterpriseName status' },
            { path: 'proponentId', select: 'firstName lastName email' },
            { path: 'scheduledBy', select: 'firstName lastName email' }
         ]);

      console.log(`Found ${tnas.length} TNAs with signed_by_rd status`);
      
      for (const tna of tnas) {
         console.log(`\n--- TNA ${tna._id} ---`);
         console.log('Application ID:', tna.applicationId);
         console.log('Proponent ID:', tna.proponentId);
         console.log('Scheduled By:', tna.scheduledBy);
         
         // Check RTEC
         const rtec = await RTEC.findOne({ tnaId: tna._id });
         console.log('RTEC exists:', !!rtec);
         
         if (rtec) {
            console.log('RTEC status:', rtec.status);
            console.log('Pre-meeting docs:', rtec.preMeetingDocuments?.length || 0);
            if (rtec.preMeetingDocuments) {
               rtec.preMeetingDocuments.forEach(doc => {
                  console.log(`  - ${doc.documentType}: submitted=${doc.isSubmitted}, status=${doc.status}`);
               });
            }
         }
      }

      res.json({
         success: true,
         data: {
            tnasFound: tnas.length,
            tnas: tnas.map(tna => ({
               id: tna._id,
               status: tna.status,
               hasApplication: !!tna.applicationId,
               hasProponent: !!tna.proponentId,
               hasScheduledBy: !!tna.scheduledBy,
               applicationId: tna.applicationId?.applicationId,
               enterpriseName: tna.applicationId?.enterpriseName
            }))
         }
      });

   } catch (error) {
      console.error('Debug TNA data error:', error);
      res.status(500).json({
         success: false,
         message: 'Debug failed',
         error: error.message
      });
   }
};

// Debug RTEC data
const debugRTECData = async (req, res) => {
   try {
      console.log('=== DEBUG RTEC DATA ===');
      console.log('Current user:', req.user);
      
      const rtecs = await RTEC.find({})
         .populate('tnaId', 'tnaId status')
         .populate('applicationId', 'applicationId enterpriseName')
         .populate('proponentId', 'firstName lastName email')
         .populate('pstoId', 'firstName lastName email')
         .sort({ createdAt: -1 });

      console.log(`Found ${rtecs.length} RTEC records:`);
      
      for (const rtec of rtecs) {
         console.log(`\nRTEC ${rtec._id}:`);
         console.log(`  Status: ${rtec.status}`);
         console.log(`  Title: ${rtec.meetingTitle}`);
         console.log(`  TNA: ${rtec.tnaId?._id || 'N/A'} (Status: ${rtec.tnaId?.status || 'N/A'})`);
         console.log(`  Application: ${rtec.applicationId?.applicationId || 'N/A'}`);
         console.log(`  PSTO ID: ${rtec.pstoId?._id || rtec.pstoId || 'N/A'}`);
         console.log(`  PSTO Name: ${rtec.pstoId?.firstName || 'N/A'} ${rtec.pstoId?.lastName || ''}`);
         console.log(`  Pre-meeting docs: ${rtec.preMeetingDocuments?.length || 0}`);
         if (rtec.preMeetingDocuments?.length > 0) {
            rtec.preMeetingDocuments.forEach(doc => {
               console.log(`    - ${doc.documentName}: ${doc.status} (submitted: ${doc.isSubmitted})`);
            });
         }
      }

      res.json({
         success: true,
         message: 'RTEC debug data logged to console',
         data: {
            totalRTECs: rtecs.length,
            rtecsByStatus: rtecs.reduce((acc, rtec) => {
               acc[rtec.status] = (acc[rtec.status] || 0) + 1;
               return acc;
            }, {})
         }
      });

   } catch (error) {
      console.error('Error in debugRTECData:', error);
      res.status(500).json({
         success: false,
         message: 'RTEC debug failed',
         error: error.message
      });
   }
};

module.exports = {
   createRTECMeeting,
   getRTECMeetings,
   getPSTORtecMeetings,
   getRTECMeeting,
   sendMeetingInvitation,
   requestProposalSubmission,
   submitDocument,
   reviewDocument,
   getDocumentsForReview,
   completeEvaluation,
   rescheduleMeeting,
   cancelMeeting,
   getDocumentStatus,
   getTNAsReadyForRTEC,
   getTNAsNeedingDocuments,
   getRTECStatistics,
   createRTECForDocuments,
   requestDocumentSubmission,
   debugTNAData,
   debugRTECData,
   cleanupDraftRTECs
};
