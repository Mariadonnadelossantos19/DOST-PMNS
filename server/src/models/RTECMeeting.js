const mongoose = require('mongoose');

const rtecMeetingSchema = new mongoose.Schema({
   // Reference to the TNA
   tnaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TNA',
      required: true
   },
   
   // Reference to the RTEC Documents (must be approved)
   rtecDocumentsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RTECDocuments',
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
         'cancelled',
         'postponed'
      ],
      default: 'scheduled'
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
   }
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
