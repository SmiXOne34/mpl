# MealWise Family Testing Documentation

This document outlines the testing strategy and procedures for the MealWise Family application.

## Testing Strategy

The MealWise Family application employs a comprehensive testing approach that includes:

1. **Unit Testing**: Testing individual components and functions in isolation
2. **Integration Testing**: Testing interactions between components
3. **End-to-End Testing**: Testing complete user flows
4. **Performance Testing**: Ensuring the application performs well under load

## Test Environment Setup

### Prerequisites

- Node.js (v14.0.0 or higher)
- MongoDB (v4.4 or higher)
- Jest testing framework
- Supertest for API testing

### Configuration

The test environment uses:

- In-memory MongoDB server for database tests
- Mocked authentication for protected routes
- Isolated test database to prevent affecting development data

## Running Tests

### All Tests

To run all tests:

```bash
npm test
```

### Unit Tests Only

To run only unit tests:

```bash
npm run test:unit
```

### Integration Tests Only

To run only integration tests:

```bash
npm run test:integration
```

### Test Coverage

To generate a test coverage report:

```bash
npm run test:coverage
```

The coverage report will be available in the `coverage` directory.

## Test Structure

### Unit Tests

Unit tests are located in the `__tests__/unit` directory and are organized by module:

- `__tests__/unit/auth.test.js` - Authentication functions
- `__tests__/unit/error.middleware.test.js` - Error handling middleware
- `__tests__/unit/timeRestriction.util.test.js` - Time restriction utilities
- `__tests__/unit/timeRestriction.middleware.test.js` - Time restriction middleware

### Integration Tests

Integration tests are located in the `__tests__/integration` directory:

- `__tests__/integration/auth.routes.test.js` - Authentication API endpoints
- `__tests__/integration/meal.routes.test.js` - Meal API endpoints
- `__tests__/integration/menu.routes.test.js` - Menu API endpoints
- `__tests__/integration/selection.routes.test.js` - Selection API endpoints
- `__tests__/integration/user.routes.test.js` - User API endpoints

### Test Helpers

Common test utilities and setup files:

- `__tests__/setup.js` - Global test setup and teardown
- `__tests__/fixtures` - Test data and fixtures
- `__tests__/mocks` - Mock implementations for testing

## Test Cases

### Authentication Tests

- User registration with valid data
- User registration with invalid data
- User login with correct credentials
- User login with incorrect credentials
- Password reset functionality
- JWT token validation
- Protected route access

### User Management Tests

- Get all users (admin only)
- Get single user by ID
- Create new user (admin only)
- Update user information
- Delete user (admin only)
- Update user role (admin only)

### Meal Management Tests

- Get all meals
- Get single meal by ID
- Create new meal (admin only)
- Update meal information (admin only)
- Delete meal (admin only)
- Filter meals by tags
- Search meals by name or description

### Menu Tests

- Get current week's menu
- Get menu for specific week
- Create new menu (admin only)
- Update existing menu (admin only)
- Delete menu (admin only)

### Selection Tests

- Get user's selections
- Get family selections
- Create new selection during voting window
- Attempt to create selection outside voting window
- Delete selection
- Get popular meal for a day
- Get selection history

### Time Restriction Tests

- Verify voting window open/closed status
- Test time-based access restrictions
- Test admin bypass of time restrictions
- Test voting status information

## Mocking

The tests use various mocking strategies:

- **Authentication**: Mock JWT tokens and user sessions
- **Database**: In-memory MongoDB server
- **Time**: Mock Date object for time-dependent tests
- **External Services**: Mock API responses

## Continuous Integration

Tests are automatically run in the CI/CD pipeline:

1. On every pull request to the main branch
2. Before deployment to staging or production
3. Nightly for regression testing

## Performance Testing

Performance tests focus on:

- API response times under load
- Database query performance
- Socket.IO real-time updates with multiple clients
- Memory usage and potential leaks

## Security Testing

Security tests include:

- Authentication and authorization checks
- Input validation and sanitization
- Protection against common web vulnerabilities
- Rate limiting effectiveness

## Troubleshooting Common Test Issues

### Tests Failing Due to MongoDB Connection

If tests fail with MongoDB connection errors:

1. Ensure MongoDB is running locally
2. Check that the test setup is correctly configuring the in-memory MongoDB server
3. Verify that tests properly clean up database connections

### Time-Dependent Test Failures

For tests that depend on specific times:

1. Use mock time functions instead of real time
2. Ensure tests reset mocked time after completion
3. Avoid hardcoding specific times in tests

### Authentication Test Failures

If authentication tests are failing:

1. Verify JWT secret is properly set in test environment
2. Check that mock users have the correct roles and permissions
3. Ensure token expiration is handled correctly in tests

## Best Practices

1. **Isolation**: Each test should be independent and not rely on the state from other tests
2. **Cleanup**: Always clean up resources after tests (database records, file uploads, etc.)
3. **Mocking**: Use mocks for external dependencies to ensure tests are fast and reliable
4. **Coverage**: Aim for high test coverage, especially for critical business logic
5. **Readability**: Write clear test descriptions that explain what is being tested