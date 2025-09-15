const mongoose = require('mongoose');

// TNA (Technology Needs Assessment) schema
const tnaSchema = new mongoose.Schema({
   tnaId: {
      type: String,
      required: true,
      unique: true,
      index: true
   },
   proponentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proponent',
      required: true
   },
   programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',
      required: true
   },
   status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
      default: 'draft'
   },
   // Enterprise Information
   enterpriseName: {
      type: String,
      required: true,
      trim: true
   },
   enterpriseAddress: {
      type: String,
      required: true,
      trim: true
   },
   yearEstablished: {
      type: Number,
      required: true
   },
   initialCapital: {
      type: Number,
      required: true
   },
   typeOfOrganization: {
      type: String,
      required: true,
      enum: ['Individual', 'SME', 'Corporation', 'Cooperative', 'Association'],
      trim: true
   },
   registrationNo: {
      type: String,
      trim: true
   },
   yearRegistered: {
      type: Number
   },
   capitalClassification: {
      type: String,
      enum: ['Micro', 'Small', 'Medium', 'Large'],
      required: true
   },
   employmentClassification: {
      type: String,
      enum: ['Micro', 'Small', 'Medium', 'Large'],
      required: true
   },
   totalEmployees: {
      type: Number,
      required: true,
      min: 1
   },
   businessActivity: {
      type: String,
      required: true,
      trim: true
   },
   background: {
      type: String,
      required: true,
      trim: true
   },
   assistanceReason: {
      type: String,
      required: true,
      trim: true
   },
   consultedOther: {
      type: String,
      trim: true
   },
   dateCreated: {
      type: Date,
      default: Date.now
   },
   // Technology Assessment
   currentTechnology: {
      type: String,
      trim: true
   },
   technologyNeeds: {
      type: String,
      required: true,
      trim: true
   },
   expectedOutcomes: {
      type: String,
      trim: true
   },
   budgetRequirement: {
      type: Number,
      required: true
   },
   timeline: {
      type: String,
      required: true,
      trim: true
   },
   documents: [{
      fileName: String,
      filePath: String,
      uploadedAt: { type: Date, default: Date.now }
   }],
   // Review Information
   submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
   },
   reviewDate: {
      type: Date
   },
   reviewRemarks: {
      type: String,
      trim: true
   },
   reviewStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
   }
}, {
   timestamps: true,
   collection: 'tnas'
});

// Pre-save middleware to generate TNA ID
tnaSchema.pre('save', async function(next) {
   if (this.isNew) {
      const count = await mongoose.model('TNA').countDocuments();
      this.tnaId = `TNA${String(count + 1).padStart(5, '0')}`;
   }
   next();
});

module.exports = mongoose.model('TNA', tnaSchema);
