const RefundDocuments = require('../models/RefundDocuments');
const TNA = require('../models/TNA');
const SETUPApplication = require('../models/SETUPApplication');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Request refund documents from PSTO
const requestRefundDocuments = async (req, res) => {
   try {
      const { tnaId } = req.params;
      const userId = req.user.id;

      console.log('=== REQUEST REFUND DOCUMENTS DEBUG ===');
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

      // Check if TNA is in the correct status (rtec_completed or other completed statuses)
      const validStatuses = ['rtec_completed', 'rtec_documents_approved', 'dost_mimaropa_approved'];
      if (!validStatuses.includes(tna.status)) {
         console.log('TNA status check failed');
         console.log('Expected statuses:', validStatuses);
         console.log('Actual status:', tna.status);
         return res.status(400).json({
            success: false,
            message: `TNA must be completed (RTEC status) before requesting refund documents. Current status: ${tna.status}`
         });
      }

      console.log('TNA status check passed');

      // Check if refund documents already requested
      const existingRequest = await RefundDocuments.findOne({ tnaId });
      if (existingRequest) {
         console.log('Refund documents already exist');
         return res.status(400).json({
            success: false,
            message: 'Refund documents already requested for this TNA'
         });
      }

      // Create refund documents request
      const refundDocuments = new RefundDocuments({
         tnaId: tna._id,
         applicationId: tna.applicationId._id,
         proponentId: tna.proponentId._id,
         programName: tna.programName || 'SETUP',
         requestedBy: userId,
         status: 'documents_requested',
         dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      });

      // Initialize default refund document types
      await refundDocuments.initializeRefundDocumentTypes();

      console.log('Refund documents created successfully');

      // Create notification for PSTO
      try {
         await Notification.create({
            recipientId: tna.proponentId._id,
            recipientType: 'proponent',
            type: 'refund_document_request',
            title: 'Refund Documents Requested',
            message: `Refund documents have been requested for your application. Please coordinate with PSTO to submit the required documents.`,
            data: {
               tnaId: tnaId,
               refundDocumentsId: refundDocuments._id
            }
         });
         console.log('Notification created successfully');
      } catch (notificationError) {
         console.error('Error creating notification:', notificationError);
         // Don't fail the entire request if notification creation fails
      }

      res.json({
         success: true,
         message: 'Refund documents request created successfully',
         data: refundDocuments
      });

   } catch (error) {
      console.error('Error requesting refund documents:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Get refund documents by TNA ID
const getRefundDocumentsByTNA = async (req, res) => {
   try {
      const { tnaId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(tnaId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid TNA ID'
         });
      }

      const refundDocuments = await RefundDocuments.findOne({ tnaId })
         .populate('tnaId')
         .populate('applicationId')
         .populate('proponentId')
         .populate('requestedBy')
         .populate('submittedBy')
         .populate('reviewedBy');

      if (!refundDocuments) {
         return res.status(404).json({
            success: false,
            message: 'Refund documents not found'
         });
      }

      res.json({
         success: true,
         data: refundDocuments
      });

   } catch (error) {
      console.error('Error fetching refund documents:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Get refund document by ID
const getRefundDocumentById = async (req, res) => {
   try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid refund document ID'
         });
      }

      const refundDocument = await RefundDocuments.findById(id)
         .populate('tnaId')
         .populate('applicationId')
         .populate('proponentId')
         .populate('requestedBy')
         .populate('submittedBy')
         .populate('reviewedBy');

      if (!refundDocument) {
         return res.status(404).json({
            success: false,
            message: 'Refund document not found'
         });
      }

      res.json({
         success: true,
         data: refundDocument
      });

   } catch (error) {
      console.error('Error fetching refund document:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Submit refund document
const submitRefundDocument = async (req, res) => {
   try {
      const { tnaId } = req.params;
      const { documentType } = req.body;
      const userId = req.user.id;

      console.log('=== SUBMIT REFUND DOCUMENT DEBUG ===');
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

      // Find refund documents
      const refundDocuments = await RefundDocuments.findOne({ tnaId });
      if (!refundDocuments) {
         return res.status(404).json({
            success: false,
            message: 'Refund documents request not found'
         });
      }

      // Check if document type is valid (use the same enum values as the model)
      const validDocumentTypes = [
         'partial_budget_analysis',
         'rtec_report',
         'approval_letter',
         'bank_account',
         'moa',
         'promissory_notes',
         'form_008',
         'certification_from_the_dost_agency',
         'acknowledgment_reciept',
         'csf'
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
      await refundDocuments.submitDocument(documentType, fileData, userId);

      // Update TNA status if all documents are submitted
      if (refundDocuments.status === 'documents_submitted') {
         const tna = await TNA.findById(tnaId);
         await tna.markRefundDocumentsSubmitted(userId);

         // Create notification for DOST-MIMAROPA
         await Notification.create({
            recipientId: refundDocuments.requestedBy,
            recipientType: 'dost_mimaropa',
            type: 'refund_document_request',
            title: 'Refund Documents Submitted',
            message: `PSTO has submitted all required refund documents for review`,
            data: {
               tnaId: tnaId,
               refundDocumentsId: refundDocuments._id
            }
         });
      }

      console.log('Refund document submitted successfully');

      res.json({
         success: true,
         message: 'Document submitted successfully',
         data: refundDocuments
      });

   } catch (error) {
      console.error('Error submitting refund document:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Review refund document (approve/reject)
const reviewRefundDocument = async (req, res) => {
   try {
      const { tnaId } = req.params;
      const { documentType, action, comments } = req.body; // action: 'approve' or 'reject'
      const userId = req.user.id;

      console.log('=== REVIEW REFUND DOCUMENT DEBUG ===');
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

      // Find refund documents
      const refundDocuments = await RefundDocuments.findOne({ tnaId });
      if (!refundDocuments) {
         return res.status(404).json({
            success: false,
            message: 'Refund documents not found'
         });
      }

      // Check if the specific document is submitted (check both regular and additional documents)
      let document = refundDocuments.refundDocuments.find(doc => doc.type === documentType);
      let isAdditionalDocument = false;
      
      if (!document) {
         // Check if it's an additional document
         document = refundDocuments.additionalDocumentsRequired.find(doc => doc.type === documentType);
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
            message: 'Document must be submitted before review'
         });
      }

      // Review document
      if (action === 'approve') {
         if (isAdditionalDocument) {
            await refundDocuments.approveAdditionalDocument(documentType, userId, comments);
         } else {
            await refundDocuments.approveDocument(documentType, userId, comments);
         }
      } else if (action === 'reject') {
         if (isAdditionalDocument) {
            await refundDocuments.rejectAdditionalDocument(documentType, userId, comments);
         } else {
            await refundDocuments.rejectDocument(documentType, userId, comments);
         }
      }

      // Create notification for PSTO
      await Notification.create({
         recipientId: refundDocuments.proponentId,
         recipientType: 'proponent',
         type: 'refund_document_review',
         title: `Refund Document ${action === 'approve' ? 'Approved' : 'Rejected'}`,
         message: `Your refund document "${document.name}" has been ${action === 'approve' ? 'approved' : 'rejected'}. ${comments ? `Comments: ${comments}` : ''}`,
         data: {
            tnaId: tnaId,
            refundDocumentsId: refundDocuments._id,
            documentType: documentType,
            action: action
         }
      });

      console.log(`Refund document ${action}ed successfully`);

      res.json({
         success: true,
         message: `Document ${action}ed successfully`,
         data: refundDocuments
      });

   } catch (error) {
      console.error(`Error ${req.body.action}ing refund document:`, error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// List all refund documents (for DOST-MIMAROPA)
const listRefundDocuments = async (req, res) => {
   try {
      const { page = 1, limit = 10, status, search } = req.query;
      const skip = (page - 1) * limit;

      // Build filter
      const filter = {};
      if (status) {
         filter.status = status;
      }
      if (search) {
         filter.$or = [
            { 'applicationId.enterpriseName': { $regex: search, $options: 'i' } },
            { 'applicationId.projectTitle': { $regex: search, $options: 'i' } }
         ];
      }

      const refundDocuments = await RefundDocuments.find(filter)
         .populate('tnaId')
         .populate('applicationId')
         .populate('proponentId')
         .populate('requestedBy')
         .populate('submittedBy')
         .populate('reviewedBy')
         .sort({ createdAt: -1 })
         .skip(skip)
         .limit(parseInt(limit));

      const total = await RefundDocuments.countDocuments(filter);

      res.json({
         success: true,
         data: {
            docs: refundDocuments,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
         }
      });

   } catch (error) {
      console.error('Error listing refund documents:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Get approved refund documents
const getApprovedRefundDocuments = async (req, res) => {
   try {
      const refundDocuments = await RefundDocuments.find({ status: 'documents_approved' })
         .populate('tnaId')
         .populate('applicationId')
         .populate('proponentId')
         .populate('requestedBy')
         .populate('submittedBy')
         .populate('reviewedBy')
         .sort({ reviewedAt: -1 });

      res.json({
         success: true,
         data: refundDocuments
      });

   } catch (error) {
      console.error('Error fetching approved refund documents:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Get refund documents for PSTO
const getRefundDocumentsForPSTO = async (req, res) => {
   try {
      const { page = 1, limit = 10, status, search } = req.query;
      const skip = (page - 1) * limit;
      const userId = req.user.id;

      // Get PSTO user's province
      const User = require('../models/User');
      const pstoUser = await User.findById(userId);
      if (!pstoUser) {
         return res.status(404).json({
            success: false,
            message: 'PSTO user not found'
         });
      }

      console.log('🔍 PSTO User Province:', pstoUser.province);

      // First, let's get all refund documents and then filter by province
      let allRefundDocuments = await RefundDocuments.find({})
         .populate('tnaId')
         .populate('applicationId')
         .populate('proponentId')
         .populate('requestedBy')
         .populate('submittedBy')
         .populate('reviewedBy')
         .sort({ createdAt: -1 });

      console.log('🔍 All Refund Documents:', allRefundDocuments.length);

      // Filter by PSTO's province - check the proponent's province
      const filteredDocuments = allRefundDocuments.filter(doc => {
         const proponentProvince = doc.proponentId?.province;
         console.log(`🔍 Document ${doc._id}:`);
         console.log(`  - Application ID: ${doc.applicationId?._id}`);
         console.log(`  - Proponent ID: ${doc.proponentId?._id}`);
         console.log(`  - Proponent Province: ${proponentProvince}`);
         console.log(`  - PSTO Province: ${pstoUser.province}`);
         console.log(`  - Proponent Data:`, JSON.stringify(doc.proponentId, null, 2));
         console.log(`  - Match: ${proponentProvince === pstoUser.province}`);
         return proponentProvince === pstoUser.province;
      });

      console.log('🔍 Filtered Documents for PSTO:', filteredDocuments.length);

      // Apply additional filters
      let finalDocuments = filteredDocuments;
      
      if (status) {
         finalDocuments = finalDocuments.filter(doc => doc.status === status);
      }
      if (search) {
         finalDocuments = finalDocuments.filter(doc => {
            const enterpriseName = doc.applicationId?.enterpriseName || '';
            const projectTitle = doc.applicationId?.projectTitle || '';
            return enterpriseName.toLowerCase().includes(search.toLowerCase()) ||
                   projectTitle.toLowerCase().includes(search.toLowerCase());
         });
      }

      console.log('🔍 Final Documents for PSTO:', finalDocuments.length);

      // Apply pagination
      const startIndex = skip;
      const endIndex = startIndex + parseInt(limit);
      const paginatedDocuments = finalDocuments.slice(startIndex, endIndex);

      console.log('🔍 Paginated Documents for PSTO:', paginatedDocuments.length);

      res.json({
         success: true,
         data: {
            docs: paginatedDocuments,
            total: finalDocuments.length,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(finalDocuments.length / limit)
         }
      });

   } catch (error) {
      console.error('Error fetching refund documents for PSTO:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Complete refund process
const completeRefund = async (req, res) => {
   try {
      const { tnaId } = req.params;
      const userId = req.user.id;

      console.log('=== COMPLETE REFUND DEBUG ===');
      console.log('TNA ID:', tnaId);
      console.log('User ID:', userId);

      // Validate TNA ID
      if (!mongoose.Types.ObjectId.isValid(tnaId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid TNA ID'
         });
      }

      // Find refund documents
      const refundDocuments = await RefundDocuments.findOne({ tnaId });
      if (!refundDocuments) {
         return res.status(404).json({
            success: false,
            message: 'Refund documents not found'
         });
      }

      // Check if all documents are approved
      if (refundDocuments.status !== 'documents_approved') {
         return res.status(400).json({
            success: false,
            message: 'All documents must be approved before completing refund'
         });
      }

      // Complete refund
      await refundDocuments.completeRefund(userId);

      // Create notification for proponent
      await Notification.create({
         recipientId: refundDocuments.proponentId,
         recipientType: 'proponent',
         type: 'refund_completed',
         title: 'Refund Process Completed',
         message: `Your refund process has been completed successfully.`,
         data: {
            tnaId: tnaId,
            refundDocumentsId: refundDocuments._id
         }
      });

      console.log('Refund completed successfully');

      res.json({
         success: true,
         message: 'Refund process completed successfully',
         data: refundDocuments
      });

   } catch (error) {
      console.error('Error completing refund:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

module.exports = {
   requestRefundDocuments,
   getRefundDocumentsByTNA,
   getRefundDocumentById,
   submitRefundDocument,
   reviewRefundDocument,
   listRefundDocuments,
   getApprovedRefundDocuments,
   getRefundDocumentsForPSTO,
   completeRefund
};
