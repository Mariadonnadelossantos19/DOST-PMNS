const axios = require('axios');

async function testPSTOAPI() {
   try {
      console.log('=== TESTING PSTO API ENDPOINT ===');
      
      // First, let's login to get a token
      const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
         email: 'john.doe@marinduque.dost.gov.ph',
         password: 'password123'
      });
      
      console.log('Login successful');
      const token = loginResponse.data.token;
      
      // Now test the PSTO users endpoint
      const pstoResponse = await axios.get('http://localhost:4000/api/rtec-meetings/available-psto-users', {
         headers: {
            'Authorization': `Bearer ${token}`
         }
      });
      
      console.log('PSTO API Response:', pstoResponse.data);
      
   } catch (error) {
      console.error('Error testing PSTO API:', error.response?.data || error.message);
   }
}

testPSTOAPI();
