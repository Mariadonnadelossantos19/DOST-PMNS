const mongoose = require('mongoose');

// User schema for MongoDB
const userSchema = new mongoose.Schema({
   userId: {
      type: String,
      required: true,
      unique: true,
      index: true
   },
   firstName: {
      type: String,
      required: true,
      trim: true
   },
   lastName: {
      type: String,
      required: true,
      trim: true
   },
   email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
   },
   password: {
      type: String,
      required: true,
      minlength: 6
   },
   role: {
      type: String,
      enum: ['psto', 'dost_mimaropa', 'super_admin', 'proponent'],
      required: true,
      default: 'psto'
   },
   department: {
      type: String,
      required: true,
      trim: true
   },
   position: {
      type: String,
      required: true,
      trim: true
   },
   province: {
      type: String,
      required: function() {
         return this.role === 'psto' || this.role === 'proponent';
      },
      enum: ['Marinduque', 'Occidental Mindoro', 'Oriental Mindoro', 'Romblon', 'Palawan', 'MIMAROPA'],
      trim: true
   },
   // Proponent-specific fields
   proponentInfo: {
      phone: {
         type: String,
         trim: true
      },
      address: {
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
      organizationType: {
         type: String,
         enum: ['Individual', 'SME', 'Corporation', 'Cooperative', 'Association'],
         trim: true
      }
   },
   // Auto-assigned PSTO based on province
   assignedPSTO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PSTO',
      default: null
   },
   status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active'
   },
   createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
   },
   // PSTO activation fields
   activatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
   },
   activatedAt: {
      type: Date,
      default: null
   },
   lastLogin: {
      type: Date,
      default: null
   },
   // Password reset fields
   resetPasswordToken: {
      type: String,
      default: null
   },
   resetPasswordExpires: {
      type: Date,
      default: null
   }
}, {
   timestamps: true,
   collection: 'users'
});

// Index for efficient queries
userSchema.index({ role: 1 });
userSchema.index({ province: 1 });
userSchema.index({ status: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
   return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
   virtuals: true
});

module.exports = mongoose.model('User', userSchema);
