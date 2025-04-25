const http = require('http');

// Configuration
const SERVER_URL = 'localhost';
const PORT = 9090;
const LOGIN_PATH = '/api/auth/login';

// Test server connection
function testServerConnection() {
  console.log('Testing server connection...');
  
  const options = {
    hostname: SERVER_URL,
    port: PORT,
    path: '/',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    console.log(`Server Status: ${res.statusCode} ${res.statusMessage}`);
    console.log('Server is running!');
    
    // Now test the login endpoint
    testLoginEndpoint();
  });
  
  req.on('error', (error) => {
    console.error('Server Connection Error:', error.message);
    console.log('The server is not running or not accessible.');
    console.log('Try starting the server with: npm run server');
  });
  
  req.end();
}

// Test login endpoint
function testLoginEndpoint() {
  console.log('\nTesting login endpoint...');
  
  const options = {
    hostname: SERVER_URL,
    port: PORT,
    path: LOGIN_PATH,
    method: 'OPTIONS',
    headers: {
      'Accept': 'application/json'
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`Login Endpoint Status: ${res.statusCode} ${res.statusMessage}`);
    
    if (res.statusCode === 200 || res.statusCode === 204) {
      console.log('Login endpoint is accessible!');
      console.log('\nTry logging in with:');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
    } else {
      console.log('Login endpoint returned an unexpected status code.');
    }
  });
  
  req.on('error', (error) => {
    console.error('Login Endpoint Error:', error.message);
    console.log('The login endpoint is not accessible.');
  });
  
  req.end();
}

// Start the test
console.log('=== SERVER STATUS TEST ===');
testServerConnection();