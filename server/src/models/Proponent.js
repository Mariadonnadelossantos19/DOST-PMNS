const mongoose = require('mongoose');

// Proponent schema
const proponentSchema = new mongoose.Schema({
   proponentId: {
      type: String,
      required: true,
      unique: true,
      index: true
   },
   programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',
      required: true
   },
   name: {
      type: String,
      required: true,
      trim: true
   },
   type: {
      type: String,
      required: true,
      enum: ['Individual', 'SME', 'Corporation', 'Cooperative', 'Association'],
      trim: true
   },
   contactInfo: {
      phone: {
         type: String,
         trim: true
      },
      address: {
         type: String,
         required: true,
         trim: true
      }
   },
   email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
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
   province: {
      type: String,
      required: true,
      enum: ['Marinduque', 'Occidental Mindoro', 'Oriental Mindoro', 'Romblon', 'Palawan'],
      trim: true
   },
   status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
   },
   enrolledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PSTO',
      required: true
   },
   enrolledDate: {
      type: Date,
      default: Date.now
   }
}, {
   timestamps: true,
   collection: 'proponents'
});

// Index for efficient queries
proponentSchema.index({ email: 1 });
proponentSchema.index({ province: 1 });
proponentSchema.index({ enrolledBy: 1 });
proponentSchema.index({ status: 1 });

// Virtual for full proponent ID
proponentSchema.virtual('fullProponentId').get(function() {
   return `PROP_${this.province.replace(/\s+/g, '')}_${this.proponentId}`;
});

// Pre-save middleware to generate proponent ID
proponentSchema.pre('save', function(next) {
   if (!this.proponentId) {
      const timestamp = Date.now().toString().slice(-6);
      const provinceCode = this.province.replace(/\s+/g, '').substring(0, 3).toUpperCase();
      this.proponentId = `${provinceCode}_${timestamp}`;
   }
   next();
});

// Ensure virtual fields are serialized
proponentSchema.set('toJSON', {
   virtuals: true
});

module.exports = mongoose.model('Proponent', proponentSchema);
