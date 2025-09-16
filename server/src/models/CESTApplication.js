const mongoose = require('mongoose');

const cestApplicationSchema = new mongoose.Schema({
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
   
   // Community Information
   communityName: {
      type: String,
      required: true
   },
   communityLocation: {
      type: String,
      required: true
   },
   communityPopulation: {
      type: Number,
      required: true
   },
   communityLeader: {
      name: String,
      position: String,
      contact: String
   },
   
   // Project Information
   projectTitle: {
      type: String,
      required: true
   },
   projectDuration: {
      type: Number,
      required: true // in months
   },
   projectDescription: {
      type: String,
      required: true
   },
   communityNeeds: {
      type: [String],
      required: true
   },
   proposedSolution: {
      type: String,
      required: true
   },
   expectedImpact: {
      type: String,
      required: true
   },
   
   // Technology Focus
   technologyArea: {
      type: String,
      required: true,
      enum: ['Agriculture', 'Health', 'Education', 'Environment', 'Energy', 'Information Technology', 'Water', 'Other']
   },
   specificTechnology: {
      type: String,
      required: true
   },
   
   // Community Engagement
   communityParticipation: {
      type: String,
      required: true
   },
   localPartners: [{
      name: String,
      type: String,
      role: String
   }],
   
   // Budget Information
   totalBudget: {
      type: Number,
      required: true
   },
   requestedAmount: {
      type: Number,
      required: true
   },
   communityContribution: {
      type: Number,
      required: true
   },
   
   // File Uploads
   communityProfile: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String
   },
   projectProposal: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String
   },
   communityResolution: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String
   },
   
   // CEST Process Stages
   currentStage: {
      type: String,
      enum: ['proposal_submission', 'community_validation', 'technical_review', 'approval', 'implementation', 'monitoring', 'completion'],
      default: 'proposal_submission'
   },
   
   // Application Status
   status: {
      type: String,
      enum: ['pending', 'under_review', 'community_validated', 'technical_review', 'approved', 'rejected', 'implementation', 'completed'],
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
   
   // Community Validation
   communityValidation: {
      validated: Boolean,
      validationDate: Date,
      communityFeedback: String,
      validatedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
      }
   },
   
   // Technical Review
   technicalReview: {
      technicalFeasibility: String,
      communityReadiness: String,
      sustainability: String,
      reviewerComments: String,
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
cestApplicationSchema.pre('save', async function(next) {
   if (this.isNew) {
      const count = await this.constructor.countDocuments();
      this.applicationId = `CEST-${String(count + 1).padStart(6, '0')}`;
   }
   next();
});

// Update updatedAt on save
cestApplicationSchema.pre('save', function(next) {
   this.updatedAt = new Date();
   next();
});

module.exports = mongoose.model('CESTApplication', cestApplicationSchema);
