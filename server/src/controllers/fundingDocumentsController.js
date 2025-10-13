const FundingDocuments = require('../models/FundingDocuments');
const TNA = require('../models/TNA');
const SETUPApplication = require('../models/SETUPApplication');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Request funding documents from PSTO
const requestFundingDocuments = async (req, res) => {
   try {
      const { tnaId } = req.params;
      const userId = req.user.id;

      console.log('=== REQUEST FUNDING DOCUMENTS DEBUG ===');
      console.log('TNA ID:', tnaId);
      console.log('User ID:', userId);

      // Validate TNA ID
      if (!mongoose.Types.ObjectId.isValid(tnaId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid TNA ID'
         });
      }

      // Find TNA and populate related data
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
            message: `TNA must be completed (RTEC status) before requesting funding documents. Current status: ${tna.status}`
         });
      }

      console.log('TNA status check passed');

      // Check if funding documents already requested
      const existingRequest = await FundingDocuments.findOne({ tnaId });
      if (existingRequest) {
         console.log('Funding documents already exist');
         return res.status(400).json({
            success: false,
            message: 'Funding documents already requested for this TNA'
         });
      }

      // Fetch project title and amount requested from RTEC documents
      let projectTitle = null;
      let projectDescription = null;
      let amountRequested = null;

      try {
         const RTECDocuments = require('../models/RTECDocuments');
         const rtecDoc = await RTECDocuments.findOne({ tnaId: tna._id });
         
         if (rtecDoc) {
            // Get project title from RTEC documents
            const projectTitleDoc = rtecDoc.partialdocsrtec.find(doc => doc.type === 'project title');
            if (projectTitleDoc && projectTitleDoc.textContent) {
               projectTitle = projectTitleDoc.textContent;
            }

            // Get project description from RTEC documents
            const projectDescriptionDoc = rtecDoc.partialdocsrtec.find(doc => doc.type === 'project description');
            if (projectDescriptionDoc && projectDescriptionDoc.textContent) {
               projectDescription = projectDescriptionDoc.textContent;
            }

            // Get amount requested from RTEC documents
            const amountRequestedDoc = rtecDoc.partialdocsrtec.find(doc => doc.type === 'amount requested');
            if (amountRequestedDoc && amountRequestedDoc.textContent) {
               amountRequested = parseFloat(amountRequestedDoc.textContent);
            }
         }
      } catch (error) {
         console.log('Error fetching RTEC document data:', error);
      }

      // Create funding documents request
      const fundingDocuments = new FundingDocuments({
         tnaId: tna._id,
         applicationId: tna.applicationId._id,
         proponentId: tna.proponentId._id,
         programName: tna.programName || 'SETUP',
         projectTitle: projectTitle,
         projectDescription: projectDescription,
         amountRequested: amountRequested,
         requestedBy: userId,
         status: 'documents_requested',
         dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      });

      // Initialize default funding document types
      await fundingDocuments.initializeFundingDocumentTypes();

      console.log('Funding documents created successfully');

      // Create notification for PSTO
      try {
         await Notification.create({
            recipientId: tna.proponentId._id,
            recipientType: 'proponent',
            type: 'funding_document_request',
            title: 'Funding Documents Requested',
            message: `Funding documents have been requested for your application. Please coordinate with PSTO to submit the required documents.`,
            data: {
               tnaId: tnaId,
               fundingDocumentsId: fundingDocuments._id
            }
         });
      } catch (notificationError) {
         console.error('Error creating notification:', notificationError);
         // Don't fail the entire request if notification creation fails
      }

      res.json({
         success: true,
         message: 'Funding documents request created successfully',
         data: fundingDocuments
      });

   } catch (error) {
      console.error('Error requesting funding documents:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Get funding documents by TNA ID
const getFundingDocumentsByTNA = async (req, res) => {
   try {
      const { tnaId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(tnaId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid TNA ID'
         });
      }

      const fundingDocuments = await FundingDocuments.findOne({ tnaId })
         .populate('tnaId')
         .populate('applicationId')
         .populate('proponentId', 'firstName lastName email province')
         .populate('requestedBy')
         .populate('submittedBy')
         .populate('reviewedBy');

      if (!fundingDocuments) {
         return res.status(404).json({
            success: false,
            message: 'Funding documents not found'
         });
      }

      res.json({
         success: true,
         data: fundingDocuments
      });

   } catch (error) {
      console.error('Error fetching funding documents:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Get funding document by ID
const getFundingDocumentById = async (req, res) => {
   try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid funding document ID'
         });
      }

      const fundingDocument = await FundingDocuments.findById(id)
         .populate('tnaId')
         .populate('applicationId')
         .populate('proponentId', 'firstName lastName email province')
         .populate('requestedBy')
         .populate('submittedBy')
         .populate('reviewedBy');

      if (!fundingDocument) {
         return res.status(404).json({
            success: false,
            message: 'Funding document not found'
         });
      }

      res.json({
         success: true,
         data: fundingDocument
      });

   } catch (error) {
      console.error('Error fetching funding document:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Submit funding document
const submitFundingDocument = async (req, res) => {
   try {
      const { tnaId } = req.params;
      const { documentType } = req.body;
      const userId = req.user.id;

      console.log('=== SUBMIT FUNDING DOCUMENT DEBUG ===');
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

      // Find funding documents
      const fundingDocuments = await FundingDocuments.findOne({ tnaId });
      if (!fundingDocuments) {
         console.log('Funding documents not found for TNA ID:', tnaId);
         return res.status(404).json({
            success: false,
            message: 'Funding documents request not found'
         });
      }

      console.log('Found funding documents:', fundingDocuments._id);
      console.log('Available document types:', fundingDocuments.fundingDocuments.map(doc => doc.type));

      // Check if document type is valid (use the same enum values as the model)
      const validDocumentTypes = [
         'partial_budget_analysis', 'rtec_report', 'approval_letter',
         'bank_account', 'moa', 'promissory_notes', 'form_008',
         'certification_from_the_dost_agency', 'acknowledgment_reciept', 'csf'
      ];
      
      if (!validDocumentTypes.includes(documentType)) {
         console.log('Invalid document type:', documentType);
         console.log('Valid types:', validDocumentTypes);
         return res.status(400).json({
            success: false,
            message: 'Invalid document type'
         });
      }

      // Prepare file data - Store binary data in database
      const fileData = {
         filename: `fundingDocument-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`,
         originalName: req.file.originalname,
         path: null, // No file path since we're storing in database
         size: req.file.size,
         mimetype: req.file.mimetype,
         buffer: req.file.buffer // Store the actual file content as binary data
      };

      // Submit document
      try {
         await fundingDocuments.submitDocument(documentType, fileData, userId);
      } catch (submitError) {
         console.error('Error submitting document:', submitError);
         return res.status(500).json({
            success: false,
            message: 'Failed to submit document: ' + submitError.message
         });
      }

      // Update TNA status if all documents are submitted
      if (fundingDocuments.status === 'documents_submitted') {
         // Create notification for DOST-MIMAROPA
         try {
            await Notification.create({
               recipientId: fundingDocuments.requestedBy,
               recipientType: 'dost_mimaropa',
               type: 'funding_document_request',
               title: 'Funding Documents Submitted',
               message: `PSTO has submitted all required funding documents for review`,
               data: {
                  tnaId: tnaId,
                  fundingDocumentsId: fundingDocuments._id
               }
            });
         } catch (notificationError) {
            console.error('Error creating notification:', notificationError);
            // Don't fail the entire request if notification creation fails
         }
      }

      console.log('Funding document submitted successfully');

      res.json({
         success: true,
         message: 'Document submitted successfully',
         data: fundingDocuments
      });

   } catch (error) {
      console.error('Error submitting funding document:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Review funding document (approve/reject)
const reviewFundingDocument = async (req, res) => {
   try {
      const { tnaId } = req.params;
      const { documentType, action, comments } = req.body; // action: 'approve' or 'reject'
      const userId = req.user.id;

      console.log('=== REVIEW FUNDING DOCUMENT DEBUG ===');
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

      // Find funding documents
      const fundingDocuments = await FundingDocuments.findOne({ tnaId });
      if (!fundingDocuments) {
         return res.status(404).json({
            success: false,
            message: 'Funding documents not found'
         });
      }

      // Check if the specific document is submitted (check both regular and additional documents)
      let document = fundingDocuments.fundingDocuments.find(doc => doc.type === documentType);
      let isAdditionalDocument = false;
      
      if (!document) {
         // Check if it's an additional document
         document = fundingDocuments.additionalDocumentsRequired.find(doc => doc.type === documentType);
         isAdditionalDocument = true;
      }
      
      if (!document) {
         return res.status(404).json({
            success: false,
            message: 'Document type not found'
         });
      }

      console.log('🔍 Document found:', {
         type: document.type,
         name: document.name,
         documentStatus: document.documentStatus,
         filename: document.filename,
         uploadedAt: document.uploadedAt
      });

      if (document.documentStatus !== 'submitted') {
         console.log('🔍 Document status check failed:', {
            expected: 'submitted',
            actual: document.documentStatus,
            document: document
         });
         return res.status(400).json({
            success: false,
            message: `Document must be submitted before review. Current status: ${document.documentStatus}`
         });
      }

      // Review document
      try {
         if (action === 'approve') {
            if (isAdditionalDocument) {
               await fundingDocuments.approveAdditionalDocument(documentType, userId, comments);
            } else {
               await fundingDocuments.approveDocument(documentType, userId, comments);
            }
         } else if (action === 'reject') {
            if (isAdditionalDocument) {
               await fundingDocuments.rejectAdditionalDocument(documentType, userId, comments);
            } else {
               await fundingDocuments.rejectDocument(documentType, userId, comments);
            }
         }
      } catch (reviewError) {
         console.error('Error reviewing document:', reviewError);
         return res.status(500).json({
            success: false,
            message: 'Failed to review document: ' + reviewError.message
         });
      }

      // Create notification for PSTO
      try {
         await Notification.create({
            recipientId: fundingDocuments.proponentId,
            recipientType: 'proponent',
            type: 'funding_document_review',
            title: `Funding Document ${action === 'approve' ? 'Approved' : 'Rejected'}`,
            message: `Your funding document "${document.name}" has been ${action === 'approve' ? 'approved' : 'rejected'}. ${comments ? `Comments: ${comments}` : ''}`,
            data: {
               tnaId: tnaId,
               fundingDocumentsId: fundingDocuments._id,
               documentType: documentType,
               action: action
            }
         });
      } catch (notificationError) {
         console.error('Error creating notification:', notificationError);
         // Don't fail the entire request if notification creation fails
      }

      console.log(`Funding document ${action}ed successfully`);

      res.json({
         success: true,
         message: `Document ${action}ed successfully`,
         data: fundingDocuments
      });

   } catch (error) {
      console.error(`Error ${req.body.action}ing funding document:`, error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Update existing funding documents with RTEC data
const updateFundingDocumentsWithRTECData = async (req, res) => {
   try {
      console.log('🔄 Starting update of funding documents with RTEC data...');
      
      // Find all funding documents that don't have project title or amount requested
      const fundingDocs = await FundingDocuments.find({
         $or: [
            { projectTitle: { $exists: false } },
            { projectTitle: null },
            { amountRequested: { $exists: false } },
            { amountRequested: null }
         ]
      }).populate('tnaId');

      console.log(`🔍 Found ${fundingDocs.length} funding documents to update`);

      let updatedCount = 0;

      for (const fundingDoc of fundingDocs) {
         try {
            // Find corresponding RTEC document
            const RTECDocuments = require('../models/RTECDocuments');
            const rtecDoc = await RTECDocuments.findOne({ tnaId: fundingDoc.tnaId._id });
            
            if (rtecDoc) {
               let projectTitle = null;
               let projectDescription = null;
               let amountRequested = null;

               // Get project title from RTEC documents
               const projectTitleDoc = rtecDoc.partialdocsrtec.find(doc => doc.type === 'project title');
               if (projectTitleDoc && projectTitleDoc.textContent) {
                  projectTitle = projectTitleDoc.textContent;
               }

               // Get project description from RTEC documents
               const projectDescriptionDoc = rtecDoc.partialdocsrtec.find(doc => doc.type === 'project description');
               if (projectDescriptionDoc && projectDescriptionDoc.textContent) {
                  projectDescription = projectDescriptionDoc.textContent;
               }

               // Get amount requested from RTEC documents
               const amountRequestedDoc = rtecDoc.partialdocsrtec.find(doc => doc.type === 'amount requested');
               if (amountRequestedDoc && amountRequestedDoc.textContent) {
                  amountRequested = parseFloat(amountRequestedDoc.textContent);
               }

               // Update funding document if we found data
               if (projectTitle || projectDescription || amountRequested) {
                  await FundingDocuments.findByIdAndUpdate(fundingDoc._id, {
                     projectTitle: projectTitle || fundingDoc.projectTitle,
                     projectDescription: projectDescription || fundingDoc.projectDescription,
                     amountRequested: amountRequested || fundingDoc.amountRequested
                  });
                  
                  console.log(`✅ Updated funding document ${fundingDoc._id} with RTEC data`);
                  updatedCount++;
               }
            }
         } catch (error) {
            console.error(`❌ Error updating funding document ${fundingDoc._id}:`, error);
         }
      }

      console.log(`🎉 Updated ${updatedCount} funding documents with RTEC data`);

      res.json({
         success: true,
         message: `Updated ${updatedCount} funding documents with RTEC data`,
         updatedCount
      });
   } catch (error) {
      console.error('Error updating funding documents with RTEC data:', error);
      res.status(500).json({
         success: false,
         message: 'Error updating funding documents',
         error: error.message
      });
   }
};

// List all funding documents (for DOST-MIMAROPA)
const listFundingDocuments = async (req, res) => {
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

      const fundingDocuments = await FundingDocuments.find(filter)
         .populate('tnaId')
         .populate('applicationId')
         .populate('proponentId', 'firstName lastName email province')
         .populate('requestedBy')
         .populate('submittedBy')
         .populate('reviewedBy')
         .sort({ createdAt: -1 })
         .skip(skip)
         .limit(parseInt(limit));

      // Fetch RTEC document data for each funding document
      const enrichedFundingDocuments = await Promise.all(fundingDocuments.map(async (doc) => {
         try {
            // If the funding document already has project title and amount, use those
            if (doc.projectTitle && doc.amountRequested) {
               return doc.toObject();
            }

            // Otherwise, fetch from RTEC documents
            const RTECDocuments = require('../models/RTECDocuments');
            const rtecDoc = await RTECDocuments.findOne({ tnaId: doc.tnaId._id });
            
            if (rtecDoc) {
               // Extract project title, description, and amount from RTEC documents
               const projectTitleDoc = rtecDoc.partialdocsrtec.find(doc => doc.type === 'project title');
               const projectDescriptionDoc = rtecDoc.partialdocsrtec.find(doc => doc.type === 'project description');
               const amountRequestedDoc = rtecDoc.partialdocsrtec.find(doc => doc.type === 'amount requested');
               
               // Update the funding document with RTEC data
               const updatedDoc = await FundingDocuments.findByIdAndUpdate(doc._id, {
                  projectTitle: projectTitleDoc?.textContent || doc.projectTitle,
                  projectDescription: projectDescriptionDoc?.textContent || doc.projectDescription,
                  amountRequested: amountRequestedDoc?.textContent ? parseFloat(amountRequestedDoc.textContent) : doc.amountRequested
               }, { new: true });
               
               return updatedDoc ? updatedDoc.toObject() : doc.toObject();
            }
            
            return doc.toObject();
         } catch (error) {
            console.error(`Error fetching RTEC data for funding document ${doc._id}:`, error);
            return doc.toObject();
         }
      }));

      // Debug logging
      console.log('🔍 Funding Documents Debug:');
      enrichedFundingDocuments.forEach((doc, index) => {
         console.log(`Document ${index + 1}:`);
         console.log(`  - ID: ${doc._id}`);
         console.log(`  - Proponent ID: ${doc.proponentId?._id}`);
         console.log(`  - Proponent Name: ${doc.proponentId?.firstName} ${doc.proponentId?.lastName}`);
         console.log(`  - Proponent Province: ${doc.proponentId?.province}`);
         console.log(`  - Project Title: ${doc.projectTitle || 'N/A'}`);
         console.log(`  - Amount Requested: ${doc.amountRequested || 'N/A'}`);
         console.log(`  - Status: ${doc.status}`);
      });

      const total = await FundingDocuments.countDocuments(filter);

      res.json({
         success: true,
         data: {
            docs: enrichedFundingDocuments,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
         }
      });

   } catch (error) {
      console.error('Error fetching funding documents:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Get approved funding documents
const getApprovedFundingDocuments = async (req, res) => {
   try {
      const fundingDocuments = await FundingDocuments.find({ status: 'documents_approved' })
         .populate('tnaId')
         .populate('applicationId')
         .populate('proponentId', 'firstName lastName email province')
         .populate('requestedBy')
         .populate('submittedBy')
         .populate('reviewedBy')
         .sort({ reviewedAt: -1 });

      res.json({
         success: true,
         data: fundingDocuments
      });

   } catch (error) {
      console.error('Error fetching approved funding documents:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Get funding documents for PSTO
const getFundingDocumentsForPSTO = async (req, res) => {
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

      // First, let's get all funding documents and then filter by province
      let allFundingDocuments = await FundingDocuments.find({})
         .populate('tnaId')
         .populate('applicationId')
         .populate('proponentId', 'firstName lastName email province')
         .populate('requestedBy')
         .populate('submittedBy')
         .populate('reviewedBy')
         .sort({ createdAt: -1 });

      console.log('🔍 All Funding Documents:', allFundingDocuments.length);

      // Filter by PSTO's province - check the proponent's province
      const filteredDocuments = allFundingDocuments.filter(doc => {
         const proponentProvince = doc.proponentId?.province;
         console.log(`🔍 Document ${doc._id}:`);
         console.log(`  - Application ID: ${doc.applicationId?._id}`);
         console.log(`  - Proponent ID: ${doc.proponentId?._id}`);
         console.log(`  - Proponent Province: ${proponentProvince}`);
         console.log(`  - PSTO Province: ${pstoUser.province}`);
         console.log(`  - Match: ${proponentProvince === pstoUser.province}`);
         
         return proponentProvince === pstoUser.province;
      });

      console.log('🔍 Filtered Documents by Province:', filteredDocuments.length);

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

      // Fetch RTEC document data for each funding document
      const enrichedFundingDocuments = await Promise.all(paginatedDocuments.map(async (doc) => {
         try {
            // If the funding document already has project title and amount, use those
            if (doc.projectTitle && doc.amountRequested) {
               return doc.toObject();
            }

            // Otherwise, fetch from RTEC documents
            const RTECDocuments = require('../models/RTECDocuments');
            const rtecDoc = await RTECDocuments.findOne({ tnaId: doc.tnaId._id });
            
            if (rtecDoc) {
               // Extract project title, description, and amount from RTEC documents
               const projectTitleDoc = rtecDoc.partialdocsrtec.find(doc => doc.type === 'project title');
               const projectDescriptionDoc = rtecDoc.partialdocsrtec.find(doc => doc.type === 'project description');
               const amountRequestedDoc = rtecDoc.partialdocsrtec.find(doc => doc.type === 'amount requested');
               
               // Update the funding document with RTEC data
               const updatedDoc = await FundingDocuments.findByIdAndUpdate(doc._id, {
                  projectTitle: projectTitleDoc?.textContent || doc.projectTitle,
                  projectDescription: projectDescriptionDoc?.textContent || doc.projectDescription,
                  amountRequested: amountRequestedDoc?.textContent ? parseFloat(amountRequestedDoc.textContent) : doc.amountRequested
               }, { new: true });
               
               return updatedDoc ? updatedDoc.toObject() : doc.toObject();
            }
            
            return doc.toObject();
         } catch (error) {
            console.error(`Error fetching RTEC data for funding document ${doc._id}:`, error);
            return doc.toObject();
         }
      }));

      res.json({
         success: true,
         data: {
            docs: enrichedFundingDocuments,
            total: finalDocuments.length,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(finalDocuments.length / limit)
         }
      });

   } catch (error) {
      console.error('Error fetching funding documents for PSTO:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Complete funding process
const completeFunding = async (req, res) => {
   try {
      const { tnaId } = req.params;
      const userId = req.user.id;

      console.log('=== COMPLETE FUNDING DEBUG ===');
      console.log('TNA ID:', tnaId);
      console.log('User ID:', userId);

      // Validate TNA ID
      if (!mongoose.Types.ObjectId.isValid(tnaId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid TNA ID'
         });
      }

      // Find funding documents
      const fundingDocuments = await FundingDocuments.findOne({ tnaId });
      if (!fundingDocuments) {
         return res.status(404).json({
            success: false,
            message: 'Funding documents not found'
         });
      }

      // Check if all documents are approved
      if (fundingDocuments.status !== 'documents_approved') {
         return res.status(400).json({
            success: false,
            message: 'All documents must be approved before completing funding'
         });
      }

      // Complete funding
      await fundingDocuments.completeFunding(userId);

      // Create notification for proponent
      await Notification.create({
         recipientId: fundingDocuments.proponentId,
         recipientType: 'proponent',
         type: 'funding_completed',
         title: 'Funding Process Completed',
         message: `Your funding process has been completed successfully.`,
         data: {
            tnaId: tnaId,
            fundingDocumentsId: fundingDocuments._id
         }
      });

      console.log('Funding completed successfully');

      res.json({
         success: true,
         message: 'Funding process completed successfully',
         data: fundingDocuments
      });

   } catch (error) {
      console.error('Error completing funding:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Serve file from database
const serveFile = async (req, res) => {
   try {
      const { tnaId, documentType } = req.params;
      
      console.log('🔍 Serving file for tnaId:', tnaId, 'Type:', typeof tnaId, 'documentType:', documentType);
      
      // Find the funding document
      const fundingDocuments = await FundingDocuments.findOne({ tnaId });
      if (!fundingDocuments) {
         console.log('❌ Funding documents not found for tnaId:', tnaId);
         return res.status(404).json({
            success: false,
            message: 'Funding documents not found'
         });
      }
      
      // Find the specific document
      const document = fundingDocuments.fundingDocuments.find(doc => doc.type === documentType);
      if (!document) {
         console.log('❌ Document not found for type:', documentType);
         console.log('Available documents:', fundingDocuments.fundingDocuments.map(doc => doc.type));
         return res.status(404).json({
            success: false,
            message: 'Document not found'
         });
      }

      // Check if document has buffer (new database storage) or path (old file system storage)
      if (!document.buffer && !document.path) {
         console.log('❌ Document has no buffer or path for type:', documentType);
         return res.status(404).json({
            success: false,
            message: 'Document not uploaded or corrupted'
         });
      }

      // Handle old file system storage
      if (!document.buffer && document.path) {
         console.log('📁 Using old file system storage for:', document.originalName);
         const fs = require('fs');
         const path = require('path');
         
         try {
            const filePath = path.join(__dirname, '../../uploads', document.filename);
            const fileBuffer = fs.readFileSync(filePath);
            
            res.setHeader('Content-Type', document.mimetype);
            res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
            res.setHeader('Content-Length', document.size);
            res.send(fileBuffer);
            return;
         } catch (fileError) {
            console.error('❌ Error reading file from filesystem:', fileError);
            return res.status(404).json({
               success: false,
               message: 'File not found on server'  
            });
         }
      }
      
      console.log('✅ Found document:', document.originalName, 'Size:', document.size, 'Type:', document.mimetype);
      
      // Set appropriate headers
      res.setHeader('Content-Type', document.mimetype);
      res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
      res.setHeader('Content-Length', document.size);
      
      // Send the file buffer
      res.send(document.buffer);
      
   } catch (error) {
      console.error('❌ Error serving file:', error);
      console.error('Error details:', {
         message: error.message,
         stack: error.stack,
         tnaId: req.params.tnaId,
         documentType: req.params.documentType
      });
      res.status(500).json({
         success: false,
         message: 'Error serving file: ' + error.message
      });
   }
};

module.exports = {
   requestFundingDocuments,
   getFundingDocumentsByTNA,
   getFundingDocumentById,
   submitFundingDocument,
   reviewFundingDocument,
   listFundingDocuments,
   getApprovedFundingDocuments,
   getFundingDocumentsForPSTO,
   completeFunding,
   serveFile,
   updateFundingDocumentsWithRTECData
};
