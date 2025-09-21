const mongoose = require('mongoose');
const Notification = require('./src/models/Notification');

async function createTestNotifications() {
   try {
      await mongoose.connect('mongodb://localhost:27017/dost-pmns');
      console.log('Connected to MongoDB');

      const proponentId = '68cfa0919ebdc3e041207f9c';

      // Create test notifications
      const notifications = [
         {
            title: 'Application Submitted',
            message: 'Your SETUP application has been successfully submitted and is now under review by PSTO Marinduque.',
            recipientId: proponentId,
            recipientType: 'proponent',
            type: 'application_submitted',
            relatedEntityType: 'application',
            relatedEntityId: new mongoose.Types.ObjectId(),
            actionUrl: '/dashboard',
            actionText: 'View Application',
            priority: 'high',
            sentBy: proponentId
         },
         {
            title: 'TNA Scheduled',
            message: 'Your Technology Needs Assessment (TNA) has been scheduled for September 25, 2025 at 2:00 PM. Please prepare your documents.',
            recipientId: proponentId,
            recipientType: 'proponent',
            type: 'tna_scheduled',
            relatedEntityType: 'tna',
            relatedEntityId: new mongoose.Types.ObjectId(),
            actionUrl: '/dashboard',
            actionText: 'View TNA Details',
            priority: 'high',
            sentBy: proponentId
         },
         {
            title: 'Document Required',
            message: 'Additional documents are required for your application. Please upload the missing documents.',
            recipientId: proponentId,
            recipientType: 'proponent',
            type: 'document_required',
            relatedEntityType: 'application',
            relatedEntityId: new mongoose.Types.ObjectId(),
            actionUrl: '/dashboard',
            actionText: 'Upload Documents',
            priority: 'medium',
            sentBy: proponentId
         }
      ];

      for (const notifData of notifications) {
         const notification = new Notification(notifData);
         await notification.save();
         console.log('✅ Created notification:', notification.title);
      }

      console.log('🎉 All test notifications created successfully!');
      
      // Verify notifications were created
      const count = await Notification.countDocuments({ recipientId: proponentId });
      console.log(`📊 Total notifications for proponent: ${count}`);

   } catch (error) {
      console.error('❌ Error creating notifications:', error);
   } finally {
      await mongoose.disconnect();
      process.exit(0);
   }
}

createTestNotifications();
