const mongoose = require('mongoose');

const sscpApplicationSchema = new mongoose.Schema({
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
   enterpriseType: {
      type: String,
      required: true,
      enum: ['Startup', 'SME', 'Corporation', 'Cooperative']
   },   
   yearsInOperation: {
      type: Number,
      required: true
   },
   
   // Innovation Information
   innovationTitle: {
      type: String,
      required: true
   },
   innovationDescription: {
      type: String,
      required: true
   },
   technologyReadinessLevel: {
      type: String,
      required: true,
      enum: ['TRL 1', 'TRL 2', 'TRL 3', 'TRL 4', 'TRL 5', 'TRL 6', 'TRL 7', 'TRL 8', 'TRL 9']
   },
   marketPotential: {
      type: String,
      required: true
   },
   competitiveAdvantage: {
      type: String,
      required: true
   },
   
   // Commercialization Plan
   targetMarket: {
      type: String,
      required: true
   },
   businessModel: {
      type: String,
      required: true
   },
   revenueProjection: {
      year1: Number,
      year2: Number,
      year3: Number
   },
   marketStrategy: {
      type: String,
      required: true
   },
   
   // Financial Information
   totalProjectCost: {
      type: Number,
      required: true
   },
   requestedAmount: {
      type: Number,
      required: true
   },
   equityContribution: {
      type: Number,
      required: true
   },
   otherFunding: {
      type: Number,
      default: 0
   },
   
   // Team Information
   projectLeader: {
      name: String,
      position: String,
      qualifications: String,
      experience: String
   },
   technicalTeam: [{
      name: String,
      role: String,
      qualifications: String
   }],
   businessTeam: [{
      name: String,
      role: String,
      qualifications: String
   }],
   
   // Intellectual Property
   patents: [{
      title: String,
      status: String,
      number: String
   }],
   trademarks: [{
      name: String,
      status: String,
      number: String
   }],
   copyrights: [{
      title: String,
      status: String,
      number: String
   }],
   
   // File Uploads
   businessPlan: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String
   },
   technicalDocumentation: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String
   },
   marketStudy: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String
   },
   financialProjections: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String
   },
   
   // SSCP Process Stages
   currentStage: {
      type: String,
      enum: ['proposal_submission', 'technical_evaluation', 'business_evaluation', 'panel_review', 'approval', 'implementation', 'monitoring', 'completion'],
      default: 'proposal_submission'
   },
   
   // Application Status
   status: {
      type: String,
      enum: ['pending', 'under_review', 'technical_evaluation', 'business_evaluation', 'panel_review', 'approved', 'rejected', 'implementation', 'completed'],
      default: 'pending'
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
   
   // Technical Evaluation
   technicalEvaluation: {
      innovationLevel: String,
      technicalFeasibility: String,
      marketReadiness: String,
      scalability: String,
      reviewerComments: String,
      reviewedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
      },
      reviewedAt: Date
   },
   
   // Business Evaluation
   businessEvaluation: {
      marketPotential: String,
      businessModel: String,
      financialViability: String,
      teamCapability: String,
      reviewerComments: String,
      reviewedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
      },
      reviewedAt: Date
   },
   
   // Panel Review
   panelReview: {
      overallScore: Number,
      recommendation: String,
      conditions: [String],
      panelComments: String,
      reviewedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
      },
      reviewedAt: Date
   },
   
   // Implementation Tracking
   implementation: {
      startDate: Date,
      milestones: [{
         description: String,
         targetDate: Date,
         completedDate: Date,
         status: String
      }],
      challenges: [String],
      achievements: [String]
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
sscpApplicationSchema.pre('save', async function(next) {
   if (this.isNew) {
      const count = await this.constructor.countDocuments();
      this.applicationId = `SSCP-${String(count + 1).padStart(6, '0')}`;
   }
   next();
});

// Update updatedAt on save
sscpApplicationSchema.pre('save', function(next) {
   this.updatedAt = new Date();
   next();
});

module.exports = mongoose.model('SSCPApplication', sscpApplicationSchema);
