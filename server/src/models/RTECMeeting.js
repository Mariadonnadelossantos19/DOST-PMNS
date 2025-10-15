const mongoose = require('mongoose');

const rtecMeetingSchema = new mongoose.Schema({
   // Reference to the TNA (optional for batch meetings)
   tnaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TNA',
      required: function() {
         return !this.isBatchMeeting;
      }
   },
   
   // Reference to the RTEC Documents (must be approved, optional for batch meetings)
   rtecDocumentsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RTECDocuments',
      required: function() {
         return !this.isBatchMeeting;
      }
   },
   
   // Reference to the application (optional for batch meetings)
   applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SETUPApplication',
      required: function() {
         return !this.isBatchMeeting;
      }
   },
   
   // Reference to the proponent (optional for batch meetings)
   proponentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function() {
         return !this.isBatchMeeting;
      }
   },
   
   // Program name
   programName: {
      type: String,
      required: false,
      default: 'SETUP'
   },
   
   // Meeting details
   meetingTitle: {
      type: String,
      required: true,
      trim: true
   },
   
   meetingDescription: {
      type: String,
      required: false,
      trim: true
   },
   
   // Meeting schedule
   scheduledDate: {
      type: Date,
      required: true
   },
   
   scheduledTime: {
      type: String,
      required: true,
      trim: true
   },
   
   // Meeting location
   location: {
      type: String,
      required: true,
      trim: true
   },
   
   meetingType: {
      type: String,
      enum: ['physical', 'virtual', 'hybrid'],
      default: 'physical'
   },
   
   // Virtual meeting details (if applicable)
   virtualMeetingLink: {
      type: String,
      required: false,
      trim: true
   },
   
   virtualMeetingId: {
      type: String,
      required: false,
      trim: true
   },
   
   virtualMeetingPassword: {
      type: String,
      required: false,
      trim: true
   },
   
   // Meeting status
   status: {
      type: String,
      enum: [
         'scheduled',
         'confirmed',
         'completed',
         'rtec_completed',
         'rtec_revision_requested',
         'cancelled',
         'postponed'
      ],
      default: 'scheduled'
   },
   
   // RTEC completion tracking
   rtecCompleted: {
      type: Boolean,
      default: false
   },
   
   rtecCompletedAt: {
      type: Date,
      default: null
   },
   
   rtecCompletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
   },
   
   // RTEC evaluation data
   evaluationOutcome: {
      type: String,
      enum: ['with revision', 'approved'],
      default: null
   },
   
   evaluationComment: {
      type: String,
      trim: true
   },
   
   recommendations: {
      type: String,
      trim: true
   },
   
   nextSteps: {
      type: String,
      trim: true
   },
   
   // Meeting completion tracking
   completedAt: {
      type: Date,
      default: null
   },
   
   completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
   },
   
   // Meeting participants
   participants: [{
      userId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         required: true
      },
      role: {
         type: String,
         enum: ['chair', 'member', 'secretary', 'observer'],
         default: 'member'
      },
      status: {
         type: String,
         enum: ['invited', 'confirmed', 'declined', 'attended', 'absent'],
         default: 'invited'
      },
      invitedAt: {
         type: Date,
         default: Date.now
      },
      respondedAt: {
         type: Date
      }
   }],
   
   // Meeting timeline
   scheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   
   scheduledAt: {
      type: Date,
      default: Date.now
   },
   
   // Additional notes
   notes: {
      type: String,
      trim: true
   },

   // Batch meeting fields
   isBatchMeeting: {
      type: Boolean,
      default: false
   },

   pstoProvince: {
      type: String,
      required: false,
      trim: true
   },

   applications: [{
      applicationId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'SETUPApplication',
         required: true
      },
      status: {
         type: String,
         enum: ['scheduled', 'completed', 'cancelled'],
         default: 'scheduled'
      }
   }]
}, {
   timestamps: true,
   collection: 'rtec_meetings'
});

// Indexes for efficient queries
rtecMeetingSchema.index({ tnaId: 1 });
rtecMeetingSchema.index({ rtecDocumentsId: 1 });
rtecMeetingSchema.index({ applicationId: 1 });
rtecMeetingSchema.index({ proponentId: 1 });
rtecMeetingSchema.index({ scheduledDate: 1 });
rtecMeetingSchema.index({ status: 1 });
rtecMeetingSchema.index({ 'participants.userId': 1 });

