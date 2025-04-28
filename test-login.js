const axios = require('axios');

// Function to test login with a non-existent user
async function testLoginWithNonExistentUser() {
  try {
    console.log('Testing login with non-existent user...');
    
    const response = await axios.post('http://localhost:9092/api/auth/login', {
      email: 'user@example.com', // This user doesn't exist
      password: 'password123'
    });
    
    console.log('Response:', response.data);
    console.log('Status:', response.status);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.log('Error status:', error.response?.status);
    console.log('Error message:', error.response?.data);
    
    return {
      success: false,
      status: error.response?.status,
      error: error.response?.data
    };
  }
}

// Run the test
testLoginWithNonExistentUser()
  .then(result => {
    console.log('\nTest result:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });