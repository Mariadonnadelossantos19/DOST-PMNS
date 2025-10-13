const mongoose = require('mongoose');

const fundingDocumentsSchema = new mongoose.Schema({
   // Reference to the TNA
   tnaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TNA',
      required: true
   },
   
   // Reference to the application
   applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SETUPApplication',
      required: true
   },
   
   // Reference to the proponent
   proponentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   
   // Program name
   programName: {
      type: String,
      required: false,
      default: 'SETUP'
   },
   
   // Project title from the application
   projectTitle: {
      type: String,
      required: false,
      default: null
   },
   
   // Amount requested from the application
   amountRequested: {
      type: Number,
      required: false,
      default: null
   },
   
   // Project description from the application
   projectDescription: {
      type: String,
      required: false,
      default: null
   },
   
   // Document request status
   status: {    
      type: String,
      enum: [
         'documents_requested',
         'documents_submitted',
         'documents_under_review',
         'documents_approved',
         'documents_rejected',
         'funding_completed',
         'additional_documents_required',
         'documents_revision_requested'
      ],
      default: 'documents_requested'
   },
   
   // Funding documents - the required document types for funding process
   fundingDocuments: [{
      type: {
         type: String,
          enum: [
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
          ],
         required: true
      },
      name: {
         type: String,
         required: true
      },
      description: {
         type: String,
         required: true
      },
      // File upload details
      filename: {
         type: String,
         default: null
      },
      originalName: {
         type: String,
         default: null
      },
      path: {
         type: String,
         default: null
      },
      size: {
         type: Number,
         default: null
      },
      mimetype: {
         type: String,
         default: null
      },
      buffer: {
         type: Buffer,
         default: null
      },
      uploadedAt: {
         type: Date,
         default: null
      },
      uploadedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         default: null
      },
      // Document status
      documentStatus: {
         type: String,
         enum: ['pending', 'submitted', 'approved', 'rejected', 'needs_revision'],
         default: 'pending'
      },
      // Review comments
      reviewComments: {
         type: String,
         default: null
      },
      reviewedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         default: null
      },
      reviewedAt: {
         type: Date,
         default: null
      }
   }],
   
   // Document request details
   requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   
   requestedAt: {
      type: Date,
      default: Date.now
   },
   
   // Submission tracking
   submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
   },
   
   submittedAt: {
      type: Date,
      default: null
   },
   
   // Review tracking
   reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
   },
   
   reviewedAt: {
      type: Date,
      default: null
   },
   
   // Overall review comments
   overallComments: {
      type: String,
      default: null
   },
   
   // Due date for document submission
   dueDate: {
      type: Date,
      default: null
   },
   
   // Additional notes
   notes: {
      type: String,
      default: null
   },
   
   // Funding completion tracking
   fundingCompletedAt: {
      type: Date,
      default: null
   },
   
   fundingCompletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
   },
   
   // Revision tracking
   revisionRequestedAt: {
      type: Date,
      default: null
   },
   
   revisionRequestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
   },
   
   revisionComments: {
      type: String,
      default: null
   },
   
   // Specific documents that need revision
   documentsToRevise: [{
      type: {
         type: String,
         required: true
      },
      name: {
         type: String,
         required: true
      },
      reason: {
         type: String,
         default: null
      }
   }],
   
   // Additional documents required for funding process
   additionalDocumentsRequired: [{
      type: {
         type: String,
         required: true
      },
      name: {
         type: String,
         required: true
      },
      description: {
         type: String,
         required: true
      },
      reason: {
         type: String,
         default: null
      },
      // File upload details for additional documents
      filename: {
         type: String,
         default: null
      },
      originalName: {
         type: String,
         default: null
      },
      path: {
         type: String,
         default: null
      },
      size: {
         type: Number,
         default: null
      },
      mimetype: {
         type: String,
         default: null
      },
      buffer: {
         type: Buffer,
         default: null
      },
      uploadedAt: {
         type: Date,
         default: null
      },
      uploadedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         default: null
      },
      // Document status for additional documents
      documentStatus: {
         type: String,
         enum: ['pending', 'submitted', 'approved', 'rejected', 'needs_revision'],
         default: 'pending'
      },
      // Review comments for additional documents
      reviewComments: {
         type: String,
         default: null
      },
      reviewedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         default: null
      },
      reviewedAt: {
         type: Date,
         default: null
      }
   }]
}, {
   timestamps: true,
   collection: 'fundingdocuments'
});

