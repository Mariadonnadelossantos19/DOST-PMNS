const mongoose = require('mongoose');

const setupApplicationSchema = new mongoose.Schema({
   // Application Basic Info
   applicationId: {
      type: String,
      unique: true,
      required: true
   },
   
   // Proponent Information
   proponentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   
   // Enterprise Information
   enterpriseName: {
      type: String,
      required: true
   },
   contactPerson: {
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
   
   // Contact Details
   contactPersonTel: {
      type: String,
      required: true
   },
   factoryTel: {
      type: String
   },
   contactPersonFax: {
      type: String
   },
   factoryFax: {
      type: String
   },
   contactPersonEmail: {
      type: String,
      required: true
   },
   factoryEmail: {
      type: String
   },
   
   // Enterprise Details
   yearEstablished: {
      type: Number,
      required: true
   },
   initialCapital: {
      type: Number,
      default: 0
   },
   organizationType: {
      type: String,
      required: true,
      enum: ['Single proprietorship', 'Cooperative', 'Partnership', 'Corporation']
   },
   profitType: {
      type: String,
      required: true,
      enum: ['Profit', 'Non-profit']
   },
   registrationNo: {
      type: String,
      required: true
   },
   yearRegistered: {
      type: Number,
      required: true
   },
   capitalClassification: {
      type: String,
      required: true,
      enum: ['Micro', 'Small', 'Medium']
   },
   employmentClassification: {
      type: String,
      required: true,
      enum: ['Micro', 'Small', 'Medium']
   },
   
   // Employment Details
   directWorkers: {
      type: Number,
      default: 0
   },
   productionWorkers: {
      type: Number,
      default: 0
   },
   nonProductionWorkers: {
      type: Number,
      default: 0
   },
   contractWorkers: {
      type: Number,
      default: 0
   },
   totalWorkers: {
      type: Number,
      default: 0
   },
   
   // Business Activity
   businessActivity: {
      type: String,
      required: true
   },
   specificProduct: {
      type: String,
      required: true
   },
   enterpriseBackground: {
      type: String,
      required: true
   },
   
   // SETUP Specific Fields
   technologyNeeds: {
      type: String,
      required: true
   },
   currentTechnologyLevel: {
      type: String,
      required: true,
      enum: ['Basic', 'Intermediate', 'Advanced']
   },
   desiredTechnologyLevel: {
      type: String,
      required: true,
      enum: ['Basic', 'Intermediate', 'Advanced']
   },
   expectedOutcomes: {
      type: String,
      required: true
   },
   
   // General Agreement
   generalAgreement: {
      accepted: {
         type: Boolean,
         required: true,
         default: false
      },
      acceptedAt: {
         type: Date,
         required: true
      },
      ipAddress: {
         type: String
      },
      userAgent: {
         type: String
      },
      signature: {
         filename: String,
         originalName: String,
         path: String,
         size: Number,
         mimetype: String
      },
      signatoryName: {
         type: String,
         required: true
      },
      position: {
         type: String,
         required: true
      },
      signedDate: {
         type: Date,
         required: true
      }
   },
   
   // File Uploads
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
   businessPlan: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String
   },
   
   // SETUP Process Stages
   currentStage: {
      type: String,
      enum: ['tna_application', 'psto_review', 'tna_assessment', 'rtec_evaluation', 'implementation', 'completed'],
      default: 'tna_application'
   },
   
   // Application Status
   status: {
      type: String,
      enum: ['pending', 'under_review', 'tna_approved', 'tna_rejected', 'rtec_approved', 'rtec_rejected', 'implementation', 'completed'],
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

// Generate unique application ID
setupApplicationSchema.pre('save', async function(next) {
   if (this.isNew) {
      const count = await this.constructor.countDocuments();
      this.applicationId = `SETUP-${String(count + 1).padStart(6, '0')}`;
   }
   next();
});

// Update updatedAt on save
setupApplicationSchema.pre('save', function(next) {
   this.updatedAt = new Date();
   next();
});

// Validate general agreement acceptance
setupApplicationSchema.pre('save', function(next) {
   if (this.isNew && !this.generalAgreement.accepted) {
      const error = new Error('General agreement must be accepted before submission');
      error.name = 'ValidationError';
      return next(error);
   }
   next();
});

module.exports = mongoose.model('SETUPApplication', setupApplicationSchema);
