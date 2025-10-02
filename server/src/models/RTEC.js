const mongoose = require('mongoose');

const rtecSchema = new mongoose.Schema({
   // Basic meeting information
   meetingTitle: {
      type: String,
      required: true
   },
   
   meetingDate: {
      type: Date,
      required: true
   },
   
   meetingTime: {
      type: String,
      required: true
   },
   
   meetingLocation: {
      type: String,
      required: true
   },
   
   meetingMode: {
      type: String,
      enum: ['physical', 'virtual', 'hybrid'],
      default: 'physical'
   },
   
   meetingLink: {
      type: String,
      default: null
   },
   
   // Related entities
   tnaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TNA',
      required: true
   },
   
   applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true
   },
   
   proponentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proponent',
      required: true
   },
   
   pstoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   
   // Meeting status
   status: {
      type: String,
      enum: [
         'draft',
         'scheduled',
         'meeting_sent',
         'proposal_requested',
         'documents_submitted',
         'under_review',
         'evaluation_completed',
         'approved',
         'rejected',
         'needs_revision',
         'cancelled',
         'rescheduled'
      ],
      default: 'draft'
   },
   
   // Scheduling information
   scheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   
   scheduledAt: {
      type: Date,
      default: Date.now
   },
   
   // Committee members
   committeeMembers: [{
      memberId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
      },
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
      },
      email: {
         type: String,
         required: true
      },
      phone: String,
      role: {
         type: String,
         enum: ['chairperson', 'member', 'secretary'],
         default: 'member'
      }
   }],
   
   // Contact person for the meeting
   contactPerson: {
      name: {
         type: String,
         required: true
      },
      position: {
         type: String,
         required: true
      },
      email: {
         type: String,
         required: true
      },
      phone: {
         type: String,
         required: true
      }
   },
   
   // Meeting agenda and objectives
   agenda: {
      type: String,
      default: null
   },
   
   objectives: {
      type: String,
      default: null
   },
   
   // Meeting notes
   notes: {
      type: String,
      default: null
   },
   
   // Invitation details
   invitationSentAt: {
      type: Date,
      default: null
   },
   
   invitationSentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
   },
   
   // Proposal request details
   proposalRequestedAt: {
      type: Date,
      default: null
   },
   
   proposalRequestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
   },
   
   proposalDeadline: {
      type: Date,
      default: null
   },
   
   // Pre-meeting required documents (3 documents needed before scheduling)
   preMeetingDocuments: [{
      documentType: {
         type: String,
         required: true,
         enum: [
            'approved tna report',
            'risk  management plan',
            'financial statements'
         ]
      },
      documentName: {
         type: String,
         required: true
      },
      description: {
         type: String,
         default: null
      },
      isRequired: {
         type: Boolean,
         default: true
      },
      isSubmitted: {
         type: Boolean,
         default: false
      },
      submittedAt: {
         type: Date,
         default: null
      },
      submittedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         default: null
      },
      file: {
         filename: String,
         originalName: String,
         path: String,
         size: Number,
         mimetype: String
      },
      remarks: {
         type: String,
         default: null
      },
      deadline: {
         type: Date,
         default: null
      },
      status: {
         type: String,
         enum: ['pending', 'submitted', 'reviewed', 'approved', 'rejected', 'needs_revision'],
         default: 'pending'
      }
   }],

   // Post-meeting required documents (13 documents needed after RTEC meeting)
   postMeetingDocuments: [{
      documentType: {
         type: String,
         required: true,
         enum: [
            'letter of intent',
            'duly  accomplished dost tna form 01',
            'duly accomplished DOST TNA form 02',
            'setup form 001   ',
            'business permit',
            'certificate of registration  with the dti',
            'photocopy  of the official  reciept  of the firm',
            'artricles  of incorporation  for cooperatives  and  association  as proponent  ',
            'board legistative council  resolution autorizing  the availment of the assistance for corporations, cooperatives, SUCs and LGUs;',
            'sworn  affidavit',
            'project financial  statement',
            'technical Specifications and design/drawing picture of the equipment',
            'three qoutations  from suppliers/ fabricator '
         ]
      },
      documentName: {
         type: String,
         required: true
      },
      description: {
         type: String,
         default: null
      },
      isRequired: {
         type: Boolean,
         default: true
      },
      isSubmitted: {
         type: Boolean,
         default: false
      },
      submittedAt: {
         type: Date,
         default: null
      },
      submittedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         default: null
      },
      file: {
         filename: String,
         originalName: String,
         path: String,
         size: Number,
         mimetype: String
      },
      remarks: {
         type: String,
         default: null
      },
      deadline: {
         type: Date,
         default: null
      },
      status: {
         type: String,
         enum: ['pending', 'submitted', 'reviewed', 'approved', 'rejected', 'needs_revision'],
         default: 'pending'
      }
   }],
   
   // RTEC evaluation results
   evaluationResults: {
      overallScore: {
         type: Number,
         min: 0,
         max: 100,
         default: null
      },
      technicalScore: {
         type: Number,
         min: 0,
         max: 100,
         default: null
      },
      financialScore: {
         type: Number,
         min: 0,
         max: 100,
         default: null
      },
      managementScore: {
         type: Number,
         min: 0,
         max: 100,
         default: null
      },
      recommendation: {
         type: String,
         enum: ['approve', 'approve_with_conditions', 'reject', 'needs_revision'],
         default: null
      },
      comments: {
         type: String,
         default: null
      },
      conditions: [{
         description: String,
         deadline: Date,
         status: {
            type: String,
            enum: ['pending', 'completed', 'overdue'],
            default: 'pending'
         }
      }],
      evaluatedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
      },
      evaluatedAt: {
         type: Date,
         default: null
      }
   },
   
   // Previous meeting reference (if rescheduled)
   previousMeetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RTEC',
      default: null
   },
   
   // Rescheduling details
   rescheduledFrom: {
      type: Date,
      default: null
   },
   
   rescheduledReason: {
      type: String,
      default: null
   },
   
   // Meeting attendance
   attendance: [{
      memberId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
      },
      name: String,
      position: String,
      department: String,
      attended: {
         type: Boolean,
         default: false
      },
      attendanceTime: Date,
      remarks: String
   }],
   
   // Follow-up actions
   followUpActions: [{
      description: String,
      assignedTo: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
      },
      dueDate: Date,
      status: {
         type: String,
         enum: ['pending', 'in_progress', 'completed', 'overdue'],
         default: 'pending'
      },
      completedAt: Date
   }],
   
   // Completion tracking
   completedAt: {
      type: Date,
      default: null
   },
   
   completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
   }
}, {
   timestamps: true,
   collection: 'rtecs'
});

