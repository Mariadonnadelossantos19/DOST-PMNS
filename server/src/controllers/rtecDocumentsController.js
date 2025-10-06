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
         .populate('partialdocsrtec.reviewedBy');

      if (!rtecDocuments) {
         return res.status(404).json({
            success: false,
            message: 'RTEC documents not found'
         });
      }

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
         'three quotations from suppliers/fabricators for each equipment to be acquired'
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

      // Check if the specific document is submitted
      const document = rtecDocuments.partialdocsrtec.find(doc => doc.type === documentType);
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
         await rtecDocuments.approveDocument(documentType, userId, comments);
      } else {
         await rtecDocuments.rejectDocument(documentType, userId, comments);
      }

      // Update TNA status based on overall document status
      const tna = await TNA.findById(tnaId);
      if (rtecDocuments.status === 'documents_approved') {
         await tna.approveRTECDocuments(userId);
      } else if (rtecDocuments.status === 'documents_rejected') {
         await tna.rejectRTECDocuments(userId);
      } else {
         await tna.markRTECDocumentsUnderReview(userId);
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
         .populate('tnaId', 'scheduledDate location programName')
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

      // Query only for approved documents
      const query = { status: 'documents_approved' };

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

      const total = await RTECDocuments.countDocuments(query);

      console.log('Approved documents found:', rtecDocuments.length);
      console.log('Total approved documents:', total);

      // Debug each approved document
      rtecDocuments.forEach((doc, index) => {
         console.log(`\n--- Approved Document ${index + 1} ---`);
         console.log('ID:', doc._id);
         console.log('Status:', doc.status);
         console.log('Enterprise:', doc.applicationId?.enterpriseName);
         console.log('Proponent:', doc.proponentId?.firstName, doc.proponentId?.lastName);
         console.log('Reviewed At:', doc.reviewedAt);
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
