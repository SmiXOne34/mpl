const axios = require('axios');

// Test login through the client proxy
async function testLoginProxy() {
  try {
    console.log('Testing login through client proxy...');
    
    // This should use the proxy defined in client/package.json
    const response = await axios.post('http://localhost:3000/api/auth/login', {
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
testLoginProxy();