# MealWise Family - Technical Architecture

## Technology Stack

### Frontend
- **Framework**: React.js
- **State Management**: Redux
- **UI Library**: Material-UI
- **Real-time Communication**: Socket.io client
- **HTTP Client**: Axios
- **Form Handling**: Formik with Yup validation
- **Routing**: React Router
- **Testing**: Jest and React Testing Library

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Real-time Server**: Socket.io
- **Validation**: Joi
- **Testing**: Mocha and Chai

### DevOps
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Deployment**: Docker, AWS/Heroku
- **Monitoring**: Sentry
- **API Documentation**: Swagger/OpenAPI

## System Architecture

### High-Level Architecture
```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  Client         │◄────►│  API Server     │◄────►│  Database       │
│  (React.js)     │      │  (Express.js)   │      │  (MongoDB)      │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        ▲                        ▲
        │                        │
        ▼                        ▼
┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │
│  WebSocket      │◄────►│  Socket Server  │
│  Connection     │      │  (Socket.io)    │
│                 │      │                 │
└─────────────────┘      └─────────────────┘
```

### Component Architecture

#### Frontend Components
```
App
├── Auth
│   ├── Login
│   ├── Register
│   └── ForgotPassword
├── Layout
│   ├── Navbar
│   ├── Sidebar
│   └── Footer
├── Dashboard
│   ├── MealSelection
│   │   ├── MealCard
│   │   └── SelectionForm
│   ├── FamilySelections
│   │   ├── MemberCard
│   │   └── SelectionList
│   └── PopularMeal
├── Admin
│   ├── MealManagement
│   │   ├── MealForm
│   │   ├── MealList
│   │   └── MealDetail
│   ├── UserManagement
│   │   ├── UserList
│   │   ├── UserForm
│   │   └── RoleAssignment
│   └── WeeklyMenuSetting
│       ├── MenuForm
│       └── MenuPreview
└── Profile
    ├── ProfileView
    ├── ProfileEdit
    └── PreferenceSettings
```

#### Backend Components
```
Server
├── Config
│   ├── database.js
│   ├── passport.js
│   └── socket.js
├── Models
│   ├── User.js
│   ├── Meal.js
│   ├── Selection.js
│   └── WeeklyMenu.js
├── Controllers
│   ├── authController.js
│   ├── userController.js
│   ├── mealController.js
│   ├── selectionController.js
│   └── menuController.js
├── Routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── mealRoutes.js
│   ├── selectionRoutes.js
│   └── menuRoutes.js
├── Middleware
│   ├── auth.js
│   ├── roleCheck.js
│   ├── validation.js
│   └── errorHandler.js
├── Utils
│   ├── timeRestriction.js
│   ├── popularityCalculator.js
│   └── notificationManager.js
└── Socket
    ├── handlers.js
    └── events.js
```

## Database Design

### MongoDB Collections and Schemas

#### User Collection
```javascript
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'chooser', 'viewer'],
    default: 'chooser'
  },
  preferences: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });
```

#### Meal Collection
```javascript
const MealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  ingredients: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: String,
      required: true
    },
    unit: {
      type: String
    }
  }],
  preparationSteps: [{
    type: String,
    required: true
  }],
  imageUrl: {
    type: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });
```

#### Selection Collection
```javascript
const SelectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meal',
    required: true
  },
  weekId: {
    type: String,
    required: true
  },
  day: {
    type: Number,
    required: true,
    min: 0,
    max: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
```

#### WeeklyMenu Collection
```javascript
const WeeklyMenuSchema = new mongoose.Schema({
  weekId: {
    type: String,
    required: true,
    unique: true
  },
  meals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meal'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });
```

## API Endpoints Specification

### Authentication Endpoints

#### Register User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "chooser"
    }
  }
  ```

#### Login User
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "chooser"
    }
  }
  ```

### User Endpoints

#### Get All Users (Admin Only)
- **URL**: `/api/users`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**:
  ```json
  {
    "success": true,
    "count": 2,
    "users": [
      {
        "id": "user_id_1",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "chooser"
      },
      {
        "id": "user_id_2",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "role": "viewer"
      }
    ]
  }
  ```

#### Update User Role (Admin Only)
- **URL**: `/api/users/:id/role`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Request Body**:
  ```json
  {
    "role": "admin"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin"
    }
  }
  ```

### Meal Endpoints