// Index for efficient queries
fundingDocumentsSchema.index({ tnaId: 1 });
fundingDocumentsSchema.index({ applicationId: 1 });
fundingDocumentsSchema.index({ proponentId: 1 });
fundingDocumentsSchema.index({ status: 1 });
fundingDocumentsSchema.index({ requestedAt: 1 });

// Method to initialize default funding document types
fundingDocumentsSchema.methods.initializeFundingDocumentTypes = function() {
   this.fundingDocuments = [
      {
         type: 'partial_budget_analysis',
         name: 'Partial Budget Analysis',
         description: 'Detailed budget analysis showing partial funding calculations and breakdown',
         documentStatus: 'pending'
      },
      {
         type: 'rtec_report',
         name: 'RTEC Report',
         description: 'Regional Technical Evaluation Committee report for funding assessment',
         documentStatus: 'pending'
      },
      {
         type: 'approval_letter',
         name: 'Approval Letter',
         description: 'Official approval letter for funding processing',
         documentStatus: 'pending'
      },
      {
         type: 'bank_account',
         name: 'Bank Account Details',
         description: 'Bank account information for funding disbursement',
         documentStatus: 'pending'
      },
      {
         type: 'moa',
         name: 'Memorandum of Agreement (MOA)',
         description: 'Memorandum of Agreement between parties for funding terms',
         documentStatus: 'pending'
      },
      {
         type: 'promissory_notes',
         name: 'Promissory Notes',
         description: 'Promissory notes and payment agreements for funding terms',
         documentStatus: 'pending'
      },
       {
          type: 'form_008',
          name: 'Form 008',
          description: 'Form 008 for funding processing',
          documentStatus: 'pending'
       },
       {
          type: 'certification_from_the_dost_agency',
          name: 'Certification from the DOST Agency',
          description: 'Certification from the DOST Agency (for applicant with previous DOST Assistance)',
          documentStatus: 'pending'
       },
       {
          type: 'acknowledgment_reciept',
          name: 'Acknowledgment Receipt',
          description: 'Acknowledgment Receipt (for PDC received by PSTO)',
          documentStatus: 'pending'
       },
      {
         type: 'csf',
         name: 'CSF',
         description: 'Customer Satisfaction Form',
         documentStatus: 'pending'
      }
   ];
   return this.save();
};

// Method to submit a funding document
fundingDocumentsSchema.methods.submitDocument = function(documentType, fileData, userId) {
   let document = this.fundingDocuments.find(doc => doc.type === documentType);
   
   if (!document) {
      // Check if it's an additional document
      document = this.additionalDocumentsRequired.find(doc => doc.type === documentType);
   }
   
   if (document) {
      document.filename = fileData.filename;
      document.originalName = fileData.originalName;
      document.path = fileData.path;
      document.size = fileData.size;
      document.mimetype = fileData.mimetype;
      document.buffer = fileData.buffer; // Store binary data
      document.uploadedAt = new Date();
      document.uploadedBy = userId;
      document.documentStatus = 'submitted';
      
      console.log('🔍 Document status updated to submitted:', {
         type: documentType,
         documentStatus: document.documentStatus,
         filename: document.filename
      });
   } else {
      throw new Error(`Document type ${documentType} not found for submission.`);
   }
   
   // Check if all documents are submitted (both fundingDocuments and additionalDocumentsRequired)
   const allFundingDocsSubmitted = this.fundingDocuments.every(doc => doc.documentStatus === 'submitted');
   const allAdditionalDocsSubmitted = this.additionalDocumentsRequired.every(doc => doc.documentStatus === 'submitted');
   
   if (allFundingDocsSubmitted && allAdditionalDocsSubmitted) {
      this.status = 'documents_submitted';
      this.submittedBy = userId;
      this.submittedAt = new Date();
   } else if (this.status === 'additional_documents_required' && allAdditionalDocsSubmitted) {
      // If only additional documents were required and now all are submitted
      this.status = 'documents_submitted';
      this.submittedBy = userId;
      this.submittedAt = new Date();
   }
   
   console.log('🔍 Saving document with status:', this.fundingDocuments.map(doc => ({
      type: doc.type,
      documentStatus: doc.documentStatus,
      filename: doc.filename
   })));
   
   return this.save();
};

