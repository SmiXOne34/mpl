const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const http = require('http');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

// Load environment variables
dotenv.config({ path: './.env' });

// Import middleware
const errorHandler = require('./middleware/error');

// Import database connection
const connectDB = require('./database');

// Import socket.io setup
const setupSocket = require('./utils/socket');

// Import route files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const mealRoutes = require('./routes/meals');
const menuRoutes = require('./routes/menu');
const selectionRoutes = require('./routes/selections');
const notificationRoutes = require('./routes/notifications');
const settingsRoutes = require('./routes/settings');

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.io
const io = setupSocket(server);

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security middleware
// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Higher limit in development
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting only to API routes
app.use('/api', limiter);

// Prevent http param pollution
app.use(hpp());

// Sanitize data
app.use(mongoSanitize());

// Enable CORS with configuration for both development and production
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',                // Local development
      'http://localhost:9091',                // Local backend
      process.env.FRONTEND_URL,               // From env variable
      process.env.CLIENT_URL,                 // From env variable
      /\.dokploy\.com$/,                      // Dokploy domains
      /\.vercel\.app$/                        // Vercel domains
    ].filter(Boolean);
    
    // Check if the origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  credentials: true, // Include credentials for cross-origin requests
  preflightContinue: false,
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Add socket.io to request object with error handling
app.use((req, res, next) => {
  try {
    req.io = io;
    
    // Add a safe emit method that won't crash the server if socket operations fail
    req.safeEmit = (event, data) => {
      try {
        if (req.io) {
          req.io.emit(event, data);
          console.log(`Successfully emitted ${event} event`);
        } else {
          console.log(`Socket not available for ${event} event`);
        }
      } catch (error) {
        console.error(`Error emitting ${event} event:`, error);
        // Continue processing the request even if socket emit fails
      }
    };
    
    next();
  } catch (error) {
    console.error('Error attaching socket to request:', error);
    // Continue processing the request even if socket attachment fails
    next();
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/selections', selectionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', require('./routes/api/ai'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Error handler middleware
app.use(errorHandler);

// Set port
const PORT = process.env.PORT || 9091; // Changed from 9090 to avoid port conflict

// Start server only if not in test environment and not in Vercel serverless environment
let serverInstance;
if (process.env.NODE_ENV !== 'test' && process.env.VERCEL !== '1') {
  serverInstance = server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process if not in serverless environment
  if (serverInstance) {
    serverInstance.close(() => process.exit(1));
  } else {
    console.error('Unhandled rejection in serverless environment:', err);
  }
});

// Export the Express app for serverless environments
module.exports = app;