const mongoose = require('mongoose');

const giaApplicationSchema = new mongoose.Schema({
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
   
   // Research Project Information
   projectTitle: {
      type: String,
      required: true
   },
   projectDuration: {
      type: Number,
      required: true // in months
   },
   requestedAmount: {
      type: Number,
      required: true
   },
   projectDescription: {
      type: String,
      required: true
   },
   objectives: {
      type: [String],
      required: true
   },
   methodology: {
      type: String,
      required: true
   },
   expectedOutputs: {
      type: [String],
      required: true
   },
   
   // Research Team
   principalInvestigator: {
      name: String,
      position: String,
      qualifications: String,
      experience: String
   },
   coInvestigators: [{
      name: String,
      position: String,
      qualifications: String,
      role: String
   }],
   
   // Research Area
   researchArea: {
      type: String,
      required: true,
      enum: ['Agriculture', 'Health', 'Environment', 'Energy', 'Information Technology', 'Manufacturing', 'Other']
   },
   subResearchArea: {
      type: String,
      required: true
   },
   
   // Budget Breakdown
   budgetBreakdown: {
      personnel: Number,
      equipment: Number,
      supplies: Number,
      travel: Number,
      other: Number,
      total: Number
   },
   
   // File Uploads
   researchProposal: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String
   },
   curriculumVitae: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String
   },
   endorsementLetter: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String
   },
   
   // GIA Process Stages
   currentStage: {
      type: String,
      enum: ['proposal_submission', 'technical_review', 'peer_review', 'panel_evaluation', 'approval', 'implementation', 'monitoring', 'completion'],
      default: 'proposal_submission'
   },
   
   // Application Status
   status: {
      type: String,
      enum: ['pending', 'under_review', 'technical_review', 'peer_review', 'panel_evaluation', 'approved', 'rejected', 'implementation', 'completed'],
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
   
   // Technical Review
   technicalReview: {
      technicalFeasibility: String,
      methodologyAssessment: String,
      budgetJustification: String,
      timelineAssessment: String,
      reviewerComments: String,
      reviewedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
      },
      reviewedAt: Date
   },
   
   // Peer Review
   peerReview: {
      scientificMerit: String,
      innovation: String,
      impact: String,
      reviewerComments: String,
      reviewedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
      },
      reviewedAt: Date
   },
   
   // Panel Evaluation
   panelEvaluation: {
      overallScore: Number,
      recommendation: String,
      conditions: [String],
      panelComments: String,
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
giaApplicationSchema.pre('save', async function(next) {
   if (this.isNew) {
      const count = await this.constructor.countDocuments();
      this.applicationId = `GIA-${String(count + 1).padStart(6, '0')}`;
   }
   next();
});

// Update updatedAt on save
giaApplicationSchema.pre('save', function(next) {
   this.updatedAt = new Date();
   next();
});

module.exports = mongoose.model('GIAApplication', giaApplicationSchema);
