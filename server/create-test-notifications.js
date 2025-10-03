const mongoose = require('mongoose');
const Notification = require('./src/models/Notification');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pmns', {
   useNewUrlParser: true,
   useUnifiedTopology: true
});

async function createTestNotifications() {
   try {
      console.log('🔍 Creating test notifications for PSTO users...');
      
      // Find PSTO users
      const pstoUsers = await User.find({ role: 'psto' });
      console.log(`📋 Found ${pstoUsers.length} PSTO users`);
      
      if (pstoUsers.length === 0) {
         console.log('❌ No PSTO users found');
         return;
      }
      
      // Create test notifications for each PSTO user
      for (const psto of pstoUsers) {
         console.log(`📝 Creating notifications for PSTO: ${psto.firstName} ${psto.lastName}`);
         
         // Create application submitted notification
         await Notification.create({
            recipientId: psto._id,
            recipientType: 'psto',
            type: 'application_submitted',
            title: 'New Application Submitted',
            message: 'A new SETUP application has been submitted by Test Enterprise and assigned to you for review.',
            relatedEntityType: 'application',
            relatedEntityId: new mongoose.Types.ObjectId(),
            actionUrl: '/psto/applications',
            actionText: 'Review Application',
            priority: 'high',
            sentBy: psto._id
         });
         
         // Create TNA scheduled notification
         await Notification.create({
            recipientId: psto._id,
            recipientType: 'psto',
            type: 'tna_scheduled',
            title: 'TNA Assessment Scheduled',
            message: 'A Technology Needs Assessment has been scheduled for Test Enterprise application.',
            relatedEntityType: 'tna',
            relatedEntityId: new mongoose.Types.ObjectId(),
            actionUrl: '/psto/tna-management',
            actionText: 'View TNA Details',
            priority: 'medium',
            sentBy: psto._id
         });
         
         // Create TNA completed notification
         await Notification.create({
            recipientId: psto._id,
            recipientType: 'psto',
            type: 'tna_completed',
            title: 'TNA Assessment Completed',
            message: 'The Technology Needs Assessment for Test Enterprise has been completed and is ready for review.',
            relatedEntityType: 'tna',
            relatedEntityId: new mongoose.Types.ObjectId(),
            actionUrl: '/psto/tna-management',
            actionText: 'Review TNA Report',
            priority: 'medium',
            sentBy: psto._id
         });
         
         console.log(`✅ Created 3 test notifications for ${psto.firstName} ${psto.lastName}`);
      }
      
      console.log('🎉 Test notifications created successfully!');
      console.log('📱 PSTO users should now see application and TNA notifications in their notification center.');
      
   } catch (error) {
      console.error('❌ Error creating test notifications:', error);
   } finally {
      mongoose.connection.close();
   }
}

createTestNotifications();