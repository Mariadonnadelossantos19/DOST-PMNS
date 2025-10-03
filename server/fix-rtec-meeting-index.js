const mongoose = require('mongoose');
require('dotenv').config();

async function fixRTECMeetingIndex() {
   try {
      console.log('🔧 Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pmns');
      console.log('✅ Connected to MongoDB');

      const db = mongoose.connection.db;
      const collection = db.collection('rtec_meetings');

      console.log('🔍 Checking current indexes...');
      const indexes = await collection.indexes();
      console.log('Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));

      // Check if meetingId index exists
      const meetingIdIndex = indexes.find(idx => idx.name === 'meetingId_1');
      
      if (meetingIdIndex) {
         console.log('❌ Found problematic meetingId_1 index');
         console.log('🔧 Dropping meetingId_1 index...');
         await collection.dropIndex('meetingId_1');
         console.log('✅ Successfully dropped meetingId_1 index');
      } else {
         console.log('✅ No meetingId_1 index found');
      }

      // Check for any other meetingId related indexes
      const meetingIdIndexes = indexes.filter(idx => 
         idx.name.includes('meetingId') || 
         Object.keys(idx.key).includes('meetingId')
      );

      if (meetingIdIndexes.length > 0) {
         console.log('🔍 Found other meetingId related indexes:', meetingIdIndexes);
         for (const index of meetingIdIndexes) {
            console.log(`🔧 Dropping index: ${index.name}`);
            await collection.dropIndex(index.name);
         }
      }

      console.log('🔍 Final indexes after cleanup...');
      const finalIndexes = await collection.indexes();
      console.log('Final indexes:', finalIndexes.map(idx => ({ name: idx.name, key: idx.key })));

      console.log('✅ Database index cleanup completed successfully');
      
   } catch (error) {
      console.error('💥 Error fixing RTEC meeting index:', error);
   } finally {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
   }
}

fixRTECMeetingIndex();