// Index for efficient queries
rtecSchema.index({ tnaId: 1 });
rtecSchema.index({ applicationId: 1 });
rtecSchema.index({ proponentId: 1 });
rtecSchema.index({ status: 1 });
rtecSchema.index({ meetingDate: 1 });
rtecSchema.index({ scheduledBy: 1 });
rtecSchema.index({ pstoId: 1 });

// Virtual for formatted meeting date
rtecSchema.virtual('formattedMeetingDate').get(function() {
   return this.meetingDate ? this.meetingDate.toLocaleDateString() : null;
});

// Virtual for formatted meeting time
rtecSchema.virtual('formattedMeetingTime').get(function() {
   return this.meetingTime ? this.meetingTime : null;
});

// Method to send meeting invitation
rtecSchema.methods.sendInvitation = function(userId) {
   this.status = 'meeting_sent';
   this.invitationSentAt = new Date();
   this.invitationSentBy = userId;
   return this.save();
};

// Method to request proposal submission
rtecSchema.methods.requestProposal = function(userId) {
   this.status = 'proposal_requested';
   this.proposalRequestedAt = new Date();
   this.proposalRequestedBy = userId;
   return this.save();
};

// Method to initialize required documents
rtecSchema.methods.initializeRequiredDocuments = function() {
   // Pre-meeting documents (3 documents needed before scheduling)
   const preMeetingDocumentTypes = [
      { type: 'approved tna report', name: 'Approved TNA Report', description: 'Approved TNA Report with Signature' },
      { type: 'risk  management plan', name: 'Risk Management Plan', description: 'Risk Management Plan' },
      { type: 'financial statements', name: 'Financial Statements', description: 'Financial statements for the last 3 years for small and medium enterprises and at least 1 year for micro-enterprises together with notarized sworn statement from the proponent that all the information provided are correct and used' }
   ];

   // Post-meeting documents (13 documents needed after RTEC meeting)
   const postMeetingDocumentTypes = [
      { type: 'letter of intent', name: 'Letter of Intent', description: 'Letter of Intent to avail SETUP assistance, stating commitment to refund the fund support and cover the insurance cost for the acquire equipment' },
      { type: 'duly  accomplished dost tna form 01', name: 'Duly Accomplished DOST TNA Form 01', description: 'Technology Needs Assessment Report (ANNEX I-1)' },
      { type: 'duly accomplished DOST TNA form 02', name: 'Duly Accomplished DOST TNA Form 02', description: 'Technology Needs Assessment Report (ANNEX I-2)' },
      { type: 'setup form 001   ', name: 'SETUP Form 001', description: 'Proposal using the SETUP Form 001- Project Proposal Format (ANNEX A-1)' },
      { type: 'business permit', name: 'Business Permit', description: 'Copy of Business Permit/License issued by the LGU and other appropriate government agencies' },
      { type: 'certificate of registration  with the dti', name: 'Certificate of Registration with the DTI', description: 'Certificate of Registration with the DTI, securities, and exchange commission (SEC) or cooperative development authority (CDA), whichever is applicable' },
      { type: 'photocopy  of the official  reciept  of the firm', name: 'Photocopy of the Official Receipt of the Firm', description: 'Photocopy of the Official Receipt of the Firm' },
      { type: 'artricles  of incorporation  for cooperatives  and  association  as proponent  ', name: 'Articles of Incorporation for Cooperatives and Association as Proponent', description: 'Articles of Incorporation for Cooperatives and Association as Proponent' },
      { type: 'board legistative council  resolution autorizing  the availment of the assistance for corporations, cooperatives, SUCs and LGUs;', name: 'Board Legislative Council Resolution Authorizing the Availment of the Assistance for Corporations, Cooperatives, SUCs and LGUs', description: 'Board Legislative Council Resolution Authorizing the Availment of the Assistance for Corporations, Cooperatives, SUCs and LGUs' },
      { type: 'sworn  affidavit', name: 'Sworn Affidavit', description: 'Sworn affidavit that none of the incorporators/official or applicants is related to the approving authority up to the third degree of consanguinity and affinity and the proponent has no bad debt' },
      { type: 'project financial  statement', name: 'Project Financial Statement', description: 'Projected financial statement for the number of years depending on the proposed project duration' },
      { type: 'technical Specifications and design/drawing picture of the equipment', name: 'Technical Specifications and Design/Drawing Picture of the Equipment', description: 'Technical Specifications and Design/Drawing Picture of the Equipment to be Acquired, as Determined in the TNA Report (DOST TNA FORM 02)' },
      { type: 'three qoutations  from suppliers/ fabricator ', name: 'Three Quotations from Suppliers/Fabricator', description: 'Three Quotations from Suppliers/Fabricator for each equipment to be acquired, as indicated item. The conditions required in the DOST purchase order (i.e. warranty of the equipment and after sales support, terms of payment, and retention of payment for applicable equipment) shall be followed. If the proponent cannot find the sufficient number of suppliers especially in times of emergency or calamity situation, the proponent should submit an affidavit stating the unavailability of suppliers for the needed equipment in the area' }
   ];

   // Initialize pre-meeting documents
   this.preMeetingDocuments = preMeetingDocumentTypes.map(doc => ({
      documentType: doc.type,
      documentName: doc.name,
      description: doc.description,
      isRequired: true,
      isSubmitted: false,
      status: 'pending'
   }));

   // Initialize post-meeting documents
   this.postMeetingDocuments = postMeetingDocumentTypes.map(doc => ({
      documentType: doc.type,
      documentName: doc.name,
      description: doc.description,
      isRequired: true,
      isSubmitted: false,
      status: 'pending'
   }));

   return this.save();
};

