const mongoose = require('mongoose');

const setupApplicationSchema = new mongoose.Schema({
   // Application Basic Info
   applicationId: {
      type: String,
      unique: true,
      required: true
   },
   programCode: {
      type: String,
      required: true,
      enum: ['SETUP', 'GIA', 'CEST', 'SSCP'],
      default: 'SETUP'
   },
   programName: {
      type: String,
      required: true,
      default: 'Small Enterprise Technology Upgrading Program'
   },
   
   // Proponent Information
   proponentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   
   // Enterprise Information (Step 2 fields)
   enterpriseName: {
      type: String,
      required: true
   },
   contactPerson: {
      type: String,
      required: true
   },
   contactPersonTel: {
      type: String,
      required: true
   },
   contactPersonEmail: {
      type: String,
      required: true
   },
   officeAddress: {
      type: String,
      required: true
   },
   factoryAddress: {
      type: String
   },
   website: {
      type: String
   },
   position: {
      type: String,
      required: true,
      enum: ['Owner', 'Manager', 'Director', 'President', 'Other']
   },
   
   
   // GIA Specific Fields
   innovationType: {
      type: String,
      enum: ['Product', 'Process', 'Service', 'Marketing'],
      required: function() { return this.programCode === 'GIA'; }
   },
   innovationDescription: {
      type: String,
      required: function() { return this.programCode === 'GIA'; }
   },
   
   // CEST Specific Fields
   testingRequirements: {
      type: String,
      required: function() { return this.programCode === 'CEST'; }
   },
   
   // SSCP Specific Fields
   consultancyNeeds: {
      type: String,
      required: function() { return this.programCode === 'SSCP'; }
   },
   
   
   // File Uploads (Step 6 fields)
   letterOfIntent: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String
   },
   enterpriseProfile: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String
   }, 
   
   // SETUP Process Stages - Correct DOST PMNS Workflow
   currentStage: {
      type: String,
      enum: ['application_submitted', 'psto_review', 'psto_approved', 'tna_scheduled', 'tna_conducted', 'tna_report_submitted', 'dost_mimaropa_review', 'rtec_evaluation', 'implementation', 'completed'],
      default: 'application_submitted'
   },
   
   // Application Status - Correct DOST PMNS Workflow
   status: {
      type: String,
      enum: ['pending', 'under_review', 'psto_approved', 'psto_rejected', 'tna_scheduled', 'tna_conducted', 'tna_report_submitted', 'dost_mimaropa_approved', 'dost_mimaropa_rejected', 'rtec_approved', 'rtec_rejected', 'implementation', 'completed'],
      default: 'pending'
   },
   
   // PSTO Review Status
   pstoStatus: {
      type: String,
      enum: ['pending', 'approved', 'returned', 'rejected'],
      default: 'pending'
   },
   pstoComments: {
      type: String
   },
   validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
   },
   validatedAt: {
      type: Date
   },
   pstoReviewedAt: {
      type: Date
   },
   pstoAssigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
   },
   
   // Review Information
   reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
   },
   reviewedAt: {
      type: Date
   },
   reviewComments: {
      type: String
   },
   
   // PSTO Assignment
   assignedPSTO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PSTO'
   },
   forwardedToPSTO: {
      type: Boolean,
      default: false
   },
   forwardedAt: {
      type: Date
   },
   
   // TNA Information
   tnaScheduled: {
      type: Boolean,
      default: false
   },
   tnaScheduledAt: {
      type: Date
   },
   tnaConducted: {
      type: Boolean,
      default: false
   },
   tnaConductedAt: {
      type: Date
   },
   tnaReportSubmitted: {
      type: Boolean,
      default: false
   },
   tnaReportSubmittedAt: {
      type: Date
   },
   tnaReport: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String
   },
   
   // DOST MIMAROPA Review Status (for TNA Reports)
   forwardedToDostMimaropa: {
      type: Boolean,
      default: false
   },
   forwardedToDostMimaropaAt: {
      type: Date
   },
   dostMimaropaStatus: {
      type: String,
      enum: ['pending', 'approved', 'returned', 'rejected'],
      default: 'pending'
   },
   dostMimaropaComments: {
      type: String
   },
   dostMimaropaReviewedAt: {
      type: Date
   },
   dostMimaropaAssigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
   },
   
   // TNA Assessment Results
   tnaResults: {
      technologyGaps: [String],
      recommendations: [String],
      priorityAreas: [String],
      estimatedCost: Number,
      implementationTimeline: String,
      assessedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
      },
      assessedAt: Date
   },
   
   // RTEC Evaluation
   rtecEvaluation: {
      technicalFeasibility: String,
      economicViability: String,
      socialImpact: String,
      environmentalImpact: String,
      overallRating: String,
      evaluatedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
      },
      evaluatedAt: Date
   },
   
   // Timestamps
   submittedAt: {
      type: Date,
      default: Date.now
   },
   updatedAt: {
      type: Date,
      default: Date.now
   }
}, {
   timestamps: true
});

// Generate unique application ID based on program code
setupApplicationSchema.pre('save', async function(next) {
   if (this.isNew) {
      const count = await this.constructor.countDocuments({ programCode: this.programCode });
      this.applicationId = `${this.programCode}-${String(count + 1).padStart(6, '0')}`;
   }
   next();
});

// Update updatedAt on save
setupApplicationSchema.pre('save', function(next) {
   this.updatedAt = new Date();
   next();
});

// General agreement validation removed since step 7 was removed from the form

// Index for better query performance
setupApplicationSchema.index({ programCode: 1, status: 1 });
setupApplicationSchema.index({ proponentId: 1 });
setupApplicationSchema.index({ createdAt: -1 });
setupApplicationSchema.index({ applicationId: 1 });

module.exports = mongoose.model('SETUPApplication', setupApplicationSchema);
