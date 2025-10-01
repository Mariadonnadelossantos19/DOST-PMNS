const mongoose = require('mongoose');

const rtecSchema = new mongoose.Schema({
   // Reference to the TNA
   tnaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TNA',
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
   
   // Meeting title
   meetingTitle: {
      type: String,
      required: true
   },
   
   // RTEC meeting details
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
   
   meetingType: {
      type: String,
      enum: ['physical', 'virtual', 'hybrid'],
      default: 'physical'
   },
   
   meetingLink: {
      type: String,
      default: null
   },
   
   // RTEC Committee members
   committeeMembers: [{
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
      phone: {
         type: String,
         default: null
      },
      role: {
         type: String,
         enum: ['chair', 'member', 'secretary'],
         default: 'member'
      }
   }],
   
   // Contact person for RTEC
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
   
   // RTEC status
   status: {
      type: String,
      enum: [
         'scheduled',
         'meeting_sent',
         'proposal_requested',
         'proposal_submitted',
         'under_review',
         'approved',
         'rejected',
         'cancelled',
         'completed',
         'rescheduled'
      ],
      default: 'scheduled'
   },
   
   // Meeting invitation details
   invitationSentAt: {
      type: Date,
      default: null
   },
   
   invitationSentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
   },
   
   // Proposal request details
   proposalRequestedAt: {
      type: Date,
      default: null
   },
   
   proposalRequestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
   },
   
   // Proposal submission details
   proposalSubmittedAt: {
      type: Date,
      default: null
   },
   
   proposalSubmittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
   },
   
   // Proposal files
   proposalFiles: [{
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String,
      uploadedAt: {
         type: Date,
         default: Date.now
      },
      uploadedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
      }
   }],
   
   // Required documents checklist (16 different documents)
   requiredDocuments: [{
      documentType: {
         type: String,
         required: true,
         enum: [
            'approved tna report',
            'risk  management plan',
            'letter of intent',
            'duly  accomplished dost tna form 01',
            'duly accomplished DOST TNA form 02',
            'setup form 001   ',
            'business permit',
            'certificate of registration  with the dti',
            'photocopy  of the official  reciept  of the firm',
            'artricles  of incorporation  for cooperatives  and  association  as proponent  ',
            'board legistative council  resolution autorizing  the availment of the assistance for corporations, cooperatives, SUCs and LGUs;',
            'financial statements',
            'sworn  affidavit',
            'project financial  statement',
            'technical Specifications and design/drawing picture of the equipment',
            'three qoutations  from suppliers/ fabricator ',
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
         enum: ['approve', 'reject', 'conditional_approval', 'defer'],
         default: null
      },
      comments: {
         type: String,
         default: null
      },
      conditions: [{
         description: String,
         isRequired: {
            type: Boolean,
            default: true
         },
         deadline: Date
      }]
   },
   
   // RTEC meeting minutes
   meetingMinutes: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String,
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
   
   // Scheduled by (DOST MIMAROPA)
   scheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   
   // PSTO responsible for submission
   pstoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   
   // Additional notes
   notes: {
      type: String,
      default: null
   },
   
   // Meeting agenda
   agenda: {
      type: String,
      default: null
   },
   
   // Meeting objectives
   objectives: [{
      description: String,
      priority: {
         type: String,
         enum: ['high', 'medium', 'low'],
         default: 'medium'
      }
   }],
   
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

// Method to mark proposal as submitted
rtecSchema.methods.markProposalSubmitted = function(userId) {
   this.status = 'proposal_submitted';
   this.proposalSubmittedAt = new Date();
   this.proposalSubmittedBy = userId;
   return this.save();
};

// Method to start evaluation
rtecSchema.methods.startEvaluation = function(userId) {
   this.status = 'under_review';
   this.updatedBy = userId;
   return this.save();
};

// Method to complete evaluation
rtecSchema.methods.completeEvaluation = function(evaluationData, userId) {
   this.evaluationResults = evaluationData;
   this.status = evaluationData.recommendation === 'approve' ? 'approved' : 'rejected';
   this.completedAt = new Date();
   this.completedBy = userId;
   return this.save();
};

// Method to reschedule meeting
rtecSchema.methods.rescheduleMeeting = function(newDate, newTime, reason, userId) {
   this.rescheduledFrom = this.meetingDate;
   this.meetingDate = newDate;
   this.meetingTime = newTime;
   this.rescheduledReason = reason;
   this.status = 'rescheduled';
   this.updatedBy = userId;
   return this.save();
};

// Method to mark attendance
rtecSchema.methods.markAttendance = function(memberId, attended, remarks, userId) {
   const member = this.attendance.find(att => att.memberId.toString() === memberId.toString());
   if (member) {
      member.attended = attended;
      member.attendanceTime = new Date();
      member.remarks = remarks;
   }
   this.updatedBy = userId;
   return this.save();
};

// Method to add follow-up action
rtecSchema.methods.addFollowUpAction = function(actionData, userId) {
   this.followUpActions.push({
      ...actionData,
      status: 'pending'
   });
   this.updatedBy = userId;
   return this.save();
};

// Method to update follow-up action status
rtecSchema.methods.updateFollowUpAction = function(actionId, status, userId) {
   const action = this.followUpActions.id(actionId);
   if (action) {
      action.status = status;
      if (status === 'completed') {
         action.completedAt = new Date();
      }
   }
   this.updatedBy = userId;
   return this.save();
};

// Method to cancel meeting
rtecSchema.methods.cancelMeeting = function(reason, userId) {
   this.status = 'cancelled';
   this.notes = this.notes ? `${this.notes}\nCancelled: ${reason}` : `Cancelled: ${reason}`;
   this.updatedBy = userId;
   return this.save();
};

// Method to initialize required documents
rtecSchema.methods.initializeRequiredDocuments = function() {
   const documentTypes = [
      { type: 'approved tna report', name: 'Approved TNA Report', description: 'Approved TNA Report with Signature' },
      { type: 'risk  management plan', name: 'Risk Management Plan', description: 'Risk Management Plan' },
      { type: 'letter of intent', name: 'Letter of Intent', description: 'Letter of Intent to  avail  SETUP assistance, stating committment to  refundd the  Ifund support and cover the insurance cost for the acquire equipment' },
      { type: 'duly  accomplished dost tna form 01', name: 'Duly  Accomplished DOST TNA Form 01', description: 'Technologgy Needs Assessment Report (ANNEX I-1)' },
      { type: 'duly accomplished DOST TNA form 02', name: 'Duly Accomplished DOST TNA Form 02', description: 'Technologgy Needs Assessment Report (ANNEX I-2)' },
      { type: 'setup form 001   ', name: 'SETUP Form 001', description: 'Proposal using the SETUP Form 001- Project  Proposal Format (ANNEX A-1)' },
      { type: 'business permit', name: 'Business Permit', description: 'Copy  of Business Permit/License issued by  the LGU and other appropriate  government  agencies' },
      { type: 'certificate of registration  with the dti', name: 'Certificate of Registration with the DTI', description: ' Certificate of Registration with the DTI , securitiies,  and exchange commision (SEC) or cooperative  development  authority  (CDA), whichever is applicable;' },
      { type: 'photocopy  of the official  reciept  of the firm', name: 'Photocopy of the Official Reciept of the Firm', description: 'Photocopy of the Official Reciept of the Firm' },
      { type: 'artricles  of incorporation  for cooperatives  and  association  as proponent  ', name: 'Articles of Incorporation for Cooperatives and Association as Proponent', description: 'Articles of Incorporation for Cooperatives and Association as Proponent' },
      { type: 'board legistative council  resolution autorizing  the availment of the assistance for corporations, cooperatives, SUCs and LGUs;', name: 'Board Legistative Council Resolution Autorizing the Availment of the Assistance for Corporations, Cooperatives, SUCs and LGUs;', description: 'Board Legistative Council Resolution Autorizing the Availment of the Assistance for Corporations, Cooperatives, SUCs and LGUs;' },
      { type: 'financial statements', name: 'Financial Statements', description: 'Financial statements  for the  last 3 years for small and medium enterprises  and  atleast 1 year for micro-enterprises  together with notarized  sworn  statement from the proponent that  all the informmation  priovided are correct  anddd use'},
      { type: 'sworn  affidavit', name: 'Sworn Affidavit', description: 'Sworn  affiddavit  that  none of the  incorporators/ official  or applicants  is relatrredd to  the approving  authority  up to  the thirdd degree  of consangunity andd  affinity and  the  proponent  has no  bad dept.' },
      { type: 'project financial  statement', name: 'Project Financial Statement', description: 'Projected financial statement  foor the number of years epening on the  proposed project duration' },
      { type: 'technical Specifications and design/drawing picture of the equipment', name: 'Technical Specifications and Design/Drawing Picture of the Equipment', description: 'Technical Specifications and Design/Drawing Picture of the Equipment to be Acquire, as Determined in the TNA Report (DOST TNA FORM 02)' },
      { type: 'three qoutations  from suppliers/ fabricator ', name: 'Three Qoutations from Suppliers/ Fabricator', description: 'Three Qoutations from Suppliers/ Fabricator for  each  equipment  to  be acquired., as indicated item. The conditions  required  in the DOST purchase order(i.e.. warranty n of the equipment  andd after sales support, terms of payment, and retention  of payment for applicable equipment) shall be followed. if the proponent  cannot  find the suffecient number  of suppliers especially  in times of emergency  or calamity situation, the proponent should  submit the  aand affidavit stating the unavailability of suppliers  for tghe needed  equipment in the area' },
     
   ];

   this.requiredDocuments = documentTypes.map(doc => ({
      documentType: doc.type,
      documentName: doc.name,
      description: doc.description,
      isRequired: true,
      isSubmitted: false,
      status: 'pending'
   }));

   return this.save();
};

// Method to submit document
rtecSchema.methods.submitDocument = function(documentType, fileData, userId) {
   const document = this.requiredDocuments.find(doc => doc.documentType === documentType);
   if (document) {
      document.isSubmitted = true;
      document.submittedAt = new Date();
      document.submittedBy = userId;
      document.file = fileData;
      document.status = 'submitted';
   }
   this.updatedBy = userId;
   return this.save();
};

// Method to review document
rtecSchema.methods.reviewDocument = function(documentType, status, remarks, userId) {
   const document = this.requiredDocuments.find(doc => doc.documentType === documentType);
   if (document) {
      document.status = status;
      document.remarks = remarks;
   }
   this.updatedBy = userId;
   return this.save();
};

// Ensure virtual fields are serialized
rtecSchema.set('toJSON', {
   virtuals: true
});

module.exports = mongoose.model('RTEC', rtecSchema);
