const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
   // Notification Basic Info
   title: {
      type: String,
      required: true,
      trim: true
   },
   message: {
      type: String,
      required: true,
      trim: true
   },
   
   // Recipient
   recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   recipientType: {
      type: String,
      enum: ['proponent', 'psto', 'dost_mimaropa', 'super_admin'],
      required: true
   },
   
   // Notification Type
   type: {
      type: String,
      enum: [
         'application_submitted',
         'application_approved',
         'application_rejected',
         'application_returned',
         'tna_scheduled',
         'tna_completed',
         'document_required',
         'status_update',
         'rtec_scheduled',
         'rtec_document_request',
         'rtec_revision_requested',
         'meeting_invitation',
         'proposal_request',
         'general'
      ],
      required: true
   },
   
   // Related Entity
   relatedEntityType: {
      type: String,
      enum: ['application', 'tna', 'user', 'rtec', 'general'],
      default: 'general'
   },
   relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
   },
   
   // Action
   actionUrl: {
      type: String,
      trim: true
   },
   actionText: {
      type: String,
      trim: true,
      default: 'View Details'
   },
   
   // Status
   isRead: {
      type: Boolean,
      default: false
   },
   readAt: {
      type: Date
   },
   
   // Priority
   priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
   },
   
   // Expiration
   expiresAt: {
      type: Date
   },
   
   // Sender
   sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
   }
}, {
   timestamps: true,
   collection: 'notifications'
});

// Index for efficient queries
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ recipientType: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 });

// Mark as read
notificationSchema.methods.markAsRead = function() {
   this.isRead = true;
   this.readAt = new Date();
   return this.save();
};

// Check if notification is expired
notificationSchema.methods.isExpired = function() {
   return this.expiresAt && new Date() > this.expiresAt;
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
   const {
      title,
      message,
      recipientId,
      recipientType,
      type,
      relatedEntityType = 'general',
      relatedEntityId = null,
      actionUrl = null,
      actionText = 'View Details',
      priority = 'medium',
      expiresAt = null,
      sentBy = null
   } = data;

   const notification = new this({
      title,
      message,
      recipientId,
      recipientType,
      type,
      relatedEntityType,
      relatedEntityId,
      actionUrl,
      actionText,
      priority,
      expiresAt,
      sentBy
   });

   return await notification.save();
};

// Static method to get notifications for user
notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
   const {
      limit = 50,
      skip = 0,
      unreadOnly = false,
      type = null
   } = options;

   const query = { recipientId: userId };
   
   if (unreadOnly) {
      query.isRead = false;
   }
   
   if (type) {
      query.type = type;
   }

   const notifications = await this.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

   const unreadCount = await this.countDocuments({
      recipientId: userId,
      isRead: false
   });

   return {
      notifications,
      unreadCount
   };
};

module.exports = mongoose.model('Notification', notificationSchema);
