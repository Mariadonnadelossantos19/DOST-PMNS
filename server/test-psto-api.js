const mongoose = require('mongoose');
const User = require('./src/models/User');
const Notification = require('./src/models/Notification');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pmns', {
   useNewUrlParser: true,
   useUnifiedTopology: true
});

async function testPSTOAPI() {
   try {
      console.log('🧪 Testing PSTO notifications API...');
      
      // Find a PSTO user
      const pstoUser = await User.findOne({ role: 'psto' });
      if (!pstoUser) {
         console.log('❌ No PSTO user found');
         return;
      }
      
      console.log(`📋 Found PSTO user: ${pstoUser.firstName} ${pstoUser.lastName} (${pstoUser.userId})`);
      console.log(`📋 PSTO user ID: ${pstoUser._id}`);
      
      // Check if there are notifications for this PSTO user
      const notifications = await Notification.find({ 
         recipientId: pstoUser._id,
         recipientType: 'psto'
      }).sort({ createdAt: -1 });
      
      console.log(`📱 Found ${notifications.length} notifications for PSTO user`);
      
      if (notifications.length > 0) {
         console.log('📋 Recent notifications:');
         notifications.forEach((notif, index) => {
            console.log(`${index + 1}. ${notif.title} - ${notif.type} (${notif.isRead ? 'Read' : 'Unread'})`);
         });
      }
      
      // Test the API endpoint logic
      const unreadCount = await Notification.countDocuments({
         recipientId: pstoUser._id,
         recipientType: 'psto',
         isRead: false
      });
      
      console.log(`📊 Unread count: ${unreadCount}`);
      
   } catch (error) {
      console.error('❌ Error testing PSTO API:', error);
   } finally {
      mongoose.connection.close();
   }
}

testPSTOAPI();