// Method to approve a funding document
fundingDocumentsSchema.methods.approveDocument = function(documentType, userId, comments = null) {
   const document = this.fundingDocuments.find(doc => doc.type === documentType);
   if (document) {
      document.documentStatus = 'approved';
      document.reviewedBy = userId;
      document.reviewedAt = new Date();
      if (comments) {
         document.reviewComments = comments;
      }
   }
   
   // Check if we're in revision workflow
   if (this.status === 'documents_revision_requested') {
      // In revision workflow, check if all documents requiring revision have been resubmitted and reviewed
      const documentsToRevise = this.documentsToRevise || [];
      const revisedDocuments = documentsToRevise.map(revDoc => revDoc.type);
      
      // Check if all documents that needed revision have been reviewed
      const allRevisedDocumentsReviewed = revisedDocuments.every(docType => {
         const doc = this.fundingDocuments.find(d => d.type === docType);
         return doc && (doc.documentStatus === 'approved' || doc.documentStatus === 'rejected');
      });
      
      if (allRevisedDocumentsReviewed) {
         // All revised documents have been reviewed, check if any were rejected
         const hasRejectedRevisedDocuments = revisedDocuments.some(docType => {
            const doc = this.fundingDocuments.find(d => d.type === docType);
            return doc && doc.documentStatus === 'rejected';
         });
         
         if (hasRejectedRevisedDocuments) {
            this.status = 'documents_rejected';
         } else {
            this.status = 'documents_approved';
         }
         this.reviewedBy = userId;
         this.reviewedAt = new Date();
      } else {
         // Still under review for revision
         this.status = 'documents_under_review';
      }
   } else {
      // Normal workflow - only update overall status if all documents have been reviewed
      const allDocumentsReviewed = this.fundingDocuments.every(doc => 
         doc.documentStatus === 'approved' || doc.documentStatus === 'rejected'
      );
      
      if (allDocumentsReviewed) {
         const hasRejectedDocuments = this.fundingDocuments.some(doc => doc.documentStatus === 'rejected');
         this.status = hasRejectedDocuments ? 'documents_rejected' : 'documents_approved';
         this.reviewedBy = userId;
         this.reviewedAt = new Date();
      } else {
         // Set to under review if not all documents are reviewed yet
         this.status = 'documents_under_review';
      }
   }
   
   return this.save();
};

