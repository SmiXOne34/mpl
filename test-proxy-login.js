const axios = require('axios');

// Test login through the proxy
async function testProxyLogin() {
  try {
    console.log('Testing login through proxy...');
    
    // Create an axios instance with baseURL set to the client's proxy URL
    const axiosInstance = axios.create({
      baseURL: 'http://localhost:3000',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const response = await axiosInstance.post('/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    console.log('Login successful!');
    console.log('Response:', response.data);
    
    // Test getting user data with the token
    if (response.data.token) {
      console.log('\nTesting /api/auth/me endpoint with token through proxy...');
      
      const userResponse = await axiosInstance.get('/api/auth/me', {
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
testProxyLogin();