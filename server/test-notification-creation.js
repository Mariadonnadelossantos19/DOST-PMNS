const mongoose = require('mongoose');
const User = require('./src/models/User');
const Notification = require('./src/models/Notification');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pmns', {
   useNewUrlParser: true,
   useUnifiedTopology: true
});

async function testNotificationCreation() {
   try {
      console.log('🧪 Testing notification creation...');
      
      // Find a PSTO user
      const pstoUser = await User.findOne({ role: 'psto' });
      if (!pstoUser) {
         console.log('❌ No PSTO user found');
         return;
      }
      
      console.log(`📋 Found PSTO user: ${pstoUser.firstName} ${pstoUser.lastName} (${pstoUser.userId})`);
      
      // Create a test notification
      const notification = await Notification.create({
         recipientId: pstoUser._id,
         recipientType: 'psto',
         type: 'application_submitted',
         title: 'Test Application Notification',
         message: 'A new SETUP application has been submitted by Shabu shabu and assigned to you for review.',
         relatedEntityType: 'application',
         relatedEntityId: new mongoose.Types.ObjectId(),
         actionUrl: '/psto/applications/test',
         actionText: 'Review Application',
         priority: 'high',
         sentBy: new mongoose.Types.ObjectId()
      });
      
      console.log('✅ Test notification created successfully:', notification._id);
      console.log('📱 PSTO user should now see this notification in their notification center');
      
   } catch (error) {
      console.error('❌ Error creating test notification:', error);
   } finally {
      mongoose.connection.close();
   }
}

testNotificationCreation();
