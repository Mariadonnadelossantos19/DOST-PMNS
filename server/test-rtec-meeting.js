const mongoose = require('mongoose');
const RTECDocuments = require('./src/models/RTECDocuments');
const RTECMeeting = require('./src/models/RTECMeeting');
const TNA = require('./src/models/TNA');
const SETUPApplication = require('./src/models/SETUPApplication');
const User = require('./src/models/User');

async function testRTECMeeting() {
   try {
      // Connect to database
      await mongoose.connect('mongodb://localhost:27017/pmns', {
         useNewUrlParser: true,
         useUnifiedTopology: true
      });
      
      console.log('=== TESTING RTEC MEETING ===');
      
      // Find an approved RTEC document
      const approvedDoc = await RTECDocuments.findOne({ status: 'documents_approved' })
         .populate('tnaId')
         .populate('applicationId')
         .populate('proponentId');
      
      if (!approvedDoc) {
         console.log('❌ No approved RTEC documents found');
         return;
      }
      
      console.log('✅ Found approved RTEC document:', approvedDoc._id);
      console.log('TNA ID:', approvedDoc.tnaId?._id || approvedDoc.tnaId);
      console.log('Status:', approvedDoc.status);
      
      // Test creating a meeting
      const meetingData = {
         tnaId: approvedDoc.tnaId?._id || approvedDoc.tnaId,
         meetingTitle: 'Test RTEC Meeting',
         meetingDescription: 'Test meeting description',
         scheduledDate: '2025-01-15',
         scheduledTime: '10:00',
         location: 'Test Location',
         meetingType: 'physical',
         notes: 'Test notes'
      };
      
      console.log('Meeting data:', meetingData);
      
      // Check if TNA exists
      const tna = await TNA.findById(meetingData.tnaId);
      console.log('TNA found:', !!tna);
      
      // Check if RTEC documents exist for this TNA
      const rtecDocs = await RTECDocuments.findOne({ tnaId: meetingData.tnaId });
      console.log('RTEC docs found:', !!rtecDocs);
      console.log('RTEC docs status:', rtecDocs?.status);
      
   } catch (error) {
      console.error('Error testing RTEC meeting:', error);
   } finally {
      await mongoose.disconnect();
   }
}

testRTECMeeting();
