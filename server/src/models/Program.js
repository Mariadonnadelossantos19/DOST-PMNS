const mongoose = require('mongoose');

// Program schema
const programSchema = new mongoose.Schema({
   programId: {
      type: String,
      required: true,
      unique: true,
      index: true
   },
   programName: {
      type: String,
      required: true,
      trim: true
   },
   description: {
      type: String,
      required: true,
      trim: true
   },
   code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
   },
   stages: [{
      id: {
         type: String,
         required: true
      },
      name: {
         type: String,
         required: true
      },
      description: {
         type: String,
         trim: true
      },
      required: {
         type: Boolean,
         default: true
      },
      order: {
         type: Number,
         required: true
      }
   }],
   status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'active'
   },
   createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   }
}, {
   timestamps: true,
   collection: 'programs'
});

// Index for efficient queries
programSchema.index({ code: 1 });
programSchema.index({ status: 1 });
programSchema.index({ programName: 1 });

// Ensure virtual fields are serialized
programSchema.set('toJSON', {
   virtuals: true
});

module.exports = mongoose.model('Program', programSchema);