#### Create Meal (Admin Only)
- **URL**: `/api/meals`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Request Body**:
  ```json
  {
    "name": "Spaghetti Bolognese",
    "description": "Classic Italian pasta dish with meat sauce",
    "ingredients": [
      {
        "name": "Spaghetti",
        "quantity": "500",
        "unit": "g"
      },
      {
        "name": "Ground Beef",
        "quantity": "400",
        "unit": "g"
      }
    ],
    "preparationSteps": [
      "Boil water and cook pasta according to package instructions",
      "Brown the ground beef in a large pan"
    ],
    "imageUrl": "https://example.com/spaghetti.jpg",
    "tags": ["italian", "pasta", "beef"]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "meal": {
      "id": "meal_id",
      "name": "Spaghetti Bolognese",
      "description": "Classic Italian pasta dish with meat sauce",
      "ingredients": [
        {
          "name": "Spaghetti",
          "quantity": "500",
          "unit": "g"
        },
        {
          "name": "Ground Beef",
          "quantity": "400",
          "unit": "g"
        }
      ],
      "preparationSteps": [
        "Boil water and cook pasta according to package instructions",
        "Brown the ground beef in a large pan"
      ],
      "imageUrl": "https://example.com/spaghetti.jpg",
      "tags": ["italian", "pasta", "beef"],
      "createdBy": "user_id"
    }
  }
  ```

#### Get All Meals
- **URL**: `/api/meals`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**:
  ```json
  {
    "success": true,
    "count": 2,
    "meals": [
      {
        "id": "meal_id_1",
        "name": "Spaghetti Bolognese",
        "description": "Classic Italian pasta dish with meat sauce",
        "imageUrl": "https://example.com/spaghetti.jpg",
        "tags": ["italian", "pasta", "beef"]
      },
      {
        "id": "meal_id_2",
        "name": "Chicken Curry",
        "description": "Spicy Indian chicken curry",
        "imageUrl": "https://example.com/curry.jpg",
        "tags": ["indian", "spicy", "chicken"]
      }
    ]
  }
  ```

### Weekly Menu Endpoints

#### Create Weekly Menu (Admin Only)
- **URL**: `/api/menu`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Request Body**:
  ```json
  {
    "weekId": "2023-W01",
    "meals": ["meal_id_1", "meal_id_2", "meal_id_3", "meal_id_4", "meal_id_5", "meal_id_6", "meal_id_7"]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "menu": {
      "id": "menu_id",
      "weekId": "2023-W01",
      "meals": [
        {
          "id": "meal_id_1",
          "name": "Spaghetti Bolognese"
        },
        {
          "id": "meal_id_2",
          "name": "Chicken Curry"
        },
        // ... other meals
      ],
      "createdBy": "user_id"
    }
  }
  ```

#### Get Current Weekly Menu
- **URL**: `/api/menu/current`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**:
  ```json
  {
    "success": true,
    "menu": {
      "id": "menu_id",
      "weekId": "2023-W01",
      "meals": [
        {
          "id": "meal_id_1",
          "name": "Spaghetti Bolognese",
          "description": "Classic Italian pasta dish with meat sauce",
          "imageUrl": "https://example.com/spaghetti.jpg"
        },
        // ... other meals
      ]
    }
  }
  ```

### Selection Endpoints

#### Create Selection
- **URL**: `/api/selections`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Request Body**:
  ```json
  {
    "mealId": "meal_id_1",
    "day": 1
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "selection": {
      "id": "selection_id",
      "userId": "user_id",
      "mealId": "meal_id_1",
      "weekId": "2023-W01",
      "day": 1,
      "createdAt": "2023-01-02T10:30:00Z"
    }
  }
  ```

#### Get Popular Meal for Today
- **URL**: `/api/selections/popular`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**:
  ```json
  {
    "success": true,
    "popularMeal": {
      "id": "meal_id_1",
      "name": "Spaghetti Bolognese",
      "description": "Classic Italian pasta dish with meat sauce",
      "imageUrl": "https://example.com/spaghetti.jpg",
      "voteCount": 3
    },
    "allMeals": [
      {
        "id": "meal_id_1",
        "name": "Spaghetti Bolognese",
        "voteCount": 3
      },
      {
        "id": "meal_id_2",
        "name": "Chicken Curry",
        "voteCount": 2
      }
      // ... other meals
    ]
  }
  ```

## Real-time Communication

### Socket.io Events

#### Client-to-Server Events
- `join:family` - Join family room for real-time updates
- `selection:create` - Create a new meal selection
- `selection:delete` - Delete a meal selection

#### Server-to-Client Events
- `selection:new` - New selection made by a family member
- `selection:removed` - Selection removed by a family member
- `popular:update` - Update on the most popular meal
- `time:update` - Update on time remaining for voting
- `menu:update` - Update on weekly menu changes

### Example Socket Implementation

#### Server-side
```javascript
// In socket/handlers.js
const handleSelectionCreate = async (io, socket, data) => {
  try {
    const { userId, mealId, day } = data;
    
    // Create selection in database
    const selection = await Selection.create({
      userId,
      mealId,
      weekId: getCurrentWeekId(),
      day
    });
    
    // Populate meal details
    const populatedSelection = await Selection.findById(selection._id)
      .populate('userId', 'name')
      .populate('mealId', 'name description imageUrl');
    
    // Emit to all family members
    io.to('family').emit('selection:new', populatedSelection);
    
    // Recalculate and emit popular meal
    const popularMeal = await calculatePopularMeal(getCurrentWeekId(), getCurrentDay());
    io.to('family').emit('popular:update', popularMeal);
    
    return { success: true, selection: populatedSelection };
  } catch (error) {
    console.error('Socket error:', error);
    return { success: false, error: error.message };
  }
};
```

