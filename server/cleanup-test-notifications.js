const mongoose = require('mongoose');
const Notification = require('./src/models/Notification');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pmns', {
   useNewUrlParser: true,
   useUnifiedTopology: true
});

async function cleanupTestNotifications() {
   try {
      console.log('🧹 Cleaning up test notifications...');
      
      // Delete notifications that contain "Test Enterprise"
      const result = await Notification.deleteMany({
         message: { $regex: /Test Enterprise/i }
      });
      
      console.log(`✅ Deleted ${result.deletedCount} test notifications`);
      console.log('🎉 Test notifications cleaned up!');
      console.log('📱 Now you can submit real applications to see real notifications.');
      
   } catch (error) {
      console.error('❌ Error cleaning up test notifications:', error);
   } finally {
      mongoose.connection.close();
   }
}

cleanupTestNotifications();