// Pre-save middleware to automatically fix invalid participant statuses
rtecMeetingSchema.pre('save', function(next) {
   const validStatuses = ['invited', 'confirmed', 'declined', 'attended', 'absent'];
   let fixedCount = 0;
   
   this.participants.forEach((participant, index) => {
      if (!validStatuses.includes(participant.status)) {
         console.log(`🔧 Pre-save: Fixing invalid status for participant ${index}: ${participant.status} -> invited`);
         participant.status = 'invited';
         participant.invitedAt = new Date();
         fixedCount++;
      }
   });
   
   if (fixedCount > 0) {
      console.log(`🔧 Pre-save: Fixed ${fixedCount} invalid participant statuses`);
   }
   
   next();
});

// Method to add participant
rtecMeetingSchema.methods.addParticipant = function(userId, role = 'member') {
   const existingParticipant = this.participants.find(p => p.userId.toString() === userId.toString());
   
   if (!existingParticipant) {
      this.participants.push({
         userId,
         role,
         status: 'invited',
         invitedAt: new Date()
      });
   }
   
   return this.save();
};

// Method to confirm participant attendance
rtecMeetingSchema.methods.confirmParticipant = function(userId, status = 'confirmed') {
   const participant = this.participants.find(p => p.userId.toString() === userId.toString());
   
   if (participant) {
      participant.status = status;
      participant.respondedAt = new Date();
   }
   
   return this.save();
};

// Method to update meeting status
rtecMeetingSchema.methods.updateStatus = function(status) {
   this.status = status;
   return this.save();
};

// Method to resend invitation to a specific participant
rtecMeetingSchema.methods.resendInvitation = function(participantId) {
   const participant = this.participants.find(p => 
      p.userId._id?.toString() === participantId || p.userId.toString() === participantId
   );
   
   if (participant) {
      participant.status = 'invited';
      participant.invitedAt = new Date();
   }
   
   return this.save();
};

// Method to validate and fix all participant statuses
rtecMeetingSchema.methods.validateParticipantStatuses = function() {
   const validStatuses = ['invited', 'confirmed', 'declined', 'attended', 'absent'];
   let fixedCount = 0;
   
   this.participants.forEach((participant, index) => {
      if (!validStatuses.includes(participant.status)) {
         console.log(`🔧 Fixing invalid status for participant ${index}: ${participant.status} -> invited`);
         participant.status = 'invited';
         participant.invitedAt = new Date(); // Update the invited date
         fixedCount++;
      }
   });
   
   // Mark the document as modified to ensure changes are saved
   this.markModified('participants');
   
   return fixedCount;
};

// Static method to get meetings by date range
rtecMeetingSchema.statics.getMeetingsByDateRange = async function(startDate, endDate, options = {}) {
   const query = {
      scheduledDate: {
         $gte: startDate,
         $lte: endDate
      }
   };
   
   if (options.status) {
      query.status = options.status;
   }
   
   if (options.programName) {
      query.programName = options.programName;
   }
   
   return await this.find(query)
      .populate('tnaId', 'scheduledDate location programName status')
      .populate('rtecDocumentsId', 'status requestedAt submittedAt reviewedAt')
      .populate('applicationId', 'enterpriseName companyName projectTitle programName businessActivity')
      .populate('proponentId', 'firstName lastName email')
      .populate('participants.userId', 'firstName lastName email')
      .populate('scheduledBy', 'firstName lastName')
      .sort({ scheduledDate: 1 });
};

// Static method to get meetings for user
rtecMeetingSchema.statics.getUserMeetings = async function(userId, options = {}) {
   const query = {
      $or: [
         { proponentId: userId },
         { 'participants.userId': userId },
         { scheduledBy: userId }
      ]
   };
   
   if (options.status) {
      query.status = options.status;
   }
   
   return await this.find(query)
      .populate('tnaId', 'scheduledDate location programName status')
      .populate('rtecDocumentsId', 'status requestedAt submittedAt reviewedAt')
      .populate('applicationId', 'enterpriseName companyName projectTitle programName businessActivity')
      .populate('proponentId', 'firstName lastName email')
      .populate('participants.userId', 'firstName lastName email')
      .populate('scheduledBy', 'firstName lastName')
      .sort({ scheduledDate: 1 });
};

module.exports = mongoose.model('RTECMeeting', rtecMeetingSchema);
