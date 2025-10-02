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

      let query = { pstoId: userId };
      if (status) {
         query.status = status;
      }

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

// Get TNAs ready for RTEC scheduling (signed by RD with documents submitted)
const getTNAsReadyForRTEC = async (req, res) => {
   try {
      const tnas = await TNA.find({ status: 'signed_by_rd' })
         .populate([
            { path: 'applicationId', select: 'applicationId enterpriseName status' },
            { path: 'proponentId', select: 'firstName lastName email' },
            { path: 'scheduledBy', select: 'firstName lastName email' }
         ])
         .sort({ rdSignedAt: -1 });

      // Check which TNAs have RTEC with all pre-meeting documents submitted AND approved
      const tnasWithDocuments = [];
      
      console.log('getTNAsReadyForRTEC - Found TNAs with signed_by_rd status:', tnas.length);
      
      for (const tna of tnas) {
         try {
            let rtec = await RTEC.findOne({ tnaId: tna._id });
            
            console.log(`TNA ${tna._id}: RTEC exists:`, !!rtec);
            
            // If no RTEC exists, create one automatically for this TNA
            if (!rtec) {
               console.log(`Creating RTEC record for TNA ${tna._id}`);
               
               // Check for required references
               if (!tna.applicationId || !tna.proponentId || !tna.scheduledBy) {
                  console.log(`TNA ${tna._id} - Missing required references:`, {
                     applicationId: !!tna.applicationId,
                     proponentId: !!tna.proponentId,
                     scheduledBy: !!tna.scheduledBy
                  });
                  continue; // Skip this TNA if missing required references
               }
            
               rtec = new RTEC({
                  tnaId: tna._id,
                  applicationId: tna.applicationId._id,
                  proponentId: tna.proponentId._id,
                  pstoId: tna.scheduledBy._id,
                  meetingTitle: `RTEC Document Submission - ${tna.applicationId?.enterpriseName || 'Enterprise'}`,
                  meetingDate: new Date(),
                  meetingTime: 'TBD',
                  meetingLocation: 'TBD',
                  status: 'draft',
                  scheduledBy: req.user._id || req.user.id,
                  contactPerson: {
                     name: 'TBD',
                     position: 'TBD',
                     email: 'TBD',
                     phone: 'TBD'
                  }
               });
               
               // Initialize required documents
               rtec.initializeRequiredDocuments();
               await rtec.save();
               console.log(`RTEC record created for TNA ${tna._id}`);
            }
         
         if (rtec && rtec.preMeetingDocuments) {
            console.log(`TNA ${tna._id} - Pre-meeting documents:`, rtec.preMeetingDocuments.map(doc => ({
               type: doc.documentType,
               submitted: doc.isSubmitted,
               status: doc.status
            })));
            
            const allDocumentsSubmitted = rtec.preMeetingDocuments.every(doc => doc.isSubmitted);
            const allDocumentsApproved = rtec.preMeetingDocuments.every(doc => doc.status === 'approved');
            
            console.log(`TNA ${tna._id} - All submitted:`, allDocumentsSubmitted, 'All approved:', allDocumentsApproved);
            console.log(`TNA ${tna._id} - Document details:`, rtec.preMeetingDocuments.map(doc => `${doc.documentType}: submitted=${doc.isSubmitted}, status=${doc.status}`));
            
            if (allDocumentsSubmitted && allDocumentsApproved) {
               tnasWithDocuments.push(tna);
               console.log(`TNA ${tna._id} - ADDED to ready list`);
            } else {
               console.log(`TNA ${tna._id} - NOT READY - Missing requirements:`, {
                  needsSubmission: rtec.preMeetingDocuments.filter(doc => !doc.isSubmitted).map(doc => doc.documentType),
                  needsApproval: rtec.preMeetingDocuments.filter(doc => doc.status !== 'approved').map(doc => `${doc.documentType}:${doc.status}`)
               });
            }
         } catch (error) {
            console.error(`Error processing TNA ${tna._id}:`, error);
            continue; // Skip this TNA and continue with the next one
         }
      }

      res.json({
         success: true,
         data: tnasWithDocuments
      });

   } catch (error) {
      console.error('Error fetching TNAs ready for RTEC:', error);
      res.status(500).json({
         success: false,
         message: 'Failed to fetch TNAs ready for RTEC',
         error: error.message
      });
   }
};

// Get TNAs that need document submission (signed by RD but no documents submitted)
const getTNAsNeedingDocuments = async (req, res) => {
   try {
      const tnas = await TNA.find({ status: 'signed_by_rd' })
         .populate([
            { path: 'applicationId', select: 'applicationId enterpriseName status' },
            { path: 'proponentId', select: 'firstName lastName email' },
            { path: 'scheduledBy', select: 'firstName lastName email' }
         ])
         .sort({ rdSignedAt: -1 });

      // Check which TNAs need document submission
      const tnasNeedingDocuments = [];
      
      for (const tna of tnas) {
         const rtec = await RTEC.findOne({ tnaId: tna._id });
         
         if (!rtec || !rtec.preMeetingDocuments) {
            // No RTEC created yet or no documents initialized
            tnasNeedingDocuments.push(tna);
         } else {
            const allDocumentsSubmitted = rtec.preMeetingDocuments.every(doc => doc.isSubmitted);
            if (!allDocumentsSubmitted) {
               tnasNeedingDocuments.push(tna);
            }
         }
      }

      res.json({
         success: true,
         data: tnasNeedingDocuments
      });

   } catch (error) {
      console.error('Error fetching TNAs needing documents:', error);
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
            status: 'draft',
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

// Debug endpoint to check TNA data
const debugTNAData = async (req, res) => {
   try {
      console.log('=== DEBUG TNA DATA ===');
      
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
   debugTNAData
};
