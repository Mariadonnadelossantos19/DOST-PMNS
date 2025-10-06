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
         'additional_documents_required'
      ],
      default: 'documents_requested'
   },
   
   // Partial documents for RTEC - the three required document types
   partialdocsrtec: [{
      type: {
         type: String,
         enum: ['approved tna report', 'risk management plan', 'financial statements'],
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
   }
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
      }
   ];
   return this.save();
};

// Method to submit a document
rtecDocumentsSchema.methods.submitDocument = function(documentType, fileData, userId) {
   const document = this.partialdocsrtec.find(doc => doc.type === documentType);
   if (document) {
      document.filename = fileData.filename;
      document.originalName = fileData.originalName;
      document.path = fileData.path;
      document.size = fileData.size;
      document.mimetype = fileData.mimetype;
      document.uploadedAt = new Date();
      document.uploadedBy = userId;
      document.documentStatus = 'submitted';
   }
   
   // Check if all documents are submitted
   const allSubmitted = this.partialdocsrtec.every(doc => doc.documentStatus === 'submitted');
   if (allSubmitted) {
      this.status = 'documents_submitted';
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
   
   // Check if all documents are approved
   const allApproved = this.partialdocsrtec.every(doc => doc.documentStatus === 'approved');
   if (allApproved) {
      this.status = 'documents_approved';
      this.reviewedBy = userId;
      this.reviewedAt = new Date();
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
   
   this.status = 'documents_rejected';
   this.reviewedBy = userId;
   this.reviewedAt = new Date();
   
   return this.save();
};

// Ensure virtual fields are serialized
rtecDocumentsSchema.set('toJSON', {
   virtuals: true
});

module.exports = mongoose.model('RTECDocuments', rtecDocumentsSchema);
