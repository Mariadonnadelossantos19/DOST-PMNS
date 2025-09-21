const mongoose = require('mongoose');

const tnaSchema = new mongoose.Schema({
   // TNA Basic Info
   tnaId: {
      type: String,
      required: true,
      unique: true,
      index: true
   },
   
   // Related Application
   applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SETUPApplication',
      required: true
   },
   proponentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   
   // Scheduling Information
   scheduledDate: {
      type: Date,
      required: true
   },
   scheduledTime: {
      type: String,
      required: true
   },
   location: {
      type: String,
      required: true,
      trim: true
   },
   
   // Contact Information
   contactPerson: {
      type: String,
      required: true,
      trim: true
   },
   contactPhone: {
      type: String,
      required: true,
      trim: true
   },
   
   // Assessment Team
   assessors: [{
      name: {
         type: String,
         required: true,
         trim: true
      },
      position: {
         type: String,
         required: false,
         trim: true,
         default: 'Assessment Team Member'
      },
      contact: {
         type: String,
         trim: true
      }
   }],
   
   // TNA Status - Correct DOST PMNS Workflow
   status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'report_uploaded', 'submitted_to_dost', 'cancelled', 'rescheduled'],
      default: 'scheduled'
   },
   
   // Assessment Results
   assessmentDate: {
      type: Date
   },
   assessmentDuration: {
      type: Number // in hours
   },
   
   // Technology Assessment
   currentTechnologyLevel: {
      type: String,
      enum: ['basic', 'intermediate', 'advanced'],
      trim: true
   },
   technologyGaps: [{
      category: String,
      description: String,
      priority: {
         type: String,
         enum: ['low', 'medium', 'high', 'critical']
      }
   }],
   
   // Recommendations
   recommendations: [{
      category: String,
      description: String,
      priority: {
         type: String,
         enum: ['low', 'medium', 'high', 'critical']
      },
      estimatedCost: Number,
      timeline: String
   }],
   
   // TNA Report
   tnaReport: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String
   },
   
   // Notes and Comments
   notes: {
      type: String,
      trim: true
   },
   pstoComments: {
      type: String,
      trim: true
   },
   
   // Assignment
   assignedPSTO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PSTO',
      required: true
   },
   scheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   
   // Timestamps
   createdAt: {
      type: Date,
      default: Date.now
   },
   updatedAt: {
      type: Date,
      default: Date.now
   }
}, {
   timestamps: true,
   collection: 'tnas'
});

// Index for efficient queries
tnaSchema.index({ applicationId: 1 });
tnaSchema.index({ proponentId: 1 });
tnaSchema.index({ assignedPSTO: 1 });
tnaSchema.index({ status: 1 });
tnaSchema.index({ scheduledDate: 1 });

// Generate unique TNA ID
tnaSchema.pre('save', async function(next) {
   if (this.isNew && !this.tnaId) {
      const count = await this.constructor.countDocuments();
      this.tnaId = `TNA_${Date.now()}_${String(count + 1).padStart(4, '0')}`;
   }
   next();
});

// Update the updatedAt field on save
tnaSchema.pre('save', function(next) {
   this.updatedAt = new Date();
   next();
});

module.exports = mongoose.model('TNA', tnaSchema);