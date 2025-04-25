const axios = require('axios');

// Test direct login to the API
async function testDirectLogin() {
  try {
    console.log('Testing direct login to API...');
    
    const response = await axios.post('http://localhost:9090/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful!');
    console.log('Response:', response.data);
    
    // Test getting user data with the token
    if (response.data.token) {
      console.log('\nTesting /api/auth/me endpoint with token...');
      
      const userResponse = await axios.get('http://localhost:9090/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${response.data.token}`
        }
      });
      
      console.log('User data retrieved successfully!');
      console.log('User data:', userResponse.data);
    }
    
  } catch (error) {
    console.error('Login failed!');
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

// Run the test
testDirectLogin();