const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function testMongoDBConnection() {
  try {
    console.log('Testing MongoDB connection...');
    
    // Get MongoDB connection string from environment variables
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mealwise';
    
    console.log('MongoDB URI:', mongoURI);
    
    // Connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };
    
    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, options);
    
    console.log('MongoDB Connected Successfully!');
    console.log('Host:', conn.connection.host);
    console.log('Database Name:', conn.connection.name);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB Connection Closed');
    
    return true;
  } catch (error) {
    console.error('MongoDB Connection Failed!');
    console.error('Error:', error.message);
    return false;
  }
}

// Run the test
testMongoDBConnection();