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

      // Check if TNA is in the correct status (signed_by_rd) or has signed TNA report
      if (tna.status !== 'signed_by_rd' && !tna.signedTnaReport) {
         return res.status(400).json({
            success: false,
            message: 'TNA must be signed by RD before requesting RTEC documents'
         });
      }

      // Check if RTEC documents already requested
      const existingRequest = await RTECDocuments.findOne({ tnaId });
      if (existingRequest) {
         return res.status(400).json({
            success: false,
            message: 'RTEC documents already requested for this TNA'
         });
      }

      // Create RTEC documents request
      const rtecDocuments = new RTECDocuments({
         tnaId: tna._id,
         applicationId: tna.applicationId._id,
         proponentId: tna.proponentId._id,
         programName: tna.programName,
         requestedBy: userId,
         status: 'documents_requested',
         dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      });

      // Initialize default document types
      await rtecDocuments.initializeDocumentTypes();

      // Update TNA status
      await tna.requestRTECDocuments(userId);

      // Create notification for PSTO
      await Notification.create({
         userId: tna.scheduledBy, // PSTO who scheduled the TNA
         type: 'rtec_documents_requested',
         title: 'RTEC Documents Requested',
         message: `DOST-MIMAROPA has requested RTEC documents for ${tna.applicationId.companyName}`,
         data: {
            tnaId: tna._id,
            applicationId: tna.applicationId._id,
            rtecDocumentsId: rtecDocuments._id
         }
      });

      console.log('RTEC documents requested successfully');

      res.json({
         success: true,
         message: 'RTEC documents requested successfully',
         data: rtecDocuments
      });

   } catch (error) {
      console.error('Error requesting RTEC documents:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
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
      const { tnaId, documentType: rawDocumentType } = req.params;
      const documentType = decodeURIComponent(rawDocumentType);
      const userId = req.user.id;

      console.log('=== SUBMIT RTEC DOCUMENT DEBUG ===');
      console.log('TNA ID:', tnaId);
      console.log('Document Type:', documentType);
      console.log('User ID:', userId);
      console.log('File:', req.file);

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

      // Check if document type is valid
      const validDocumentTypes = ['approved tna report', 'risk management plan', 'financial statements'];
      if (!validDocumentTypes.includes(documentType)) {
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
            userId: rtecDocuments.requestedBy,
            type: 'rtec_documents_submitted',
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
      const { tnaId, documentType: rawDocumentType } = req.params;
      const documentType = decodeURIComponent(rawDocumentType);
      const { action, comments } = req.body; // action: 'approve' or 'reject'
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

      // Check if documents are submitted
      if (rtecDocuments.status !== 'documents_submitted' && rtecDocuments.status !== 'documents_under_review') {
         return res.status(400).json({
            success: false,
            message: 'Documents must be submitted before review'
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
      const notificationType = action === 'approve' ? 'rtec_document_approved' : 'rtec_document_rejected';
      const notificationTitle = action === 'approve' ? 'RTEC Document Approved' : 'RTEC Document Rejected';
      const notificationMessage = action === 'approve' 
         ? `Your ${documentType} has been approved by DOST-MIMAROPA`
         : `Your ${documentType} has been rejected by DOST-MIMAROPA. Please review and resubmit.`;

      await Notification.create({
         userId: rtecDocuments.submittedBy || rtecDocuments.proponentId,
         type: notificationType,
         title: notificationTitle,
         message: notificationMessage,
         data: {
            tnaId: tnaId,
            rtecDocumentsId: rtecDocuments._id,
            documentType: documentType,
            comments: comments
         }
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
         .populate('applicationId', 'enterpriseName companyName projectTitle programName businessActivity')
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

      const rtecDocuments = await RTECDocuments.find(query)
         .populate('tnaId', 'scheduledDate location programName status')
         .populate('applicationId', 'enterpriseName companyName projectTitle programName businessActivity')
         .populate('proponentId', 'firstName lastName email')
         .populate('requestedBy', 'firstName lastName')
         .populate('submittedBy', 'firstName lastName')
         .populate('reviewedBy', 'firstName lastName')
         .sort({ requestedAt: -1 })
         .skip(skip)
         .limit(limitNum);

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
   getRTECDocumentsForPSTO
};