#### Client-side
```javascript
// In Redux action
export const createSelection = (mealId, day) => async (dispatch, getState) => {
  try {
    const { socket, auth } = getState();
    
    if (!socket.connected) {
      throw new Error('Socket not connected');
    }
    
    // Emit selection create event
    socket.emit('selection:create', {
      userId: auth.user.id,
      mealId,
      day
    }, (response) => {
      if (response.success) {
        dispatch({
          type: 'SELECTION_CREATE_SUCCESS',
          payload: response.selection
        });
      } else {
        dispatch({
          type: 'SELECTION_CREATE_FAIL',
          payload: response.error
        });
      }
    });
  } catch (error) {
    dispatch({
      type: 'SELECTION_CREATE_FAIL',
      payload: error.message
    });
  }
};
```

## Time Restriction Implementation

### Time Restriction Service
```javascript
// In utils/timeRestriction.js
const isVotingOpen = () => {
  const now = new Date();
  const hours = now.getHours();
  
  // Voting is closed between 11:00 AM and 4:00 PM
  return !(hours >= 11 && hours < 16);
};

const getNextStatusChangeTime = () => {
  const now = new Date();
  const hours = now.getHours();
  let nextChangeTime = new Date(now);
  
  if (hours < 11) {
    // Next change is at 11:00 AM (closing)
    nextChangeTime.setHours(11, 0, 0, 0);
  } else if (hours >= 11 && hours < 16) {
    // Next change is at 4:00 PM (opening)
    nextChangeTime.setHours(16, 0, 0, 0);
  } else {
    // Next change is at 11:00 AM tomorrow (closing)
    nextChangeTime.setDate(nextChangeTime.getDate() + 1);
    nextChangeTime.setHours(11, 0, 0, 0);
  }
  
  return nextChangeTime;
};

const getTimeRemaining = () => {
  const now = new Date();
  const nextChange = getNextStatusChangeTime();
  
  return {
    isOpen: isVotingOpen(),
    nextChangeTime: nextChange,
    timeRemaining: nextChange - now,
    nextAction: isVotingOpen() ? 'close' : 'open'
  };
};
```

### Middleware for Time Restriction
```javascript
// In middleware/timeRestriction.js
const timeRestrictionMiddleware = (req, res, next) => {
  // Skip time restriction for admin users
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  // Check if voting is open for selection endpoints
  if (req.path.startsWith('/api/selections') && req.method === 'POST') {
    const { isOpen } = getTimeRemaining();
    
    if (!isOpen) {
      return res.status(403).json({
        success: false,
        message: 'Voting is currently closed. Voting will reopen at 4:00 PM.'
      });
    }
  }
  
  next();
};
```

## Security Considerations

### Authentication and Authorization
- JWT tokens for stateless authentication
- Role-based access control for different user types
- Token expiration and refresh mechanism
- Secure password storage with bcrypt

### Data Validation
- Input validation using Joi for all API endpoints
- Sanitization of user inputs to prevent XSS attacks
- MongoDB query sanitization to prevent NoSQL injection

### API Security
- Rate limiting to prevent brute force attacks
- CORS configuration to restrict access to trusted domains
- Helmet.js for setting security-related HTTP headers
- HTTPS for all communications in production

### Example Authentication Middleware
```javascript
// In middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization').replace('Bearer ', '');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      throw new Error();
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = { auth, authorize };
```

## Deployment Strategy

### Development Environment
- Local development with Docker Compose
- MongoDB Atlas for database
- Environment variables for configuration

### Staging Environment
- Heroku deployment
- Continuous integration with GitHub Actions
- Automated testing before deployment

### Production Environment
- AWS Elastic Beanstalk or similar service
- MongoDB Atlas M10 or higher tier
- CloudFront for static asset delivery
- Route 53 for DNS management

### Deployment Process
1. Code pushed to GitHub repository
2. GitHub Actions runs tests and builds the application
3. If tests pass, application is deployed to staging
4. Manual approval for production deployment
5. Production deployment with zero-downtime strategy

## Monitoring and Logging

### Application Monitoring
- Sentry for error tracking
- New Relic for performance monitoring
- Custom health check endpoints

### Logging Strategy
- Winston for structured logging
- Log levels (error, warn, info, debug)
- Log rotation and retention policies

### Metrics Collection
- User activity metrics
- API performance metrics
- Database query performance
- Real-time connection statistics

## Conclusion

This technical architecture document provides a comprehensive blueprint for developing the MealWise Family application. The architecture is designed to be scalable, secure, and maintainable, with a focus on real-time capabilities and user experience.

The implementation follows modern best practices for web application development, with clear separation of concerns, robust security measures, and a thoughtful approach to real-time data synchronization.

As development progresses, this document should be updated to reflect any architectural changes or refinements based on implementation experience and user feedback.