# MealWise Family Login Flow Analysis

## Direct API Login vs. Proxy Login

### Direct API Login
- **Endpoint**: `http://localhost:9090/api/auth/login`
- **Method**: POST
- **Headers**: Content-Type: application/json
- **Body**: JSON with email and password
- **Response**: JWT token and success status
- **Authentication Storage**: 
  - Token stored in localStorage
  - Token set as HTTP-only cookie
- **Subsequent Requests**: 
  - Include token in Authorization header as `Bearer ${token}`
  - Cookies automatically included in requests to same domain

### Proxy Login (React Client)
- **Endpoint**: `/api/auth/login` (relative path)
- **Method**: POST
- **Proxy Configuration**: "proxy": "http://localhost:9090" in client/package.json
- **Headers**: Content-Type: application/json
- **Body**: JSON with email and password
- **Response**: JWT token and success status
- **Authentication Storage**:
  - Token stored in Redux state
  - Token stored in localStorage
  - Token set as HTTP-only cookie by the server
- **Subsequent Requests**:
  - Token set in axios default headers by setAuthToken utility
  - Cookies automatically included in requests to same domain

## Authentication Flow

1. **User submits login credentials**
   - Email and password sent to server

2. **Server validates credentials**
   - Checks if email exists in database
   - Verifies password hash

3. **Server generates JWT token**
   - Token contains user ID and role
   - Token is signed with JWT_SECRET

4. **Server sends response**
   - Token returned in JSON response
   - Token set as HTTP-only cookie

5. **Client stores authentication**
   - Token stored in localStorage
   - In React app, also stored in Redux state

6. **Client includes token in subsequent requests**
   - Token added to Authorization header
   - Cookies automatically included

## Security Considerations

1. **HTTP-only Cookies**
   - Provides protection against XSS attacks
   - Cannot be accessed by JavaScript

2. **JWT Token in localStorage**
   - Vulnerable to XSS attacks
   - But convenient for client-side authentication

3. **Proxy Benefits**
   - Avoids CORS issues in development
   - Simplifies API URLs in client code
   - Provides a layer of abstraction

4. **Security Headers**
   - Helmet middleware adds security headers
   - XSS protection enabled

5. **Rate Limiting**
   - Prevents brute force attacks
   - Limits to 100 requests per 10 minutes

## Testing Login

### Direct API Testing
Use test-login.html to test direct API login:
- Open the file in a browser
- Default credentials: email: test123@example.com, password: password123
- Click Login to test the authentication flow
- Results displayed in the page

### React Client Testing
Use the React application to test proxy login:
- Start the client with `npm run client`
- Navigate to the login page
- Use admin credentials: admin@example.com / admin123
- Or user credentials: john@example.com / password123

## Troubleshooting

1. **CORS Issues**
   - Check CORS configuration in server.js
   - Ensure proper origin settings

2. **Proxy Not Working**
   - Verify proxy setting in client/package.json
   - Check that relative URLs are used in API calls

3. **Authentication Failures**
   - Check JWT_SECRET in .env file
   - Verify token expiration settings
   - Check for proper token format in requests