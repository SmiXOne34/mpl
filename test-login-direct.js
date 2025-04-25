const axios = require('axios');

// Test login directly to the server
async function testLoginDirect() {
  try {
    console.log('Testing direct login to server...');
    
    const response = await axios.post('http://localhost:9090/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error('Login failed!');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
    
    return false;
  }
}

// Run the test
testLoginDirect();