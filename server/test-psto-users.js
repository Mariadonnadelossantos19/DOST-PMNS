const mongoose = require('mongoose');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pmns', {
   useNewUrlParser: true,
   useUnifiedTopology: true
});

async function testPSTOUsers() {
   try {
      console.log('=== TESTING PSTO USERS ===');
      
      // Check all users
      const allUsers = await User.find({}).select('firstName lastName email role status');
      console.log('Total users:', allUsers.length);
      console.log('All users:', allUsers);
      
      // Check PSTO users specifically
      const pstoUsers = await User.find({ 
         role: 'psto',
         status: 'active'
      }).select('firstName lastName email department province');
      
      console.log('\n=== PSTO USERS ===');
      console.log('Found PSTO users:', pstoUsers.length);
      console.log('PSTO users:', pstoUsers);
      
      // Check users by role
      const usersByRole = await User.aggregate([
         { $group: { _id: '$role', count: { $sum: 1 } } }
      ]);
      console.log('\n=== USERS BY ROLE ===');
      console.log(usersByRole);
      
      // Check users by status
      const usersByStatus = await User.aggregate([
         { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      console.log('\n=== USERS BY STATUS ===');
      console.log(usersByStatus);
      
   } catch (error) {
      console.error('Error:', error);
   } finally {
      mongoose.connection.close();
   }
}

testPSTOUsers();
