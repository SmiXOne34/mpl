const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getTimeRemaining } = require('./timeRestriction');

// Store the io instance for access from other modules
let ioInstance = null;

/**
 * Socket.io setup for MealWise Family application
 * Handles real-time communication
 * 
 * @param {Object} server - HTTP server instance
 * @returns {Object} Socket.io instance
 */
const setupSocket = (server) => {
  const io = socketio(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? (process.env.CLIENT_URL || 'http://localhost:3000')
        : true, // Allow all origins in development
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  // Store the instance for access from other modules
  ioInstance = io;

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      // Get token from handshake auth
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mealwise_secret_key');

      // Get user
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user to socket
      socket.user = {
        id: user._id,
        name: user.name,
        role: user.role
      };

      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection event
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user.id})`);

    // Join rooms based on user role and ID
    socket.join('family');
    socket.join(`user_${socket.user.id}`); // User-specific room for notifications
    
    if (socket.user.role === 'admin') {
      socket.join('admin');
    }

    // Send initial voting status
    socket.emit('voting:status', getTimeRemaining());

    // Handle join event (for rejoining after reconnect)
    socket.on('join', (data) => {
      if (data.userId && data.userId === socket.user.id.toString()) {
        socket.join(`user_${data.userId}`);
        console.log(`User ${socket.user.name} joined room: user_${data.userId}`);
      }
    });

    // Handle leave event
    socket.on('leave', (data) => {
      if (data.userId && data.userId === socket.user.id.toString()) {
        socket.leave(`user_${data.userId}`);
        console.log(`User ${socket.user.name} left room: user_${data.userId}`);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.user.id})`);
    });
  });

  // Set up interval to broadcast voting status updates
  setInterval(() => {
    const status = getTimeRemaining();
    io.to('family').emit('voting:status', status);
  }, 60000); // Every minute

  return io;
};

/**
 * Get the socket.io instance
 * @returns {Object} Socket.io instance
 */
const getSocket = () => ioInstance;

module.exports = setupSocket;
module.exports.getSocket = getSocket;