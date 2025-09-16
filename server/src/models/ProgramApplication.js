const mongoose = require('mongoose');

const programApplicationSchema = new mongoose.Schema({
   // Application Basic Info
   applicationId: {
      type: String,
      unique: true,
      required: true
   },
   programCode: {
      type: String,
      required: true,
      enum: ['SETUP', 'GIA', 'CEST', 'SSCP']
   },
   programName: {
      type: String,
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
   contactPerson: {
      type: String,
      required: true
   },
   officeAddress: {
      type: String,
      required: true
   },
   factoryAddress: {
      type: String
   },
   website: {
      type: String
   },
   position: {
      type: String,
      required: true,
      enum: ['Owner', 'Manager', 'Director', 'President', 'Other']
   },
   
   // Contact Details
   contactPersonTel: {
      type: String,
      required: true
   },
   factoryTel: {
      type: String
   },
   contactPersonFax: {
      type: String
   },
   factoryFax: {
      type: String
   },
   contactPersonEmail: {
      type: String,
      required: true
   },
   factoryEmail: {
      type: String
   },
   
   // Enterprise Details
   yearEstablished: {
      type: Number,
      required: true
   },
   initialCapital: {
      type: Number,
      default: 0
   },
   organizationType: {
      type: String,
      required: true,
      enum: ['Single proprietorship', 'Cooperative', 'Partnership', 'Corporation']
   },
   profitType: {
      type: String,
      required: true,
      enum: ['Profit', 'Non-profit']
   },
   registrationNo: {
      type: String,
      required: true
   },
   yearRegistered: {
      type: Number,
      required: true
   },
   capitalClassification: {
      type: String,
      required: true,
      enum: ['Micro', 'Small', 'Medium']
   },
   employmentClassification: {
      type: String,
      required: true,
      enum: ['Micro', 'Small', 'Medium']
   },
   
   // Employment Details
   directWorkers: {
      type: Number,
      default: 0
   },
   productionWorkers: {
      type: Number,
      default: 0
   },
   nonProductionWorkers: {
      type: Number,
      default: 0
   },
   contractWorkers: {
      type: Number,
      default: 0
   },
   totalWorkers: {
      type: Number,
      default: 0
   },
   
   // Business Activity
   businessActivity: {
      type: String,
      required: true
   },
   specificProduct: {
      type: String,
      required: true
   },
   enterpriseBackground: {
      type: String,
      required: true
   },
   
   // File Uploads
   letterOfIntent: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String
   },
   enterpriseProfile: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String
   },
   
   // Application Status
   status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected', 'returned'],
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
   
   // PSTO Assignment
   assignedPSTO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PSTO'
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
programApplicationSchema.pre('save', async function(next) {
   if (this.isNew) {
      const count = await this.constructor.countDocuments();
      this.applicationId = `${this.programCode}-${String(count + 1).padStart(6, '0')}`;
   }
   next();
});

// Update updatedAt on save
programApplicationSchema.pre('save', function(next) {
   this.updatedAt = new Date();
   next();
});

module.exports = mongoose.model('ProgramApplication', programApplicationSchema);
