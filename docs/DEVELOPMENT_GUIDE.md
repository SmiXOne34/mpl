# MealWise Family Development Guide

This guide provides information for developers who want to contribute to or extend the MealWise Family application.

## Development Environment Setup

### Prerequisites

- Node.js (v14.0.0 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- Git

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mealwise-family.git
   cd mealwise-family
   ```

2. Install dependencies:
   ```bash
   npm install
   cd client
   npm install
   cd ..
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/mealwise
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   This will start both the backend server and the React frontend in development mode with hot reloading.

## Project Structure

```
mealwise-family/
├── client/                 # React frontend
│   ├── public/             # Static files
│   └── src/                # Source files
│       ├── actions/        # Redux actions
│       ├── components/     # React components
│       ├── reducers/       # Redux reducers
│       ├── utils/          # Utility functions
│       └── App.js          # Main application component
│
├── controllers/            # API controllers
├── middleware/             # Express middleware
├── models/                 # Mongoose models
├── routes/                 # API routes
├── utils/                  # Utility functions
├── docs/                   # Documentation
├── __tests__/              # Test files
├── server.js               # Express server
└── package.json            # Dependencies
```

## Backend Architecture

### Server Setup

The main server file (`server.js`) initializes the Express application, connects to MongoDB, sets up middleware, and defines routes.

### API Structure

The API follows a RESTful design pattern:

- **Routes**: Define API endpoints and HTTP methods (`routes/`)
- **Controllers**: Handle request processing and response generation (`controllers/`)
- **Models**: Define data schemas and database interactions (`models/`)
- **Middleware**: Handle cross-cutting concerns like authentication (`middleware/`)

### Authentication

The application uses JWT (JSON Web Token) for authentication:

- Tokens are issued upon successful login
- Protected routes use the `auth` middleware to verify tokens
- Role-based access control is implemented through the `authorize` middleware

### Database

MongoDB is used as the database with Mongoose as the ODM (Object Document Mapper):

- Each entity has a corresponding Mongoose schema and model
- Models include validation rules and middleware hooks
- Indexes are defined for frequently queried fields

## Frontend Architecture

### React Application

The frontend is built with React and follows a component-based architecture:

- **Components**: Reusable UI elements
- **Pages**: Top-level components that correspond to routes
- **Layouts**: Structural components that define the page layout

### State Management

Redux is used for state management:

- **Actions**: Define state changes (`client/src/actions/`)
- **Reducers**: Implement state transitions (`client/src/reducers/`)
- **Store**: Centralized state container

### Routing

React Router is used for client-side routing:

- Routes are defined in `client/src/App.js`
- Protected routes require authentication
- Role-based route protection is implemented

### API Integration

The frontend communicates with the backend API using Axios:

- API calls are centralized in service files
- Authentication tokens are included in request headers
- Response handling includes error management

## Real-time Features

Socket.IO is used for real-time communication:

- The server emits events when data changes
- Clients subscribe to relevant events
- Real-time updates include new selections, menu changes, and notifications

## Development Workflow

### Branching Strategy

We follow a Git Flow-inspired branching strategy:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features or enhancements
- `bugfix/*`: Bug fixes
- `release/*`: Release preparation

### Pull Request Process

1. Create a feature or bugfix branch from `develop`
2. Implement your changes with appropriate tests
3. Submit a pull request to the `develop` branch
4. Ensure CI tests pass
5. Request code review from team members
6. Address review feedback
7. Merge to `develop` once approved

### Code Style

We follow the Airbnb JavaScript Style Guide with some modifications:

- ESLint is configured to enforce style rules
- Prettier is used for code formatting
- Run `npm run lint` to check for style issues
- Run `npm run format` to automatically fix formatting issues

## Testing

### Test Types

The application includes several types of tests:

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and component interactions
- **End-to-End Tests**: Test complete user flows

### Running Tests

- Run all tests: `npm test`
- Run unit tests: `npm run test:unit`
- Run integration tests: `npm run test:integration`
- Generate coverage report: `npm run test:coverage`

### Writing Tests

- Place tests in the `__tests__` directory
- Follow the naming convention: `*.test.js`
- Use Jest for test assertions
- Use Supertest for API testing
- Use React Testing Library for component testing

## Adding New Features

### Backend Features

1. Define the data model in `models/`
2. Create controller functions in `controllers/`
3. Define API routes in `routes/`
4. Add authentication and authorization as needed
5. Write tests for the new functionality

### Frontend Features

1. Create new components in `client/src/components/`
2. Define Redux actions and reducers if needed
3. Update routes in `client/src/App.js`
4. Connect to the backend API
5. Write tests for the new components

## Common Development Tasks

### Adding a New API Endpoint

1. Create a controller function in the appropriate controller file
2. Add the route in the corresponding route file
3. Apply necessary middleware (auth, validation, etc.)
4. Implement error handling
5. Write tests for the new endpoint

### Creating a New React Component

1. Create a new component file in `client/src/components/`
2. Define the component with appropriate props and state
3. Add styling using CSS modules or styled-components
4. Write tests for the component
5. Import and use the component where needed

### Adding a New Database Model

1. Create a new model file in `models/`
2. Define the schema with field types, validation, and indexes
3. Add any pre/post hooks or methods
4. Create the model and export it
5. Use the model in controllers as needed

## Performance Optimization

### Backend Optimization

- Use database indexes for frequently queried fields
- Implement pagination for large result sets
- Cache expensive operations
- Use compression middleware
- Optimize database queries

### Frontend Optimization

- Use React.memo for pure components
- Implement code splitting with React.lazy
- Optimize images and assets
- Use windowing for long lists
- Minimize bundle size

## Debugging

### Backend Debugging

- Use `console.log` for basic debugging
- For more advanced debugging, use Node.js debugger:
  ```bash
  node --inspect server.js
  ```
- Use Postman or Insomnia to test API endpoints
- Check server logs for errors

### Frontend Debugging

- Use React Developer Tools browser extension
- Use Redux DevTools for state debugging
- Check browser console for errors
- Use `debugger` statements for step-by-step debugging

## Deployment

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## Resources

### Documentation

- [API Documentation](API_DOCUMENTATION.md)
- [User Guide](USER_GUIDE.md)
- [Testing Documentation](TESTING.md)

### External Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Redux Documentation](https://redux.js.org/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Socket.IO Documentation](https://socket.io/docs/)

## Troubleshooting

### Common Issues

#### MongoDB Connection Errors

- Ensure MongoDB is running
- Check connection string in `.env` file
- Verify network connectivity to the database server

#### Node.js Dependency Issues

- Delete `node_modules` and reinstall dependencies
- Ensure Node.js version is compatible
- Check for conflicting dependencies

#### React Build Issues

- Clear browser cache
- Check for console errors
- Verify that all required dependencies are installed

## Contributing

For contribution guidelines, see the [Contributing section in README.md](../README.md#contributing).