// Method to submit a document
rtecSchema.methods.submitDocument = function(documentType, file, submittedBy, remarks = null) {
   // Check if it's a pre-meeting document
   const preMeetingDoc = this.preMeetingDocuments.find(doc => doc.documentType === documentType);
   if (preMeetingDoc) {
      preMeetingDoc.isSubmitted = true;
      preMeetingDoc.submittedAt = new Date();
      preMeetingDoc.submittedBy = submittedBy;
      preMeetingDoc.file = file;
      preMeetingDoc.remarks = remarks;
      preMeetingDoc.status = 'submitted';
      return this.save();
   }

   // Check if it's a post-meeting document
   const postMeetingDoc = this.postMeetingDocuments.find(doc => doc.documentType === documentType);
   if (postMeetingDoc) {
      postMeetingDoc.isSubmitted = true;
      postMeetingDoc.submittedAt = new Date();
      postMeetingDoc.submittedBy = submittedBy;
      postMeetingDoc.file = file;
      postMeetingDoc.remarks = remarks;
      postMeetingDoc.status = 'submitted';
      return this.save();
   }

   throw new Error('Document type not found');
};

// Method to review a document
rtecSchema.methods.reviewDocument = function(documentType, status, reviewedBy, remarks = null) {
   // Check if it's a pre-meeting document
   const preMeetingDoc = this.preMeetingDocuments.find(doc => doc.documentType === documentType);
   if (preMeetingDoc) {
      preMeetingDoc.status = status;
      preMeetingDoc.remarks = remarks;
      return this.save();
   }

   // Check if it's a post-meeting document
   const postMeetingDoc = this.postMeetingDocuments.find(doc => doc.documentType === documentType);
   if (postMeetingDoc) {
      postMeetingDoc.status = status;
      postMeetingDoc.remarks = remarks;
      return this.save();
   }

   throw new Error('Document type not found');
};

