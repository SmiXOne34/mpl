const mongoose = require('mongoose');

// Fix deprecation warning
mongoose.set('strictQuery', true);

/**
 * Database connection utility for MealWise Family application
 * Establishes connection to MongoDB and handles connection events
 */
const connectDB = async () => {
  try {
    // Get MongoDB connection string from environment variables
    // Make sure we're connecting to the correct database
    let mongoURI = process.env.MONGO_URI || 'mongodb://mongo:27017/mealwise';
    
    // If MONGO_URI is set but doesn't specify a database, append the database name
    if (process.env.MONGO_URI && !process.env.MONGO_URI.includes('mealwise')) {
      // Check if the URI already has query parameters
      if (process.env.MONGO_URI.includes('?')) {
        // Insert the database name before the query parameters
        mongoURI = process.env.MONGO_URI.replace('?', '/mealwise?');
      } else {
        // Append the database name
        mongoURI = `${process.env.MONGO_URI}/mealwise`;
      }
      console.log('Modified MongoDB URI to include database name: mealwise');
    }
    
    console.log(`Connecting to MongoDB with URI: ${mongoURI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://****:****@')}`);
    
    // Connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: true, // Build indexes
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };
    
    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, options);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error(`Mongoose connection error: ${err}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB');
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Mongoose connection closed due to application termination');
      process.exit(0);
    });
    
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;