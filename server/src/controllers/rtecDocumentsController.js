const RTECDocuments = require('../models/RTECDocuments');
const TNA = require('../models/TNA');
const SETUPApplication = require('../models/SETUPApplication');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Request RTEC documents from PSTO
const requestRTECDocuments = async (req, res) => {
   try {
      const { tnaId } = req.params;
      const userId = req.user.id;

      console.log('=== REQUEST RTEC DOCUMENTS DEBUG ===');
      console.log('TNA ID:', tnaId);
      console.log('User ID:', userId);

      // Validate TNA ID
      if (!mongoose.Types.ObjectId.isValid(tnaId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid TNA ID'
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

      console.log('TNA found:', !!tna);
      console.log('TNA status:', tna.status);
      console.log('TNA signedTnaReport:', tna.signedTnaReport);
      console.log('Application ID:', tna.applicationId?._id);
      console.log('Proponent ID:', tna.proponentId?._id);

      // Check if TNA is in the correct status (signed_by_rd) or has signed TNA report
      if (tna.status !== 'signed_by_rd' && !tna.signedTnaReport) {
         console.log('TNA status check failed');
         return res.status(400).json({
            success: false,
            message: 'TNA must be signed by RD before requesting RTEC documents'
         });
      }

      console.log('TNA status check passed');

      // Check if RTEC documents already requested
      const existingRequest = await RTECDocuments.findOne({ tnaId });
      if (existingRequest) {
         console.log('RTEC documents already exist');
         return res.status(400).json({
            success: false,
            message: 'RTEC documents already requested for this TNA'
         });
      }

      console.log('No existing RTEC request found');

      // Create RTEC documents request
      console.log('Creating RTEC documents...');
      const rtecDocuments = new RTECDocuments({
         tnaId: tna._id,
         applicationId: tna.applicationId._id,
         proponentId: tna.proponentId._id,
         programName: tna.programName,
         requestedBy: userId,
         status: 'documents_requested',
         dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      });

      console.log('RTEC documents object created');

      // Initialize default document types (this also saves the document)
      console.log('Initializing document types...');
      await rtecDocuments.initializeDocumentTypes();
      console.log('Document types initialized and saved');

      // Update TNA status
      console.log('Updating TNA status...');
      await tna.requestRTECDocuments(userId);
      console.log('TNA status updated');

      // Create notification for PSTO
      console.log('Creating notification...');
      console.log('TNA scheduledBy:', tna.scheduledBy);
      console.log('Application companyName:', tna.applicationId?.companyName);
      
      if (tna.scheduledBy) {
         await Notification.create({
            recipientId: tna.scheduledBy, // PSTO who scheduled the TNA
            recipientType: 'psto',
            type: 'rtec_document_request',
            title: 'RTEC Documents Requested',
            message: `DOST-MIMAROPA has requested RTEC documents for ${tna.applicationId?.companyName || 'the application'}`,
            data: {
               tnaId: tna._id,
               applicationId: tna.applicationId?._id,
               rtecDocumentsId: rtecDocuments._id
            }
         });
         console.log('Notification created');
      } else {
         console.log('No scheduledBy found, skipping notification');
      }

      console.log('RTEC documents requested successfully');

      res.json({
         success: true,
         message: 'RTEC documents requested successfully',
         data: rtecDocuments
      });

   } catch (error) {
      console.error('=== RTEC REQUEST ERROR ===');
      console.error('Error requesting RTEC documents:', error);
      console.error('Error stack:', error.stack);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message,
         stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
   }
};

// Get RTEC documents by TNA ID
const getRTECDocumentsByTNA = async (req, res) => {
   try {
      const { tnaId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(tnaId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid TNA ID'
         });
      }

      const rtecDocuments = await RTECDocuments.findOne({ tnaId })
         .populate('tnaId')
         .populate('applicationId')
         .populate('proponentId')
         .populate('requestedBy')
         .populate('submittedBy')
         .populate('reviewedBy')
         .populate('partialdocsrtec.uploadedBy')
         .populate('partialdocsrtec.reviewedBy')
         .populate('additionalDocumentsRequired.uploadedBy')
         .populate('additionalDocumentsRequired.reviewedBy');

      if (!rtecDocuments) {
         return res.status(404).json({
            success: false,
            message: 'RTEC documents not found'
         });
      }

      console.log('🔍 RTEC Documents API Response Debug:');
      console.log('   Regular documents count:', rtecDocuments.partialdocsrtec?.length || 0);
      console.log('   Additional documents count:', rtecDocuments.additionalDocumentsRequired?.length || 0);
      console.log('   Additional documents details:', rtecDocuments.additionalDocumentsRequired);

      res.json({
         success: true,
         data: rtecDocuments
      });

   } catch (error) {
      console.error('Error fetching RTEC documents:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Submit RTEC document
const submitRTECDocument = async (req, res) => {
   try {
      const { tnaId } = req.params;
      const { documentType } = req.body;
      const userId = req.user.id;

      console.log('=== SUBMIT RTEC DOCUMENT DEBUG ===');
      console.log('TNA ID:', tnaId);
      console.log('Document Type:', documentType);
      console.log('User ID:', userId);
      console.log('File:', req.file);
      console.log('Request Body:', req.body);

      if (!req.file) {
         return res.status(400).json({
            success: false,
            message: 'No file uploaded'
         });
      }

      // Validate TNA ID
      if (!mongoose.Types.ObjectId.isValid(tnaId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid TNA ID'
         });
      }

      // Find RTEC documents
      const rtecDocuments = await RTECDocuments.findOne({ tnaId });
      if (!rtecDocuments) {
         return res.status(404).json({
            success: false,
            message: 'RTEC documents request not found'
         });
      }

      // Check if document type is valid (use the same enum values as the model)
      const validDocumentTypes = [
         'approved tna report', 
         'risk management plan', 
         'financial statements', 
         'letter of intent', 
         'duly accomplishment DOST TNA Form 001', 
         'duly accomplishment DOST TNA Form 02', 
         'proposal using SETUP FORM 001', 
         'copy of the business permit and licenses', 
         'certificate of registration with DTI/SEC/CDA', 
         'photocopy of the official receipt of the firm', 
         'articles of incorporation for cooperatives and association as proponent', 
         'board legislative council resolution', 
         'sworn affidavit', 
         'projected financial statements', 
         'complete technical specifications and design/drawing/picture of equipment',
         'three quotations from suppliers/fabricators for each equipment to be acquired',
         'response to rtec comments'
      ];
      if (!validDocumentTypes.includes(documentType)) {
         console.log('Invalid document type:', documentType);
         console.log('Valid types:', validDocumentTypes);
         return res.status(400).json({
            success: false,
            message: 'Invalid document type'
         });
      }

      // Prepare file data
      const fileData = {
         filename: req.file.filename,
         originalName: req.file.originalname,
         path: req.file.path,
         size: req.file.size,
         mimetype: req.file.mimetype
      };

      // Submit document
      await rtecDocuments.submitDocument(documentType, fileData, userId);

      // Update TNA status if all documents are submitted
      if (rtecDocuments.status === 'documents_submitted') {
         const tna = await TNA.findById(tnaId);
         await tna.markRTECDocumentsSubmitted(userId);

         // Create notification for DOST-MIMAROPA
         await Notification.create({
            recipientId: rtecDocuments.requestedBy,
            recipientType: 'dost_mimaropa',
            type: 'rtec_document_request',
            title: 'RTEC Documents Submitted',
            message: `PSTO has submitted all required RTEC documents for review`,
            data: {
               tnaId: tnaId,
               rtecDocumentsId: rtecDocuments._id
            }
         });
      }

      console.log('RTEC document submitted successfully');

      res.json({
         success: true,
         message: 'Document submitted successfully',
         data: rtecDocuments
      });

   } catch (error) {
      console.error('Error submitting RTEC document:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Review RTEC document (approve/reject)
const reviewRTECDocument = async (req, res) => {
   try {
      const { tnaId } = req.params;
      const { documentType, action, comments } = req.body; // action: 'approve' or 'reject'
      const userId = req.user.id;

      console.log('=== REVIEW RTEC DOCUMENT DEBUG ===');
      console.log('TNA ID:', tnaId);
      console.log('Document Type:', documentType);
      console.log('Action:', action);
      console.log('User ID:', userId);

      // Validate inputs
      if (!mongoose.Types.ObjectId.isValid(tnaId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid TNA ID'
         });
      }

      if (!['approve', 'reject'].includes(action)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid action. Must be "approve" or "reject"'
         });
      }

      // Find RTEC documents
      const rtecDocuments = await RTECDocuments.findOne({ tnaId });
      if (!rtecDocuments) {
         return res.status(404).json({
            success: false,
            message: 'RTEC documents not found'
         });
      }

      // Check if the specific document is submitted (check both regular and additional documents)
      let document = rtecDocuments.partialdocsrtec.find(doc => doc.type === documentType);
      let isAdditionalDocument = false;
      
      if (!document) {
         // Check if it's an additional document
         document = rtecDocuments.additionalDocumentsRequired.find(doc => doc.type === documentType);
         isAdditionalDocument = true;
      }
      
      if (!document) {
         return res.status(404).json({
            success: false,
            message: 'Document type not found'
         });
      }

      if (document.documentStatus !== 'submitted') {
         return res.status(400).json({
            success: false,
            message: 'This document must be submitted before it can be reviewed'
         });
      }

      // Update document review status
      if (action === 'approve') {
         if (isAdditionalDocument) {
            // Handle additional document approval
            await rtecDocuments.approveAdditionalDocument(documentType, userId, comments);
         } else {
            await rtecDocuments.approveDocument(documentType, userId, comments);
         }
      } else {
         if (isAdditionalDocument) {
            // Handle additional document rejection
            await rtecDocuments.rejectAdditionalDocument(documentType, userId, comments);
         } else {
            await rtecDocuments.rejectDocument(documentType, userId, comments);
         }
      }

      // Update TNA status based on overall document status
      const tna = await TNA.findById(tnaId);
      console.log('🔍 TNA found:', tna ? 'Yes' : 'No');
      console.log('🔍 RTEC Documents status:', rtecDocuments.status);
      console.log('🔍 Is additional document:', isAdditionalDocument);
      console.log('🔍 Document type:', documentType);
      
       if (rtecDocuments.status === 'documents_approved') {
          console.log('🔍 Updating TNA to rtec_documents_approved...');
          console.log('🔍 TNA before update:', tna.status);
          await tna.approveRTECDocuments(userId);
          console.log('🔍 TNA status updated to:', tna.status);
          console.log('🔍 TNA ID:', tna._id);
          
          // Check if this is a re-approval after revision
          const RTECMeeting = require('../models/RTECMeeting');
          const existingMeeting = await RTECMeeting.findOne({ tnaId: tnaId });
          
          console.log('🔍 Checking for existing meeting...');
          console.log('🔍 TNA ID:', tnaId);
          console.log('🔍 Existing meeting found:', existingMeeting ? 'Yes' : 'No');
          if (existingMeeting) {
             console.log('🔍 Meeting ID:', existingMeeting._id);
             console.log('🔍 Meeting status:', existingMeeting.status);
             console.log('🔍 Meeting rtecCompleted:', existingMeeting.rtecCompleted);
          }
          
          // Check if this is a re-approval after revision (any meeting that exists and is not completed)
          if (existingMeeting && existingMeeting.status === 'rtec_revision_requested') {
             console.log('🔍 Found existing meeting with revision status, making documents available for rescheduling...');
             console.log('🔍 Meeting ID:', existingMeeting._id);
             console.log('🔍 Meeting status:', existingMeeting.status);
             console.log('🔍 Documents are now approved and ready for next meeting scheduling');
             
             // Create notification for DOST-MIMAROPA to schedule next meeting
             const dostUsers = await User.find({ role: 'dost_mimaropa' });
             console.log('🔍 Found DOST users:', dostUsers.length);
             
             for (const dostUser of dostUsers) {
                console.log('🔍 Creating notification for DOST user:', dostUser._id);
                try {
                   await Notification.createNotification({
                      recipientId: dostUser._id,
                      recipientType: 'dost_mimaropa',
                      type: 'status_update',
                      title: 'Revised RTEC Documents Approved - Ready for Next Meeting',
                      message: `Revised RTEC documents for "${rtecDocuments.applicationId?.enterpriseName || 'Application'}" have been approved. Please schedule the next RTEC meeting.`,
                      relatedEntityType: 'rtec',
                      relatedEntityId: existingMeeting._id,
                      actionUrl: `/rtec-schedule-management`,
                      actionText: 'Schedule Next Meeting',
                      priority: 'high',
                      sentBy: userId
                   });
                   console.log('✅ Notification created successfully for user:', dostUser._id);
                } catch (notificationError) {
                   console.error('❌ Error creating notification:', notificationError);
                }
             }
          } else if (existingMeeting && existingMeeting.status === 'rtec_endorsed_for_approval') {
             console.log('🔍 Found existing meeting with endorsed for approval status, proceeding directly to funding...');
             console.log('🔍 Meeting ID:', existingMeeting._id);
             console.log('🔍 Meeting status:', existingMeeting.status);
             console.log('🔍 Documents approved after endorsement - proceeding to funding without new meeting');
             
             // Update meeting status to completed and mark as ready for funding
             await existingMeeting.updateOne({
                status: 'rtec_completed',
                rtecCompleted: true,
                rtecCompletedAt: new Date(),
                rtecCompletedBy: userId,
                fundingStatus: 'ready_for_funding'
             });
             
             // Update TNA status to ready for funding
             await tna.updateOne({ status: 'ready_for_funding' });
             
             // Create notification for proponent about funding readiness
             await Notification.createNotification({
                recipientId: tna.proponentId,
                recipientType: 'proponent',
                type: 'status_update',
                title: 'Application Ready for Funding',
                message: `Your application "${rtecDocuments.applicationId?.enterpriseName || 'Application'}" has been approved and is now ready for funding.`,
                relatedEntityType: 'tna',
                relatedEntityId: tnaId,
                actionUrl: `/applications`,
                actionText: 'View Application',
                priority: 'high',
                sentBy: userId
             });
             
             // Create notification for DOST-MIMAROPA about funding readiness
             const dostUsers = await User.find({ role: 'dost_mimaropa' });
             for (const dostUser of dostUsers) {
                await Notification.createNotification({
                   recipientId: dostUser._id,
                   recipientType: 'dost_mimaropa',
                   type: 'status_update',
                   title: 'Application Ready for Funding',
                   message: `Application "${rtecDocuments.applicationId?.enterpriseName || 'Application'}" has completed RTEC evaluation and is ready for funding.`,
                   relatedEntityType: 'tna',
                   relatedEntityId: tnaId,
                   actionUrl: `/applications`,
                   actionText: 'View Application',
                   priority: 'high',
                   sentBy: userId
                });
             }
          } else if (existingMeeting) {
             console.log('🔍 Meeting exists but may not need rescheduling:', existingMeeting.status);
          } else {
             console.log('🔍 No existing meeting found - this is a new approval');
          }
       } else if (rtecDocuments.status === 'documents_rejected') {
         console.log('🔍 Updating TNA to rtec_documents_rejected...');
         console.log('🔍 TNA before update:', tna.status);
         await tna.rejectRTECDocuments(userId);
         console.log('🔍 TNA status updated to:', tna.status);
         console.log('🔍 TNA ID:', tna._id);
      } else {
         console.log('🔍 Updating TNA to rtec_documents_under_review...');
         console.log('🔍 TNA before update:', tna.status);
         await tna.markRTECDocumentsUnderReview(userId);
         console.log('🔍 TNA status updated to:', tna.status);
         console.log('🔍 TNA ID:', tna._id);
      }

      // Create notification for PSTO
      const notificationType = action === 'approve' ? 'status_update' : 'status_update';
      const notificationTitle = action === 'approve' ? 'RTEC Document Approved' : 'RTEC Document Rejected';
      const notificationMessage = action === 'approve' 
         ? `Your ${documentType} has been approved by DOST-MIMAROPA`
         : `Your ${documentType} has been rejected by DOST-MIMAROPA. Please review and resubmit.`;

      await Notification.create({
         recipientId: rtecDocuments.submittedBy || rtecDocuments.proponentId,
         recipientType: 'psto',
         type: notificationType,
         title: notificationTitle,
         message: notificationMessage,
         relatedEntityType: 'tna',
         relatedEntityId: tnaId,
         actionUrl: `/rtec-documents`,
         actionText: 'View Details',
         priority: 'high',
         sentBy: userId
      });

      console.log('RTEC document reviewed successfully');

      res.json({
         success: true,
         message: `Document ${action}d successfully`,
         data: rtecDocuments
      });

   } catch (error) {
      console.error('Error reviewing RTEC document:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// List all RTEC documents (for DOST-MIMAROPA dashboard)
const listRTECDocuments = async (req, res) => {
   try {
      const { status, page = 1, limit = 10 } = req.query;

      const query = {};
      if (status) {
         query.status = status;
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const rtecDocuments = await RTECDocuments.find(query)
         .populate('tnaId', 'scheduledDate location programName status')
         .populate('applicationId', 'enterpriseName projectTitle programName businessActivity')
         .populate('proponentId', 'firstName lastName email')
         .populate('requestedBy', 'firstName lastName')
         .populate('submittedBy', 'firstName lastName')
         .populate('reviewedBy', 'firstName lastName')
         .sort({ requestedAt: -1 })
         .skip(skip)
         .limit(limitNum);

      const total = await RTECDocuments.countDocuments(query);

      console.log('=== LIST RTEC DOCUMENTS DEBUG ===');
      console.log('Query:', query);
      console.log('Total found:', total);
      console.log('Documents found:', rtecDocuments.length);
      
      // Debug each document's populated fields
      rtecDocuments.forEach((doc, index) => {
         console.log(`\n--- Document ${index} ---`);
         console.log('ID:', doc._id);
         console.log('Status:', doc.status);
         console.log('ApplicationId populated:', doc.applicationId);
         console.log('ProponentId populated:', doc.proponentId);
         console.log('TnaId populated:', doc.tnaId);
      });
      
      rtecDocuments.forEach((doc, index) => {
         console.log(`Document ${index + 1}:`, {
            id: doc._id,
            status: doc.status,
            applicationId: doc.applicationId ? {
               _id: doc.applicationId._id,
               enterpriseName: doc.applicationId.enterpriseName,
               companyName: doc.applicationId.companyName,
               projectTitle: doc.applicationId.projectTitle,
               programName: doc.applicationId.programName
            } : null,
            proponentId: doc.proponentId ? {
               _id: doc.proponentId._id,
               firstName: doc.proponentId.firstName,
               lastName: doc.proponentId.lastName
            } : null,
            requestedAt: doc.requestedAt,
            dueDate: doc.dueDate
         });
      });

      res.json({
         success: true,
         data: {
            docs: rtecDocuments,
            totalDocs: total,
            limit: limitNum,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            hasNextPage: pageNum < Math.ceil(total / limitNum),
            hasPrevPage: pageNum > 1
         }
      });

   } catch (error) {
      console.error('Error listing RTEC documents:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Get approved RTEC documents (for scheduling meetings)
const getApprovedRTECDocuments = async (req, res) => {
   try {
      const { page = 1, limit = 10 } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      console.log('=== GET APPROVED RTEC DOCUMENTS ===');
      console.log('Page:', pageNum, 'Limit:', limitNum);

      // Query for documents that are approved and ready for scheduling
      // Include both documents_approved and additional_documents_required statuses
      const query = { 
         status: { $in: ['documents_approved', 'additional_documents_required'] }
      };
      console.log('🔍 Query for documents approved and ready for scheduling:', query);

      const rtecDocuments = await RTECDocuments.find(query)
         .populate('tnaId', 'scheduledDate location programName status')
         .populate('applicationId', 'enterpriseName projectTitle programName businessActivity')
         .populate('proponentId', 'firstName lastName email')
         .populate('requestedBy', 'firstName lastName')
         .populate('submittedBy', 'firstName lastName')
         .populate('reviewedBy', 'firstName lastName')
         .sort({ reviewedAt: -1 }) // Sort by review date (most recently approved first)
         .skip(skip)
         .limit(limitNum);

      // Filter to show approved documents that are ready for scheduling
      const RTECMeeting = require('../models/RTECMeeting');
      const filteredDocuments = [];
      
      console.log('🔍 FILTERING LOGIC: Processing approved documents for scheduling...');
      
      for (const doc of rtecDocuments) {
         const rtecMeeting = await RTECMeeting.findOne({ tnaId: doc.tnaId });
         
         console.log('🔍 Processing document:', doc._id, 'Status:', doc.status, 'Meeting exists:', rtecMeeting ? 'Yes' : 'No');
         
         if (doc.status === 'documents_approved' || doc.status === 'additional_documents_required') {
            // Check if meeting exists
            if (!rtecMeeting) {
               // No meeting yet, this is a new approved document or document with additional requirements
               filteredDocuments.push(doc);
               console.log('✅ Including NEW approved document (no meeting yet):', doc._id, 'Status:', doc.status);
            } else if (rtecMeeting.status === 'rtec_revision_requested') {
               // Meeting exists with revision status, documents have been re-approved after revision
               filteredDocuments.push(doc);
               console.log('✅ Including RE-APPROVED document (ready for next meeting):', doc._id, 'Meeting status:', rtecMeeting.status, 'Doc status:', doc.status);
            } else if (rtecMeeting.status === 'rtec_endorsed_for_approval') {
               // Meeting exists with endorsed for approval status - these should NOT be scheduled
               // They go directly to RTEC Completed without needing another meeting
               console.log('❌ EXCLUDING endorsed document (goes directly to RTEC Completed):', doc._id, 'Meeting status:', rtecMeeting.status, 'Doc status:', doc.status);
            } else if (rtecMeeting.status !== 'rtec_completed' && !rtecMeeting.rtecCompleted) {
               // Meeting exists but not completed yet, include for potential rescheduling
               filteredDocuments.push(doc);
               console.log('✅ Including approved document (meeting in progress):', doc._id, 'Meeting status:', rtecMeeting.status, 'Doc status:', doc.status);
            } else {
               console.log('❌ Filtering out completed document:', doc._id, 'Meeting status:', rtecMeeting?.status, 'Doc status:', doc.status);
            }
         } else {
            console.log('❌ Filtering out non-approved document:', doc._id, 'Status:', doc.status);
         }
      }
      
      console.log('🔍 Approved documents ready for scheduling:', filteredDocuments.length);
      
      // Debug: Log each document and its meeting status
      console.log('🔍 DETAILED DEBUG - Each document and its meeting:');
      for (const doc of rtecDocuments) {
         const rtecMeeting = await RTECMeeting.findOne({ tnaId: doc.tnaId });
         console.log(`Document ${doc._id}:`);
         console.log(`  - Status: ${doc.status}`);
         console.log(`  - TNA ID: ${doc.tnaId}`);
         console.log(`  - Enterprise: ${doc.applicationId?.enterpriseName}`);
         console.log(`  - Meeting exists: ${rtecMeeting ? 'Yes' : 'No'}`);
         if (rtecMeeting) {
            console.log(`  - Meeting ID: ${rtecMeeting._id}`);
            console.log(`  - Meeting status: ${rtecMeeting.status}`);
            console.log(`  - Meeting rtecCompleted: ${rtecMeeting.rtecCompleted}`);
         }
         console.log('  ---');
      }

      const total = await RTECDocuments.countDocuments(query);

      console.log('Approved documents found:', rtecDocuments.length);
      console.log('Filtered documents:', filteredDocuments.length);
      console.log('Total approved documents:', total);
      
      // Debug: Check all RTEC documents to see what statuses exist
      const allDocuments = await RTECDocuments.find({}).select('_id status tnaId applicationId revisionRequestedAt reviewedAt');
      console.log('🔍 All RTEC documents statuses:');
      allDocuments.forEach((doc, index) => {
         console.log(`Document ${index + 1}: ID=${doc._id}, Status=${doc.status}, TNA=${doc.tnaId}, App=${doc.applicationId}, RevisionRequestedAt=${doc.revisionRequestedAt}, ReviewedAt=${doc.reviewedAt}`);
      });
      
      // Debug: Check specifically for documents_approved status
      const approvedDocs = await RTECDocuments.find({ 
         status: 'documents_approved'
      }).select('_id status tnaId applicationId');
      console.log('🔍 Documents with documents_approved status:', approvedDocs.length);
      approvedDocs.forEach(async (doc, index) => {
         const rtecMeeting = await RTECMeeting.findOne({ tnaId: doc.tnaId });
         console.log(`Approved Document ${index + 1}: ID=${doc._id}, Status=${doc.status}, TNA=${doc.tnaId}, App=${doc.applicationId}, MeetingStatus=${rtecMeeting?.status}`);
      });

      // Debug each approved document
      filteredDocuments.forEach((doc, index) => {
         console.log(`\n--- Approved Document ${index + 1} ---`);
         console.log('ID:', doc._id);
         console.log('Status:', doc.status);
         console.log('Enterprise:', doc.applicationId?.enterpriseName);
         console.log('Proponent:', doc.proponentId?.firstName, doc.proponentId?.lastName);
         console.log('Reviewed At:', doc.reviewedAt);
         console.log('TNA Status:', doc.tnaId?.status);
         console.log('Documents to Revise:', doc.documentsToRevise);
         console.log('Revision Comments:', doc.revisionComments);
      });

      console.log('🔍 Final response data:');
      console.log('Success:', true);
      console.log('Total docs:', total);
      console.log('Returned docs:', rtecDocuments.length);
      console.log('Page info:', { page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
      
      // Additional debugging for TNA status
      console.log('🔍 Checking TNA statuses for returned documents:');
      for (const doc of filteredDocuments) {
         console.log(`🔍 Document ${doc._id}: TNA status = ${doc.tnaId?.status}, RTEC status = ${doc.status}`);
      }
      
      // Debug: Check if TNA status is rtec_documents_approved
      const tnaStatusCheck = await TNA.find({ status: 'rtec_documents_approved' }).select('_id status');
      console.log('🔍 TNAs with rtec_documents_approved status:', tnaStatusCheck.length);
      tnaStatusCheck.forEach((tna, index) => {
         console.log(`TNA ${index + 1}: ID=${tna._id}, Status=${tna.status}`);
      });
      
      // Debug: Check all TNA statuses
      const allTNAStatuses = await TNA.find({}).select('_id status');
      console.log('🔍 All TNA statuses:');
      allTNAStatuses.forEach((tna, index) => {
         console.log(`TNA ${index + 1}: ID=${tna._id}, Status=${tna.status}`);
      });
      
      res.json({
         success: true,
         data: {
            docs: filteredDocuments,
            totalDocs: filteredDocuments.length,
            limit: limitNum,
            page: pageNum,
            totalPages: Math.ceil(filteredDocuments.length / limitNum),
            hasNextPage: pageNum < Math.ceil(filteredDocuments.length / limitNum),
            hasPrevPage: pageNum > 1
         }
      });

   } catch (error) {
      console.error('Error fetching approved RTEC documents:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Get RTEC documents for PSTO (by user)
const getRTECDocumentsForPSTO = async (req, res) => {
   try {
      const userId = req.user.id;
      const { status, page = 1, limit = 10 } = req.query;

      // Find TNAs scheduled by this PSTO
      const tnas = await TNA.find({ scheduledBy: userId }).select('_id');
      const tnaIds = tnas.map(tna => tna._id);

      const query = { tnaId: { $in: tnaIds } };
      if (status) {
         query.status = status;
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      console.log('=== PSTO RTEC DOCUMENTS DEBUG ===');
      console.log('User ID:', userId);
      console.log('TNA IDs:', tnaIds);
      console.log('Query:', query);
      console.log('=== BEFORE POPULATION ===');
      
      const rtecDocuments = await RTECDocuments.find(query)
         .populate({
            path: 'tnaId',
            select: 'scheduledDate location programName status'
         })
         .populate({
            path: 'applicationId',
            select: 'enterpriseName projectTitle programName businessActivity'
         })
         .populate({
            path: 'proponentId', 
            select: 'firstName lastName email'
         })
         .populate({
            path: 'requestedBy',
            select: 'firstName lastName'
         })
         .populate({
            path: 'submittedBy',
            select: 'firstName lastName'
         })
         .populate({
            path: 'reviewedBy',
            select: 'firstName lastName'
         })
         .sort({ requestedAt: -1 })
         .skip(skip)
         .limit(limitNum);

      console.log('=== AFTER POPULATION ===');
      console.log('Found RTEC Documents:', rtecDocuments.length);
      rtecDocuments.forEach((doc, index) => {
         console.log(`Document ${index + 1}:`, {
            id: doc._id,
            status: doc.status,
            documentsToRevise: doc.documentsToRevise,
            revisionComments: doc.revisionComments,
            partialdocsrtec: doc.partialdocsrtec?.length || 0
         });
      });

      const total = await RTECDocuments.countDocuments(query);

      res.json({
         success: true,
         data: {
            docs: rtecDocuments,
            totalDocs: total,
            limit: limitNum,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            hasNextPage: pageNum < Math.ceil(total / limitNum),
            hasPrevPage: pageNum > 1
         }
      });

   } catch (error) {
      console.error('Error fetching RTEC documents for PSTO:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

module.exports = {
   requestRTECDocuments,
   getRTECDocumentsByTNA,
   submitRTECDocument,
   reviewRTECDocument,
   listRTECDocuments,
   getApprovedRTECDocuments,
   getRTECDocumentsForPSTO
};
