const mongoose = require('mongoose');

const tnaSchema = new mongoose.Schema({
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
   
   // Program name (stored directly for easier access)
   programName: {
      type: String,
      required: false,
      default: 'SETUP'
   },
   
   // TNA scheduling details
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
      required: true
   },
   
   // Assessment team
   assessmentTeam: [{
      name: {
         type: String,
         required: true
      },
      position: {
         type: String,
         required: true
      },
      department: {
         type: String,
         required: true
      }
   }],
   
   // Contact information for TNA
   contactPerson: {
      type: String,
      required: true
   },
   
   position: {
      type: String,
      required: true
   },
   
   phone: {
      type: String,
      required: true
   },
   
   email: {
      type: String,
      required: true
   },
   
   // TNA status
   status: {
      type: String,
      // Expanded to include DOST MIMAROPA review outcomes
      enum: [
         'pending',
         'scheduled',
         'in_progress',
         'completed',
         'report_uploaded',
         'forwarded_to_dost_mimaropa',
         'dost_mimaropa_approved',
         'dost_mimaropa_rejected',
         'returned_to_psto',
         'signed_by_rd',
         'cancelled'
      ],
      default: 'pending'
   },
   
   // Completion tracking
   completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
   },
   
   completedAt: {
      type: Date,
      default: null
   },
   
   updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
   },
   
   // TNA Report
   tnaReport: {
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
      }
   },
   
   // Report details
   reportSummary: {
      type: String,
      default: null
   },
   
   reportRecommendations: {
      type: String,
      default: null
   },
   
   // Technology gaps identified
   technologyGaps: [{
      category: {
         type: String,
         required: true
      },
      description: {
         type: String,
         required: true
      },
      priority: {
         type: String,
         enum: ['high', 'medium', 'low'],
         default: 'medium'
      }
   }],
   
   // Technology recommendations
   technologyRecommendations: [{
      category: {
         type: String,
         required: true
      },
      recommendation: {
         type: String,
         required: true
      },
      priority: {
         type: String,
         enum: ['high', 'medium', 'low'],
         default: 'medium'
      }
   }],
   
   // Forwarding to DOST MIMAROPA
   forwardedToDostMimaropaAt: {
      type: Date,
      default: null
   },
   
   forwardedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
   },
   
   // PSTO that scheduled this TNA
   scheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   
   // Additional notes
   notes: {
      type: String,
      default: null
   },
   
   // DOST MIMAROPA approval timestamp
   dostMimaropaApprovedAt: {
      type: Date,
      default: null
   },

   // RD (Regional Director) signature timestamp
   rdSignedAt: {
      type: Date,
      default: null
   },

   // Forwarded to PSTO timestamp
   forwardedToPSTOAt: {
      type: Date,
      default: null
   },

   // Signed TNA report file (uploaded by DOST MIMAROPA after RD signature)
   signedTnaReport: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String
   }
}, {
   timestamps: true,
   collection: 'tnas'
});

// Index for efficient queries
tnaSchema.index({ applicationId: 1 });
tnaSchema.index({ proponentId: 1 });
tnaSchema.index({ status: 1 });
tnaSchema.index({ scheduledDate: 1 });
tnaSchema.index({ programName: 1 });

// Virtual for formatted scheduled date
tnaSchema.virtual('formattedScheduledDate').get(function() {
   return this.scheduledDate ? this.scheduledDate.toLocaleDateString() : null;
});

// Virtual for formatted scheduled time
tnaSchema.virtual('formattedScheduledTime').get(function() {
   return this.scheduledTime ? this.scheduledTime : null;
});

// Method to mark TNA as completed
tnaSchema.methods.markAsCompleted = function(userId) {
   this.status = 'completed';
   this.completedBy = userId;
   this.completedAt = new Date();
   this.updatedBy = userId;
   return this.save();
};

// Method to mark TNA as in progress
tnaSchema.methods.markAsInProgress = function(userId) {
   this.status = 'in_progress';
   this.updatedBy = userId;
   return this.save();
};

// Method to upload report
tnaSchema.methods.uploadReport = function(reportData, userId) {
   this.tnaReport = {
      ...reportData,
      uploadedAt: new Date(),
      uploadedBy: userId
   };
   this.status = 'report_uploaded';
   this.updatedBy = userId;
   return this.save();
};

// Method to forward to DOST MIMAROPA
tnaSchema.methods.forwardToDostMimaropa = function(userId) {
   this.status = 'forwarded_to_dost_mimaropa';
   this.forwardedToDostMimaropaAt = new Date();
   this.forwardedBy = userId;
   this.updatedBy = userId;
   return this.save();
};

// Ensure virtual fields are serialized
tnaSchema.set('toJSON', {
   virtuals: true
});

module.exports = mongoose.model('TNA', tnaSchema);