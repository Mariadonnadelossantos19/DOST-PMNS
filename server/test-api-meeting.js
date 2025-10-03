const axios = require('axios');

async function testCreateMeeting() {
   try {
      console.log('=== TESTING CREATE MEETING API ===');
      
      // First, let's login to get a token
      const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
         email: 'admin@dost.gov.ph',
         password: 'admin123'
      });
      
      const token = loginResponse.data.token;
      console.log('✅ Login successful, token:', token.substring(0, 20) + '...');
      
      // Test creating a meeting
      const meetingData = {
         tnaId: '68ddd9c5c74f814c68656553',
         meetingTitle: 'Test RTEC Meeting',
         meetingDescription: 'Test meeting description',
         scheduledDate: '2025-01-15',
         scheduledTime: '10:00',
         location: 'Test Location',
         meetingType: 'physical',
         notes: 'Test notes'
      };
      
      console.log('Meeting data:', meetingData);
      
      const response = await axios.post('http://localhost:4000/api/rtec-meetings/create', meetingData, {
         headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
         }
      });
      
      console.log('✅ Meeting created successfully:', response.data);
      
   } catch (error) {
      console.error('❌ Error creating meeting:', error.response?.data || error.message);
      console.error('Status:', error.response?.status);
   }
}

testCreateMeeting();
