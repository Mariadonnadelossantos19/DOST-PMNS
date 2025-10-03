const express = require('express');
const router = express.Router();
const { 
   getProponentNotifications, 
   getPSTONotifications,
   getDOSTNotifications,
   markNotificationAsRead, 
   markAllNotificationsAsRead 
} = require('../controllers/notificationController');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Notification routes
router.get('/proponent/:proponentId', auth, getProponentNotifications);
router.get('/psto/:pstoId', auth, getPSTONotifications);
router.get('/dost/:dostId', auth, getDOSTNotifications);
router.patch('/:notificationId/read', auth, markNotificationAsRead);
router.patch('/proponent/:proponentId/mark-all-read', auth, markAllNotificationsAsRead);
router.patch('/psto/:pstoId/mark-all-read', auth, markAllNotificationsAsRead);
router.patch('/dost/:dostId/mark-all-read', auth, markAllNotificationsAsRead);

// Test endpoint for creating notifications
router.post('/test', auth, async (req, res) => {
   try {
      const { recipientId, title, message, type } = req.body;
      
      const notification = await Notification.createNotification({
         title: title || 'Test Notification',
         message: message || 'This is a test notification',
         recipientId: recipientId,
         recipientType: 'proponent',
         type: type || 'test',
         relatedEntityType: 'test',
         relatedEntityId: new Date().getTime().toString(),
         actionUrl: '/dashboard',
         actionText: 'View Dashboard',
         priority: 'low',
         sentBy: req.user.id
      });

      res.json({
         success: true,
         message: 'Test notification created',
         notification: notification
      });
   } catch (error) {
      console.error('Error creating test notification:', error);
      res.status(500).json({
         success: false,
         message: 'Error creating test notification',
         error: error.message
      });
   }
});

module.exports = router;
