import axios from 'axios';

// Determine the base URL based on environment and window location
const getBaseUrl = () => {
  // Log the environment and window location for debugging
  console.log('Environment:', process.env.NODE_ENV);
  console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
  console.log('Window location:', window.location.origin);
  
  // In production, always use a relative URL to avoid CORS issues
  if (process.env.NODE_ENV === 'production') {
    console.log('Using production API URL: /api');
    return '/api';
  }
  
  // For development or if explicitly set
  if (process.env.REACT_APP_API_URL) {
    // Use environment variable if available
    console.log(`Using environment API URL: ${process.env.REACT_APP_API_URL}`);
    // Check if it already includes /api
    if (process.env.REACT_APP_API_URL.endsWith('/api')) {
      return process.env.REACT_APP_API_URL;
    }
    return `${process.env.REACT_APP_API_URL}/api`;
  }
  
  // Default development server
  console.log('Using default development API URL: http://localhost:9091/api');
  return 'http://localhost:9091/api';
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
  timeout: 60000, // 60 seconds timeout (increased from 30)
  withCredentials: true, // Include credentials for cross-origin requests
  maxRedirects: 5, // Allow up to 5 redirects
  maxContentLength: 50 * 1024 * 1024, // 50MB max content size
  validateStatus: status => status < 500 // Only reject if status is 5xx
});

// Add request interceptor for debugging and retry logic
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
    
    // Log request details
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    console.log('Request data:', typeof config.data === 'string' ? JSON.parse(config.data) : config.data);
    console.log('Request headers:', config.headers);
    
    // Check for auth token
    if (config.headers.Authorization) {
      console.log('Auth token present:', config.headers.Authorization.substring(0, 15) + '...');
    } else if (document.cookie.includes('token=')) {
      console.log('Token found in cookies');
    } else {
      console.warn('No authorization token found in headers or cookies!');
    }
    
    // Log additional request info
    console.log('Request details:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      timeout: config.timeout,
      withCredentials: config.withCredentials
    });
    
    console.log('Browser info:', {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      vendor: navigator.vendor
    });
    
    return config;
  },
  error => {
    console.error('Request setup error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging and retry logic
api.interceptors.response.use(
  response => {
    console.log(`Received response from ${response.config.url}:`, {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });
    
    // Check if the response has the expected structure
    if (response.data) {
      if (response.data.success === false) {
        console.warn('API returned success: false', response.data);
      }
      
      if (!response.data.success && !response.data.error) {
        console.warn('API response missing both success and error fields:', response.data);
      }
    }
    
    return response;
  },
  async error => {
    const originalRequest = error.config;
    
    // Log detailed error information
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Error response from ${originalRequest?.url}:`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Log more details about the error
      console.error('Detailed error response:', {
        url: originalRequest?.url,
        method: originalRequest?.method,
        requestData: originalRequest?.data ? 
          (typeof originalRequest.data === 'string' ? 
            JSON.parse(originalRequest.data) : originalRequest.data) : 'No data',
        responseData: error.response.data,
        message: error.message,
        stack: error.stack
      });
      
      // If we get a 401 Unauthorized error, we might want to redirect to login
      if (error.response.status === 401) {
        console.log('Authentication error detected. User may need to log in again.');
        // You could dispatch a logout action here or redirect to login
      }
      
    } else if (error.request) {
      // The request was made but no response was received
      console.error(`No response received for request to ${originalRequest?.url}:`, {
        request: error.request,
        method: originalRequest?.method,
        url: originalRequest?.url,
        data: originalRequest?.data,
        headers: originalRequest?.headers,
        retryCount: originalRequest?.retryCount || 0
      });
      
      // Implement retry logic for network errors
      if (originalRequest && originalRequest.retryCount < originalRequest.maxRetries) {
        originalRequest.retryCount += 1;
        console.log(`Retrying request (${originalRequest.retryCount}/${originalRequest.maxRetries})...`);
        
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, originalRequest.retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Try with a different approach on the last retry
        if (originalRequest.retryCount === originalRequest.maxRetries - 1) {
          console.log('Last retry attempt - using fetch API instead of axios');
          
          try {
            // Try with fetch as a last resort
            const fetchResponse = await fetch(`${originalRequest.baseURL || ''}${originalRequest.url}`, {
              method: originalRequest.method,
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: originalRequest.data ? JSON.stringify(JSON.parse(originalRequest.data)) : undefined,
              credentials: 'include'
            });
            
            console.log('Fetch response status:', fetchResponse.status);
            
            try {
              const data = await fetchResponse.json();
              console.log('Fetch response data:', data);
              
              return {
                status: fetchResponse.status,
                statusText: fetchResponse.statusText,
                headers: fetchResponse.headers,
                data,
                config: originalRequest,
                request: {}
              };
            } catch (jsonError) {
              console.error('Error parsing JSON from fetch response:', jsonError);
              const text = await fetchResponse.text();
              console.log('Raw response text:', text);
              throw jsonError;
            }
          } catch (fetchError) {
            console.error('Fetch fallback also failed:', fetchError);
          }
        }
        
        return api(originalRequest);
      }
      
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', {
        message: error.message,
        stack: error.stack,
        config: originalRequest
      });
    }
    
    // Add diagnostic information to the error
    error.diagnosticInfo = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      apiBaseUrl: api.defaults.baseURL,
      userAgent: navigator.userAgent,
      networkType: navigator.connection ? navigator.connection.effectiveType : 'unknown',
      cookies: document.cookie ? 'Present (not shown for security)' : 'No cookies'
    };
    
    return Promise.reject(error);
  }
);

export default api;