// Method to reject a funding document
fundingDocumentsSchema.methods.rejectDocument = function(documentType, userId, comments) {
   const document = this.fundingDocuments.find(doc => doc.type === documentType);
   if (document) {
      document.documentStatus = 'rejected';
      document.reviewedBy = userId;
      document.reviewedAt = new Date();
      document.reviewComments = comments;
   }
   
   // Check if we're in revision workflow
   if (this.status === 'documents_revision_requested') {
      // In revision workflow, check if all documents requiring revision have been resubmitted and reviewed
      const documentsToRevise = this.documentsToRevise || [];
      const revisedDocuments = documentsToRevise.map(revDoc => revDoc.type);
      
      // Check if all documents that needed revision have been reviewed  
      const allRevisedDocumentsReviewed = revisedDocuments.every(docType => {
         const doc = this.fundingDocuments.find(d => d.type === docType);
         return doc && (doc.documentStatus === 'approved' || doc.documentStatus === 'rejected');
      });
      
      if (allRevisedDocumentsReviewed) {
         // All revised documents have been reviewed, check if any were rejected
         const hasRejectedRevisedDocuments = revisedDocuments.some(docType => {
            const doc = this.fundingDocuments.find(d => d.type === docType);
            return doc && doc.documentStatus === 'rejected';
         });
         
         if (hasRejectedRevisedDocuments) {
            this.status = 'documents_rejected';
         } else {
            this.status = 'documents_approved';
         }
         this.reviewedBy = userId;
         this.reviewedAt = new Date();
      } else {
         // Still under review for revision
         this.status = 'documents_under_review';
      }
   } else {
      // Normal workflow - only update overall status if all documents have been reviewed
      const allDocumentsReviewed = this.fundingDocuments.every(doc => 
         doc.documentStatus === 'approved' || doc.documentStatus === 'rejected'
      );
      
      if (allDocumentsReviewed) {
         const hasRejectedDocuments = this.fundingDocuments.some(doc => doc.documentStatus === 'rejected');
         this.status = hasRejectedDocuments ? 'documents_rejected' : 'documents_approved';
         this.reviewedBy = userId;
         this.reviewedAt = new Date();
      } else {
         // Set to under review if not all documents are reviewed yet
         this.status = 'documents_under_review';
      }
   }
   
   return this.save();
};

// Method to approve an additional document
fundingDocumentsSchema.methods.approveAdditionalDocument = function(documentType, userId, comments) {
   const document = this.additionalDocumentsRequired.find(doc => doc.type === documentType);
   if (document) {
      document.documentStatus = 'approved';
      document.reviewedBy = userId;
      document.reviewedAt = new Date();
      document.reviewComments = comments;
   }
   
   // Check if all additional documents are approved
   const allAdditionalDocumentsApproved = this.additionalDocumentsRequired.every(doc => 
      doc.documentStatus === 'approved' || doc.documentStatus === 'rejected'
   );
   
   if (allAdditionalDocumentsApproved) {
      const hasRejectedAdditionalDocuments = this.additionalDocumentsRequired.some(doc => doc.documentStatus === 'rejected');
      if (!hasRejectedAdditionalDocuments) {
         // All additional documents approved - ready for funding processing
         this.status = 'documents_approved';
         this.reviewedBy = userId;
         this.reviewedAt = new Date();
      } else {
         // Some additional documents rejected
         this.status = 'documents_rejected';
      }
   } else {
      // Set to under review if not all additional documents are reviewed yet
      this.status = 'documents_under_review';
   }
   
   return this.save();
};

// Method to reject an additional document
fundingDocumentsSchema.methods.rejectAdditionalDocument = function(documentType, userId, comments) {
   const document = this.additionalDocumentsRequired.find(doc => doc.type === documentType);
   if (document) {
      document.documentStatus = 'rejected';
      document.reviewedBy = userId;
      document.reviewedAt = new Date();
      document.reviewComments = comments;
   }
   
   // Check if all additional documents are reviewed
   const allAdditionalDocumentsReviewed = this.additionalDocumentsRequired.every(doc => 
      doc.documentStatus === 'approved' || doc.documentStatus === 'rejected'
   );
   
   if (allAdditionalDocumentsReviewed) {
      const hasRejectedAdditionalDocuments = this.additionalDocumentsRequired.some(doc => doc.documentStatus === 'rejected');
      this.status = hasRejectedAdditionalDocuments ? 'documents_rejected' : 'documents_approved';
      this.reviewedBy = userId;
      this.reviewedAt = new Date();
   } else {
      // Set to under review if not all additional documents are reviewed yet
      this.status = 'documents_under_review';
   }
   
   return this.save();
};

// Method to mark funding as completed
fundingDocumentsSchema.methods.completeFunding = function(userId) {
   this.status = 'funding_completed';
   this.fundingCompletedBy = userId;
   this.fundingCompletedAt = new Date();
   return this.save();
};

// Ensure virtual fields are serialized
fundingDocumentsSchema.set('toJSON', {
   virtuals: true
});

module.exports = mongoose.model('FundingDocuments', fundingDocumentsSchema);
