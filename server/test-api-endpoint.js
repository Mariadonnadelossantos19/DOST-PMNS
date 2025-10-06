const http = require('http');

// Test the PSTO notifications API endpoint
const testAPI = () => {
   const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/notifications/psto/68c775413fa39fcdc2cc47bd',
      method: 'GET',
      headers: {
         'Content-Type': 'application/json'
      }
   };

   const req = http.request(options, (res) => {
      console.log(`📡 API Response Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
         data += chunk;
      });
      
      res.on('end', () => {
         try {
            const response = JSON.parse(data);
            console.log('📋 API Response:', JSON.stringify(response, null, 2));
            
            if (response.success && response.notifications) {
               console.log(`✅ Found ${response.notifications.length} notifications`);
               console.log(`📊 Unread count: ${response.unreadCount}`);
            } else {
               console.log('❌ API response indicates failure or no notifications');
            }
         } catch (error) {
            console.error('❌ Error parsing API response:', error);
            console.log('Raw response:', data);
         }
      });
   });

   req.on('error', (error) => {
      console.error('❌ API request error:', error);
   });

   req.end();
};

console.log('🧪 Testing PSTO notifications API endpoint...');
testAPI();

