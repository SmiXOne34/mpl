const axios = require('axios');

// Configuration
const SERVER_URL = 'http://localhost:9090';
const LOGIN_ENDPOINT = `${SERVER_URL}/api/auth/login`;
const TEST_EMAIL = 'admin@example.com';
const TEST_PASSWORD = 'admin123';

// Test server connection
async function testServerConnection() {
  console.log('Testing server connection...');
  try {
    const response = await axios.get(SERVER_URL, {
      timeout: 5000 // 5 second timeout
    });
    console.log('✅ Server is running!');
    console.log(`Status: ${response.status} ${response.statusText}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to server!');
    if (error.code === 'ECONNREFUSED') {
      console.error('The server is not running or not listening on the specified port.');
      console.error(`Attempted to connect to: ${SERVER_URL}`);
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Connection timed out. The server might be running but is not responding.');
    } else {
      console.error(`Error: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status} ${error.response.statusText}`);
      }
    }
    return false;
  }
}

// Test login endpoint
async function testLoginEndpoint() {
  console.log('\nTesting login endpoint...');
  try {
    // First try an OPTIONS request to check CORS
    const optionsResponse = await axios({
      method: 'OPTIONS',
      url: LOGIN_ENDPOINT,
      timeout: 5000
    });
    
    console.log('✅ Login endpoint is accessible!');
    console.log(`Status: ${optionsResponse.status} ${optionsResponse.statusText}`);
    
    // Check CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': optionsResponse.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': optionsResponse.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': optionsResponse.headers['access-control-allow-headers'],
      'Access-Control-Allow-Credentials': optionsResponse.headers['access-control-allow-credentials']
    };
    
    console.log('CORS Headers:');
    console.log(corsHeaders);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to access login endpoint!');
    if (error.code === 'ECONNREFUSED') {
      console.error('The server is not running or not listening on the specified port.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Connection timed out. The endpoint might be unavailable.');
    } else {
      console.error(`Error: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status} ${error.response.statusText}`);
      }
    }
    return false;
  }
}

// Test login with credentials
async function testLogin() {
  console.log('\nTesting login with credentials...');
  try {
    const response = await axios.post(LOGIN_ENDPOINT, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    console.log('✅ Login successful!');
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Response data:');
    console.log(response.data);
    
    return true;
  } catch (error) {
    console.error('❌ Login failed!');
    if (error.code === 'ECONNREFUSED') {
      console.error('The server is not running or not listening on the specified port.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Connection timed out. The server might be busy or unresponsive.');
    } else {
      console.error(`Error: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status} ${error.response.statusText}`);
        console.error('Response data:');
        console.error(error.response.data);
      }
    }
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('=== SERVER CONNECTION TEST ===');
  const serverRunning = await testServerConnection();
  
  if (serverRunning) {
    await testLoginEndpoint();
    await testLogin();
  } else {
    console.log('\n⚠️ Skipping login tests because server connection failed.');
    console.log('Please make sure the server is running with:');
    console.log('cd /Users/mac/test/MPL2 && npm run server');
  }
  
  console.log('\n=== TEST SUMMARY ===');
  if (serverRunning) {
    console.log('Server is running and accessible.');
    console.log('If you\'re still experiencing "Failed to fetch" errors in the browser:');
    console.log('1. Check for CORS issues in the server configuration');
    console.log('2. Verify that the client proxy is correctly set up');
    console.log('3. Check browser console for more detailed error messages');
  } else {
    console.log('Server connection failed. Please start the server before testing login.');
  }
}

// Run the tests
runTests();