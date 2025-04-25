import { io } from 'socket.io-client';

/**
 * Socket.io client for MealWise Family application
 * Handles real-time communication with the server
 */
let socket;
let token;
let reconnectTimer;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 2000;

/**
 * Initialize socket connection
 * @param {string} authToken - JWT token for authentication
 * @returns {Object} Socket.io client instance
 */
export const initSocket = (authToken) => {
  if (!authToken) {
    console.error('No token provided for socket connection');
    return null;
  }

  // Store token for reconnection
  token = authToken;

  // Close existing connection if any
  if (socket) {
    socket.close();
  }

  // Reset reconnect attempts
  reconnectAttempts = 0;
  
  // Clear any existing reconnect timers
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  // Create new connection
  // Use explicit URL instead of relying solely on proxy
  const socketUrl = process.env.NODE_ENV === 'production' 
    ? '/' 
    : 'http://localhost:9091';
  
  console.log(`Connecting to socket at: ${socketUrl}`);
  
  socket = io(socketUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: RECONNECT_DELAY,
    timeout: 20000, // 20 seconds timeout
    withCredentials: true
  });

  // Connection events
  socket.on('connect', () => {
    console.log('Socket connected');
    // Reset reconnect attempts on successful connection
    reconnectAttempts = 0;
    
    // Clear any existing reconnect timers
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    attemptReconnect();
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    
    // If the disconnection was initiated by the server, try to reconnect
    if (reason === 'io server disconnect' || reason === 'transport close') {
      attemptReconnect();
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
    attemptReconnect();
  });

  return socket;
};

/**
 * Attempt to reconnect to the socket server
 */
const attemptReconnect = () => {
  // Clear any existing reconnect timers
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }
  
  // If we've exceeded the maximum number of attempts, stop trying
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error(`Failed to reconnect after ${MAX_RECONNECT_ATTEMPTS} attempts`);
    return;
  }
  
  reconnectAttempts++;
  
  // Set a timer to attempt reconnection
  reconnectTimer = setTimeout(() => {
    console.log(`Attempting to reconnect (attempt ${reconnectAttempts} of ${MAX_RECONNECT_ATTEMPTS})...`);
    
    // If we have a token, try to initialize the socket again
    if (token) {
      initSocket(token);
    }
  }, RECONNECT_DELAY * reconnectAttempts); // Increase delay with each attempt
};

/**
 * Get socket instance
 * @returns {Object} Socket.io client instance
 */
export const getSocket = () => socket;

/**
 * Close socket connection
 */
export const closeSocket = () => {
  // Clear any existing reconnect timers
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  
  if (socket) {
    socket.close();
    socket = null;
  }
  
  // Clear the stored token
  token = null;
  reconnectAttempts = 0;
};