import axios from 'axios';

// Determine the base URL based on environment and window location
const getBaseUrl = () => {
  // In production, always use a relative URL to avoid CORS issues
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  
  // For development or if explicitly set
  if (process.env.REACT_APP_API_URL) {
    // Use environment variable if available
    // Check if it already includes /api
    if (process.env.REACT_APP_API_URL.endsWith('/api')) {
      return process.env.REACT_APP_API_URL;
    }
    return `${process.env.REACT_APP_API_URL}/api`;
  }
  
  // In development, always use port 9092
  const defaultPort = 9092;
  return `http://localhost:${defaultPort}/api`;
};

// Create an axios instance with default config
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  timeout: 120000, // 120 seconds timeout for large uploads
  withCredentials: true, // Include credentials for cross-origin requests
  maxRedirects: 5, // Allow up to 5 redirects
  maxContentLength: 50 * 1024 * 1024, // 50MB max content size
  maxBodyLength: 50 * 1024 * 1024, // 50MB max body size for uploads
  validateStatus: status => status < 500, // Only reject if status is 5xx
  decompress: true // Enable automatic decompression
});

// Add request interceptor for caching prevention and retry logic
api.interceptors.request.use(
  config => {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    
    // Add timestamp to URL for GET requests
    if (config.method.toLowerCase() === 'get') {
      config.params = { ...config.params, _t: timestamp };
    }
    
    // Add retry count if not present
    if (config.retryCount === undefined) {
      config.retryCount = 0;
      config.maxRetries = 3; // Maximum number of retries
    }
    
    // Special handling for image uploads
    if (config.url === '/auth/uploadimage' && config.data && config.data.imageUrl) {
      // For image uploads, increase timeout
      config.timeout = 180000; // 3 minutes for image uploads
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
        console.log('Image upload request - data length:', 
          config.data.imageUrl ? config.data.imageUrl.length : 'unknown');
      }
    }
    
    return config;
  },
  error => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Request setup error:', error);
    }
    return Promise.reject(error);
  }
);

// Add response interceptor for retry logic
api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;
    
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      if (error.response) {
        console.error(`Error response from ${originalRequest?.url}:`, {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      } else if (error.request) {
        console.error(`No response received for request to ${originalRequest?.url}`);
      } else {
        console.error('Error setting up request:', error.message);
      }
    }
    
    // Simple retry logic for network errors
    if (originalRequest && originalRequest.retryCount < originalRequest.maxRetries) {
      originalRequest.retryCount += 1;
      
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, originalRequest.retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return api(originalRequest);
    }
    
    return Promise.reject(error);
  }
);

export default api;