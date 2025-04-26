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
  // In production, allow all origins to prevent CORS issues
  origin: process.env.NODE_ENV === 'production' 
    ? true  // Allow all origins in production
    : ['http://localhost:3000', 'http://localhost:9091'], // Restrict in development
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

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Set up request logging with timestamps
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${req.method} ${req.url} (Origin: ${req.headers.origin || 'unknown'})`;
  console.log(logMessage);
  
  // Log to file in production
  if (process.env.NODE_ENV === 'production') {
    fs.appendFile(
      path.join(logsDir, 'requests.log'),
      logMessage + '\n',
      err => {
        if (err) console.error('Error writing to log file:', err);
      }
    );
  }
  
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

// Diagnostic endpoint
app.get('/api/diagnostic', (req, res) => {
  // Collect system information
  const os = require('os');
  const diagnosticInfo = {
    server: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: {
        total: `${Math.round(os.totalmem() / (1024 * 1024))} MB`,
        free: `${Math.round(os.freemem() / (1024 * 1024))} MB`,
        usage: `${Math.round((process.memoryUsage().rss / os.totalmem()) * 100)}%`
      }
    },
    request: {
      headers: req.headers,
      ip: req.ip,
      originalUrl: req.originalUrl,
      protocol: req.protocol,
      secure: req.secure
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      FRONTEND_URL: process.env.FRONTEND_URL,
      CLIENT_URL: process.env.CLIENT_URL
    }
  };
  
  res.status(200).json(diagnosticInfo);
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
  console.log('Running in production mode - serving static files from client/build');
  
  // Set static folder with proper caching
  app.use(express.static('client/build', {
    maxAge: '1d', // Cache static assets for 1 day
    setHeaders: (res, path) => {
      // Don't cache HTML files
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  }));

  // All other routes should serve the index.html
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    console.log(`Serving index.html for path: ${req.path}`);
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
} else {
  console.log('Running in development mode - not serving static files');
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