import axios from 'axios';

// Determine the base URL based on environment
const getBaseUrl = () => {
  // Log the environment for debugging
  console.log('Environment:', process.env.NODE_ENV);
  console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
  
  if (process.env.NODE_ENV === 'production') {
    // In production, always use a relative URL to avoid CORS issues
    console.log('Using production API URL: /api');
    return '/api';
  } else if (process.env.REACT_APP_API_URL) {
    // Use environment variable if available
    console.log(`Using environment API URL: ${process.env.REACT_APP_API_URL}`);
    // Check if it already includes /api
    if (process.env.REACT_APP_API_URL.endsWith('/api')) {
      return process.env.REACT_APP_API_URL;
    }
    return `${process.env.REACT_APP_API_URL}/api`;
  } else {
    // Default development server
    console.log('Using default development API URL: http://localhost:9091/api');
    return 'http://localhost:9091/api';
  }
};

// Create an axios instance with default config
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000, // 30 seconds timeout
  withCredentials: true // Include credentials for cross-origin requests
});

// Add request interceptor for debugging
api.interceptors.request.use(
  config => {
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    console.log('Request data:', config.data);
    console.log('Request headers:', config.headers);
    return config;
  },
  error => {
    console.error('Request setup error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log(`Received response from ${response.config.url}:`, {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Error response from ${error.config?.url}:`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error(`No response received for request to ${error.config?.url}:`, {
        request: error.request,
        method: error.config?.method,
        url: error.config?.url
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', {
        message: error.message,
        config: error.config
      });
    }
    return Promise.reject(error);
  }
);

export default api;