const mongoose = require('mongoose');

// PSTO (Provincial Science and Technology Office) schema
const pstoSchema = new mongoose.Schema({
   pstoId: {
      type: String,
      required: true,
      unique: true,
      index: true
   },
   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
   },
   programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',
      required: true
   },
   officeName: {
      type: String,
      required: true,
      trim: true
   },
   contactInfo: {
      phone: {
         type: String,
         trim: true
      },
      address: {
         type: String,
         trim: true
      },
      email: {
         type: String,
         trim: true,
         lowercase: true
      }
   },
   province: {
      type: String,
      required: true,
      enum: ['Marinduque', 'Occidental Mindoro', 'Oriental Mindoro', 'Romblon', 'Palawan'],
      trim: true
   },
   status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
   },
   establishedDate: {
      type: Date,
      default: Date.now
   }
}, {
   timestamps: true,
   collection: 'pstos'
});

// Index for efficient queries
pstoSchema.index({ province: 1 });
pstoSchema.index({ programId: 1 });
pstoSchema.index({ status: 1 });

// Virtual for full office name
pstoSchema.virtual('fullOfficeName').get(function() {
   return `PSTO ${this.province}`;
});

// Ensure virtual fields are serialized
pstoSchema.set('toJSON', {
   virtuals: true
});

module.exports = mongoose.model('PSTO', pstoSchema);