// Method to reschedule meeting
rtecSchema.methods.rescheduleMeeting = function(newDate, newTime, reason, rescheduledBy) {
   this.rescheduledFrom = this.meetingDate;
   this.rescheduledReason = reason;
   this.meetingDate = newDate;
   this.meetingTime = newTime;
   this.status = 'rescheduled';
   return this.save();
};

// Method to mark attendance
rtecSchema.methods.markAttendance = function(memberId, attended, remarks = null) {
   const attendance = this.attendance.find(att => att.memberId.toString() === memberId.toString());
   if (attendance) {
      attendance.attended = attended;
      attendance.attendanceTime = attended ? new Date() : null;
      attendance.remarks = remarks;
   } else {
      this.attendance.push({
         memberId,
         attended,
         attendanceTime: attended ? new Date() : null,
         remarks
      });
   }
   return this.save();
};

// Method to add follow-up action
rtecSchema.methods.addFollowUpAction = function(description, assignedTo, dueDate) {
   this.followUpActions.push({
      description,
      assignedTo,
      dueDate,
      status: 'pending'
   });
   return this.save();
};

// Method to update follow-up action
rtecSchema.methods.updateFollowUpAction = function(actionId, status, completedAt = null) {
   const action = this.followUpActions.id(actionId);
   if (action) {
      action.status = status;
      if (status === 'completed') {
         action.completedAt = completedAt || new Date();
      }
   }
   return this.save();
};

// Method to cancel meeting
rtecSchema.methods.cancelMeeting = function(reason, cancelledBy) {
   this.status = 'cancelled';
   this.notes = this.notes ? `${this.notes}\n\nCancelled: ${reason}` : `Cancelled: ${reason}`;
   return this.save();
};

module.exports = mongoose.model('RTEC', rtecSchema);