const mongoose = require('mongoose');

const rtecDocumentsSchema = new mongoose.Schema({
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
         'rtec_completed',
         'additional_documents_required',
         'documents_revision_requested'
      ],
      default: 'documents_requested'
   },
   
   // Partial documents for RTEC - the three required document types
   partialdocsrtec: [{
      type: {
         type: String,
         enum: [
            'project title',
            'project description',
            'amount requested',
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
      // File content stored as buffer for database backup
      buffer: {
         type: Buffer,
         default: null
      },
      // Text content for text input fields (project title, project description, amount requested)
      textContent: {
         type: String,
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
   
   // RTEC completion tracking
   rtecCompletedAt: {
      type: Date,
      default: null
   },
   
   rtecCompletedBy: {
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
   
   // Additional documents required for "endorsed for approval (with comment)" outcome
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
   collection: 'rtecdocuments'
});

// Index for efficient queries
rtecDocumentsSchema.index({ tnaId: 1 });
rtecDocumentsSchema.index({ applicationId: 1 });
rtecDocumentsSchema.index({ proponentId: 1 });
rtecDocumentsSchema.index({ status: 1 });
rtecDocumentsSchema.index({ requestedAt: 1 });

// Method to initialize default document types
rtecDocumentsSchema.methods.initializeDocumentTypes = function() {
   this.partialdocsrtec = [
      {
         type: 'project title',
         name: 'Project Title',
         description: 'Detailed project title and description',
         documentStatus: 'pending'
      },
      {
         type: 'project description',
         name: 'Project Description',
         description: 'Detailed description of the project objectives and activities',
         documentStatus: 'pending'
      },
      {
         type: 'amount requested',
         name: 'Amount Requested',
         description: 'Total funding amount being requested',
         documentStatus: 'pending'
      },
      {
         type: 'approved tna report',
         name: 'Approved TNA Report',
         description: 'Approved TNA Report with Signature',
         documentStatus: 'pending'
      },
      {
         type: 'risk management plan',
         name: 'Risk Management Plan',
         description: 'Risk Management Plan',
         documentStatus: 'pending'
      },
      {
         type: 'financial statements',
         name: 'Financial Statements',
         description: 'Financial statements for the last 3 years for small and medium enterprises and at least 1 year for micro-enterprises together with notarized sworn statement from the proponent that all the information provided are correct and used',
         documentStatus: 'pending'
      },
      {
         type: 'letter of intent',
         name: 'Letter of Intent',
         description: 'Letter of Intent to  avail SETUP assistance, stating commitment to  refund the iFund  support  and cover the insurance cost  for the aqcquired equipment',
         documentStatus: 'pending'
      },
      {
         type: 'duly accomplishment DOST TNA Form 001',
         name: 'Duly Accomplishment DOST TNA Form 001',
         description: 'Application for Technology Needs Assessment (Annex I-1)',
         documentStatus: 'pending'
      },
      {
         type: 'duly accomplishment DOST TNA Form 02',
         name: 'Duly Accomplishment DOST TNA Form 02',
         description: 'Technology Needs Assessment Report (Annex I-2)',
         documentStatus: 'pending'
      },
      {
         type: 'proposal using SETUP FORM 001',
         name: 'Proposal using SETUP FORM 001',
         description: 'Project Proposal  Format (Annex A-1)',
         documentStatus: 'pending'
      },
      {
         type: 'copy of the business permit and licenses',
         name: 'Copy of the Business Permit and Licenses',
         description: 'Copy of the business permit and licenses by LGU and other appropriate government agencies',
         documentStatus: 'pending'
      },
      {
         type: 'certificate of registration with DTI/SEC/CDA',
         name: 'Certificate of Registration with DTI/SEC/CDA',
         description: 'Certificate of registration with the Department of Trade and Industry (DTI), Securities and Exchange Commission (SEC) or Cooperative Development Authority (CDA), whichever is applicable',
         documentStatus: 'pending'
      },
      {
         type: 'photocopy of the official receipt of the firm',
         name: 'Photocopy of the Official Receipt of the Firm',
         description: 'Photocopy of the official receipt of the firm',
         documentStatus: 'pending'
      },
      {
         type: 'articles of incorporation for cooperatives and association as proponent',
         name: 'Articles of Incorporation for Cooperatives and Association as Proponent',
         description: 'Articles of Incorporation for Cooperatives and Association as Proponent',
         documentStatus: 'pending'
      },
      {
         type: 'board legislative council resolution',
         name: 'Board/Legislative Council Resolution',
         description: 'Board/Legislative Council Resolution authorizing the availment of the assistance and designating authorized signatory for the funding assistance for corporations, cooperatives, SUCs and LGUs',
         documentStatus: 'pending'
      },
      {
         type: 'sworn affidavit',
         name: 'Sworn Affidavit',
         description: 'Sworn affidavit that none of the incorporators/officials or applicant is related to the approving authority (Regional Director) up to the third degree of consanguinity and affinity and that the proponent has no bad debt',
         documentStatus: 'pending'
      },
      {
         type: 'projected financial statements',
         name: 'Projected Financial Statements',
         description: 'Projected financial statements with the number of years depending on the proposed project duration',
         documentStatus: 'pending'
      },
      {
         type: 'complete technical specifications and design/drawing/picture of equipment',
         name: 'Complete Technical Specifications and Design/Drawing/Picture of Equipment',
         description: 'Complete technical specifications and design/drawing/picture of equipment to be acquired, as determined in the TNA Report (DOST TNA Form 02)',
         documentStatus: 'pending'
      },
      {
         type: 'three quotations from suppliers/fabricators for each equipment to be acquired',
         name: 'Three (3) Quotations from Suppliers/Fabricators for Each Equipment to be Acquired',
         description: 'Three (3) quotations from suppliers/fabricators for each equipment to be acquired, as indicated in item l. The conditions required in the DOST Purchase Order (i.e., warranty of equipment and after sales support, terms of payment, and retention of payment for applicable equipment) shall be followed. If the proponent cannot find the sufficient number of suppliers especially in times of emergency or calamity situation, the proponent should submit an affidavit stating the unavailability of suppliers for the needed equipment in the area',
         documentStatus: 'pending'
      }
   
   ];
   return this.save();
};

// Method to submit a document
rtecDocumentsSchema.methods.submitDocument = function(documentType, fileData, userId) {
   let document = this.partialdocsrtec.find(doc => doc.type === documentType);
   
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
      document.buffer = fileData.buffer || null; // Store file content in database for backup
      document.textContent = fileData.textContent || null; // Store text content for text input fields
      console.log('🔍 Storing textContent:', fileData.textContent, 'for document type:', documentType);
      console.log('🔍 Storing buffer:', fileData.buffer ? `${fileData.buffer.length} bytes` : 'No buffer', 'for document type:', documentType);
      document.uploadedAt = new Date();
      document.uploadedBy = userId;
      document.documentStatus = 'submitted';
   } else {
      throw new Error(`Document type ${documentType} not found for submission.`);
   }
   
   // Check if all documents are submitted (both partialdocsrtec and additionalDocumentsRequired)
   const allPartialDocsSubmitted = this.partialdocsrtec.every(doc => doc.documentStatus === 'submitted');
   const allAdditionalDocsSubmitted = this.additionalDocumentsRequired.every(doc => doc.documentStatus === 'submitted');
   
   if (allPartialDocsSubmitted && allAdditionalDocsSubmitted) {
      this.status = 'documents_submitted';
      this.submittedBy = userId;
      this.submittedAt = new Date();
   } else if (this.status === 'additional_documents_required' && allAdditionalDocsSubmitted) {
      // If only additional documents were required and now all are submitted
      this.status = 'documents_submitted'; // Or a new status like 'additional_documents_submitted'
      this.submittedBy = userId;
      this.submittedAt = new Date();
   }
   
   return this.save();
};

// Method to approve a document
rtecDocumentsSchema.methods.approveDocument = function(documentType, userId, comments = null) {
   const document = this.partialdocsrtec.find(doc => doc.type === documentType);
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
         const doc = this.partialdocsrtec.find(d => d.type === docType);
         return doc && (doc.documentStatus === 'approved' || doc.documentStatus === 'rejected');
      });
      
      if (allRevisedDocumentsReviewed) {
         // All revised documents have been reviewed, check if any were rejected
         const hasRejectedRevisedDocuments = revisedDocuments.some(docType => {
            const doc = this.partialdocsrtec.find(d => d.type === docType);
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
      const allDocumentsReviewed = this.partialdocsrtec.every(doc => 
         doc.documentStatus === 'approved' || doc.documentStatus === 'rejected'
      );
      
      if (allDocumentsReviewed) {
         const hasRejectedDocuments = this.partialdocsrtec.some(doc => doc.documentStatus === 'rejected');
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

// Method to reject a document
rtecDocumentsSchema.methods.rejectDocument = function(documentType, userId, comments) {
   const document = this.partialdocsrtec.find(doc => doc.type === documentType);
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
         const doc = this.partialdocsrtec.find(d => d.type === docType);
         return doc && (doc.documentStatus === 'approved' || doc.documentStatus === 'rejected');
      });
      
      if (allRevisedDocumentsReviewed) {
         // All revised documents have been reviewed, check if any were rejected
         const hasRejectedRevisedDocuments = revisedDocuments.some(docType => {
            const doc = this.partialdocsrtec.find(d => d.type === docType);
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
      const allDocumentsReviewed = this.partialdocsrtec.every(doc => 
         doc.documentStatus === 'approved' || doc.documentStatus === 'rejected'
      );
      
      if (allDocumentsReviewed) {
         const hasRejectedDocuments = this.partialdocsrtec.some(doc => doc.documentStatus === 'rejected');
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
rtecDocumentsSchema.methods.approveAdditionalDocument = function(documentType, userId, comments) {
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
         // All additional documents approved - ready for funding
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
rtecDocumentsSchema.methods.rejectAdditionalDocument = function(documentType, userId, comments) {
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

// Ensure virtual fields are serialized
rtecDocumentsSchema.set('toJSON', {
   virtuals: true
});

module.exports = mongoose.model('RTECDocuments', rtecDocumentsSchema);
