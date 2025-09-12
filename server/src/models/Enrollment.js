const mongoose = require('mongoose');

// Service stages schema
const serviceStageSchema = new mongoose.Schema({
   id: {
      type: String,
      required: true
   },
   name: {
      type: String,
      required: true
   },
   required: {
      type: Boolean,
      default: true
   },
   completed: {
      type: Boolean,
      default: false
   },
   completedDate: {
      type: Date,
      default: null
   },
   notes: {
      type: String,
      default: ''
   }
}, { _id: false });

// Customer information schema
const customerSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
      trim: true
   },
   email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
   },
   phone: {
      type: String,
      trim: true
   },
   businessName: {
      type: String,
      trim: true
   },
   businessType: {
      type: String,
      trim: true
   },
   address: {
      type: String,
      trim: true
   }
}, { _id: false });

// TNA specific information schema
const tnaInfoSchema = new mongoose.Schema({
   affiliation: {
      type: String,
      required: true,
      enum: ['MSME', 'LGU', 'SUC', 'Cooperative', 'NGO', 'Other']
   },
   otherAffiliation: {
      type: String,
      trim: true
   },
   contactPerson: {
      type: String,
      required: true,
      trim: true
   },
   position: {
      type: String,
      required: true,
      trim: true
   },
   officeAddress: {
      type: String,
      required: true,
      trim: true
   },
   contactNumber: {
      type: String,
      required: true,
      trim: true
   },
   emailAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
   },
   // Document uploads
   letterOfIntent: {
      filename: String,
      originalName: String,
      path: String,
      uploadedAt: Date
   },
   dostTnaForm: {
      filename: String,
      originalName: String,
      path: String,
      uploadedAt: Date
   },
   enterpriseProfile: {
      filename: String,
      originalName: String,
      path: String,
      uploadedAt: Date
   }
}, { _id: false });

// Service options schema
const serviceDataSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true
   },
   description: {
      type: String,
      required: true
   }
}, { _id: false });

// Main enrollment schema
const enrollmentSchema = new mongoose.Schema({
   enrollmentId: {
      type: String,
      required: true,
      unique: true,
      index: true
   },
   customer: {
      type: customerSchema,
      required: true
   },
   tnaInfo: {
      type: tnaInfoSchema,
      required: false
   },
   service: {
      type: String,
      required: true,
      enum: ['SETUP', 'GIA', 'CEST', 'SSCP']
   },
   serviceData: {
      type: serviceDataSchema,
      required: true
   },
   status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'],
      default: 'draft'
   },
   province: {
      type: String,
      required: true,
      enum: ['Marinduque', 'Occidental Mindoro', 'Oriental Mindoro', 'Romblon', 'Palawan', 'MIMAROPA'],
      index: true
   },
   enrolledDate: {
      type: Date,
      default: Date.now
   },
   currentStage: {
      type: String,
      default: 'tna'
   },
   stages: [serviceStageSchema],
   completedDate: {
      type: Date,
      default: null
   },
   enrolledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null
   },
   notes: {
      type: String,
      default: ''
   },
   // TNA workflow specific fields
   tnaStatus: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected'],
      default: 'pending'
   },
   reviewNotes: {
      type: String,
      default: ''
   },
   reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
   },
   reviewedAt: {
      type: Date,
      default: null
   },
   submittedAt: {
      type: Date,
      default: null
   }
}, {
   timestamps: true,
   collection: 'enrollments'
});

// Indexes for efficient queries
enrollmentSchema.index({ province: 1, status: 1 });
enrollmentSchema.index({ service: 1 });
enrollmentSchema.index({ enrolledDate: -1 });
enrollmentSchema.index({ 'customer.email': 1 });

// Virtual for enrollment reference
enrollmentSchema.virtual('enrollmentRef').get(function() {
   return `ENR-${this.enrollmentId}`;
});

// Ensure virtual fields are serialized
enrollmentSchema.set('toJSON', {
   virtuals: true
});

// Pre-save middleware to generate enrollment ID (fallback)
enrollmentSchema.pre('save', async function(next) {
   if (this.isNew && !this.enrollmentId) {
      try {
         const count = await this.constructor.countDocuments();
         this.enrollmentId = `ENR-${String(count + 1).padStart(6, '0')}`;
      } catch (error) {
         console.error('Error generating enrollment ID:', error);
         return next(error);
      }
   }
   next();
});

// Method to update stage status
enrollmentSchema.methods.updateStageStatus = function(stageId, completed, notes = '') {
   const stage = this.stages.find(s => s.id === stageId);
   if (stage) {
      stage.completed = completed;
      if (completed) {
         stage.completedDate = new Date();
      }
      if (notes) {
         stage.notes = notes;
      }
      
      // Find next incomplete stage
      const nextStage = this.stages.find(s => !s.completed);
      this.currentStage = nextStage ? nextStage.id : 'completed';
      
      // Update overall status
      if (this.currentStage === 'completed') {
         this.status = 'completed';
         this.completedDate = new Date();
      } else {
         this.status = 'in_progress';
      }
   }
   return this.save();
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);
