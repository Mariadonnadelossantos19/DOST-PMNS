const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Get notifications for proponent
const getProponentNotifications = async (req, res) => {
   try {
      const { proponentId } = req.params;
      const { limit = 50, skip = 0, unreadOnly = false } = req.query;

      // Verify proponent - check if proponentId is a valid ObjectId or userId
      let proponent;
      if (mongoose.Types.ObjectId.isValid(proponentId)) {
         proponent = await User.findById(proponentId);
      } else {
         proponent = await User.findOne({ userId: proponentId });
      }
      
      if (!proponent || proponent.role !== 'proponent') {
         return res.status(404).json({
            success: false,
            message: 'Proponent not found'
         });
      }

      const result = await Notification.getUserNotifications(proponent._id, {
         limit: parseInt(limit),
         skip: parseInt(skip),
         unreadOnly: unreadOnly === 'true'
      });

      res.json({
         success: true,
         notifications: result.notifications,
         unreadCount: result.unreadCount
      });

   } catch (error) {
      console.error('Get proponent notifications error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Get notifications for PSTO
const getPSTONotifications = async (req, res) => {
   try {
      const { pstoId } = req.params;
      const { limit = 50, skip = 0, unreadOnly = false } = req.query;

      // Verify PSTO - check if pstoId is a valid ObjectId or userId
      let psto;
      if (mongoose.Types.ObjectId.isValid(pstoId)) {
         psto = await User.findById(pstoId);
      } else {
         psto = await User.findOne({ userId: pstoId });
      }
      
      if (!psto || psto.role !== 'psto') {
         return res.status(404).json({
            success: false,
            message: 'PSTO user not found'
         });
      }

      const result = await Notification.getUserNotifications(psto._id, {
         limit: parseInt(limit),
         skip: parseInt(skip),
         unreadOnly: unreadOnly === 'true'
      });

      res.json({
         success: true,
         notifications: result.notifications,
         unreadCount: result.unreadCount
      });

   } catch (error) {
      console.error('Get PSTO notifications error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Get notifications for DOST-MIMAROPA
const getDOSTNotifications = async (req, res) => {
   try {
      const { dostId } = req.params;
      const { limit = 50, skip = 0, unreadOnly = false } = req.query;

      // Verify DOST-MIMAROPA - check if dostId is a valid ObjectId or userId
      let dost;
      if (mongoose.Types.ObjectId.isValid(dostId)) {
         dost = await User.findById(dostId);
      } else {
         dost = await User.findOne({ userId: dostId });
      }
      
      if (!dost || dost.role !== 'dost_mimaropa') {
         return res.status(404).json({
            success: false,
            message: 'DOST-MIMAROPA user not found'
         });
      }

      const result = await Notification.getUserNotifications(dost._id, {
         limit: parseInt(limit),
         skip: parseInt(skip),
         unreadOnly: unreadOnly === 'true'
      });

      res.json({
         success: true,
         notifications: result.notifications,
         unreadCount: result.unreadCount
      });

   } catch (error) {
      console.error('Get DOST notifications error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
   try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findById(notificationId);
      if (!notification) {
         return res.status(404).json({
            success: false,
            message: 'Notification not found'
         });
      }

      // Verify user owns the notification
      if (notification.recipientId.toString() !== userId) {
         return res.status(403).json({
            success: false,
            message: 'Access denied'
         });
      }

      await notification.markAsRead();

      res.json({
         success: true,
         message: 'Notification marked as read'
      });

   } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Mark all notifications as read for proponent
const markAllNotificationsAsRead = async (req, res) => {
   try {
      const { proponentId } = req.params;
      const userId = req.user.id;

      // Verify user is the proponent
      if (proponentId !== userId) {
         return res.status(403).json({
            success: false,
            message: 'Access denied'
         });
      }

      // Get the actual user ObjectId
      let user;
      if (mongoose.Types.ObjectId.isValid(proponentId)) {
         user = await User.findById(proponentId);
      } else {
         user = await User.findOne({ userId: proponentId });
      }

      if (!user) {
         return res.status(404).json({
            success: false,
            message: 'User not found'
         });
      }

      await Notification.updateMany(
         { recipientId: user._id, isRead: false },
         { isRead: true, readAt: new Date() }
      );

      res.json({
         success: true,
         message: 'All notifications marked as read'
      });

   } catch (error) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Create notification (internal use)
const createNotification = async (data) => {
   try {
      const notification = await Notification.createNotification(data);
      return notification;
   } catch (error) {
      console.error('Create notification error:', error);
      throw error;
   }
};

// Create application status notification
const createApplicationStatusNotification = async (application, status, comments = '') => {
   try {
      const proponentId = application.proponentId;
      const programName = application.programName || 'Program';
      
      let title, message, type, actionUrl;

      switch (status) {
         case 'psto_approved':
            title = 'Application Approved by PSTO';
            message = `Your ${programName} application has been approved by PSTO and forwarded to DOST MIMAROPA for review.`;
            type = 'application_approved';
            actionUrl = '/applications';
            break;
            
         case 'psto_rejected':
            title = 'Application Rejected by PSTO';
            message = `Your ${programName} application has been rejected by PSTO. ${comments ? 'Comments: ' + comments : ''}`;
            type = 'application_rejected';
            actionUrl = '/applications';
            break;
            
         case 'returned':
            title = 'Application Returned for Revision';
            message = `Your ${programName} application has been returned for revision. ${comments ? 'Comments: ' + comments : ''}`;
            type = 'application_returned';
            actionUrl = '/applications';
            break;
            
         case 'tna_scheduled':
            title = 'TNA Scheduled';
            message = `Technology Needs Assessment has been scheduled for your ${programName} application.`;
            type = 'tna_scheduled';
            actionUrl = '/applications';
            break;
            
         case 'tna_completed':
            title = 'TNA Completed';
            message = `Technology Needs Assessment has been completed for your ${programName} application. Your application will now be reviewed by DOST MIMAROPA before proceeding to RTEC evaluation.`;
            type = 'tna_completed';
            actionUrl = '/applications';
            break;
            
         case 'dost_mimaropa_approved':
            title = 'Application Approved by DOST MIMAROPA';
            message = `Your ${programName} application has been approved by DOST MIMAROPA and forwarded to RTEC for evaluation.`;
            type = 'application_approved';
            actionUrl = '/applications';
            break;
            
         case 'dost_mimaropa_rejected':
            title = 'Application Rejected by DOST MIMAROPA';
            message = `Your ${programName} application has been rejected by DOST MIMAROPA.`;
            type = 'application_rejected';
            actionUrl = '/applications';
            break;
            
         case 'rtec_approved':
            title = 'Application Approved by RTEC';
            message = `Your ${programName} application has been approved by RTEC. You can now proceed with implementation.`;
            type = 'application_approved';
            actionUrl = '/applications';
            break;
            
         case 'rtec_rejected':
            title = 'Application Rejected by RTEC';
            message = `Your ${programName} application has been rejected by RTEC.`;
            type = 'application_rejected';
            actionUrl = '/applications';
            break;
            
         default:
            title = 'Application Status Update';
            message = `Your ${programName} application status has been updated.`;
            type = 'status_update';
            actionUrl = '/applications';
      }

      const notification = await Notification.createNotification({
         title,
         message,
         recipientId: proponentId,
         recipientType: 'proponent',
         type,
         relatedEntityType: 'application',
         relatedEntityId: application._id,
         actionUrl,
         priority: status.includes('rejected') ? 'high' : 'medium'
      });

      return notification;

   } catch (error) {
      console.error('Create application status notification error:', error);
      throw error;
   }
};

// Create TNA notification
const createTNANotification = async (tna, type) => {
   try {
      const proponentId = tna.proponentId;
      const applicationId = tna.applicationId;
      
      let title, message, actionUrl;

      switch (type) {
         case 'scheduled':
            title = 'TNA Scheduled';
            message = `Technology Needs Assessment has been scheduled for ${new Date(tna.scheduledDate).toLocaleDateString()} at ${tna.location}.`;
            actionUrl = '/applications';
            break;
            
         case 'completed':
            title = 'TNA Completed';
            message = `Technology Needs Assessment has been completed. The report is being prepared.`;
            actionUrl = '/applications';
            break;
            
         default:
            title = 'TNA Update';
            message = `Technology Needs Assessment status has been updated.`;
            actionUrl = '/applications';
      }

      const notification = await Notification.createNotification({
         title,
         message,
         recipientId: proponentId,
         recipientType: 'proponent',
         type: 'tna_scheduled',
         relatedEntityType: 'tna',
         relatedEntityId: tna._id,
         actionUrl,
         priority: 'medium'
      });

      return notification;

   } catch (error) {
      console.error('Create TNA notification error:', error);
      throw error;
   }
};

module.exports = {
   getProponentNotifications,
   getPSTONotifications,
   getDOSTNotifications,
   markNotificationAsRead,
   markAllNotificationsAsRead,
   createNotification,
   createApplicationStatusNotification,
   createTNANotification
};