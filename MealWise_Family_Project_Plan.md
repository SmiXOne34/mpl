# MealWise Family - Project Plan

## Project Overview
MealWise Family is a collaborative meal planning application designed to simplify the process of deciding daily meals for families. The application allows family members to vote on meals from a weekly menu, with parents having administrative control over meal options and user roles.

## Core Functionalities

### User Authentication and Profiles
- **Authentication System**
  - Email-based login for family members
  - Secure password authentication for admin users (parents)
  - JWT-based session management
  
- **Profile Management**
  - User profiles with name, preferences, and role information
  - Role-based access control (Admin, Chooser, Viewer)
  - Profile editing capabilities

### Meal Management
- **Weekly Menu**
  - Display of seven meal options for the week
  - Detailed view of each meal with ingredients and preparation instructions
  - Visual indicators for popular choices
  
- **Meal Selection**
  - Each family member can select two meals from the weekly menu
  - Time-restricted voting (closes at 11:00 AM, reopens at 4:00 PM)
  - Real-time updates of selections

### Admin Features
- **Meal Administration**
  - Add, edit, and delete meals from the database
  - Set weekly menu selections
  - Manage meal categories and tags
  
- **User Management**
  - Assign roles to family members
  - View and manage user accounts
  - Reset passwords and handle account issues

### Real-time Dashboard
- **Homepage Features**
  - Display of most popular meal for the day
  - Real-time view of family members' selections
  - Countdown timer for selection deadline
  
- **Statistics and History**
  - Historical view of meal selections
  - Preference analysis for family members
  - Meal popularity trends

## Technical Architecture

### Frontend
- **Technology Stack**
  - React.js for web application
  - React Native for potential mobile application
  - Redux for state management
  - Socket.io client for real-time updates
  
- **Key Components**
  - Authentication screens (Login, Register)
  - User dashboard with meal selection interface
  - Admin panel for meal and user management
  - Real-time homepage with dynamic updates

### Backend
- **Technology Stack**
  - Node.js with Express.js
  - MongoDB for database
  - Mongoose for ODM
  - Socket.io for real-time communication
  
- **API Endpoints**
  - Authentication routes (/auth/login, /auth/register)
  - User routes (/users, /users/:id)
  - Meal routes (/meals, /meals/:id)
  - Selection routes (/selections, /selections/:userId)
  
- **Database Schema**
  - Users collection (profile information, roles)
  - Meals collection (meal details, ingredients)
  - Selections collection (user choices, timestamps)
  - WeeklyMenu collection (current week's selections)

### Security Considerations
- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting for API endpoints

## Development Roadmap

### Phase 1: Foundation (Weeks 1-2)
1. **Project Setup**
   - Initialize project repositories
   - Set up development environments
   - Configure CI/CD pipelines

2. **Database Design**
   - Create MongoDB schemas
   - Set up database connection
   - Implement basic CRUD operations

3. **Authentication System**
   - Implement user registration and login
   - Set up JWT token authentication
   - Create role-based access control

### Phase 2: Core Features (Weeks 3-4)
1. **User Profile Management**
   - Implement profile creation and editing
   - Add role assignment functionality
   - Create user dashboard

2. **Meal Management**
   - Develop meal creation and editing features
   - Implement weekly menu setting
   - Create meal detail views

3. **Selection System**
   - Build meal selection interface
   - Implement time-restricted voting
   - Create selection storage and retrieval

### Phase 3: Real-time Features (Weeks 5-6)
1. **Real-time Updates**
   - Implement Socket.io for live updates
   - Create real-time dashboard
   - Add popular meal calculation

2. **Admin Dashboard**
   - Develop comprehensive admin interface
   - Add user management features
   - Implement meal administration tools

3. **Time-based Restrictions**
   - Add scheduling system for voting periods
   - Implement countdown timers
   - Create notification system for deadlines

### Phase 4: Enhancement and Testing (Weeks 7-8)
1. **History and Statistics**
   - Implement meal history tracking
   - Add preference analysis
   - Create statistical dashboards

2. **Testing and Optimization**
   - Conduct unit and integration testing
   - Perform security audits
   - Optimize performance

3. **Documentation and Deployment**
   - Create user and developer documentation
   - Prepare deployment strategy
   - Set up monitoring and logging

## Technical Implementation Details

### Database Schema Design

#### User Schema
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String, // Hashed
  role: String, // "admin", "chooser", "viewer"
  preferences: [String], // Array of dietary preferences
  createdAt: Date,
  updatedAt: Date
}
```

#### Meal Schema
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  ingredients: [String],
  preparationSteps: [String],
  imageUrl: String,
  tags: [String], // e.g., "vegetarian", "quick", "kids-favorite"
  createdBy: ObjectId, // Reference to User
  createdAt: Date,
  updatedAt: Date
}
```

#### Selection Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User
  mealId: ObjectId, // Reference to Meal
  weekId: String, // Format: "YYYY-WW"
  day: Number, // 0-6 (Sunday to Saturday)
  createdAt: Date
}
```

#### WeeklyMenu Schema
```javascript
{
  _id: ObjectId,
  weekId: String, // Format: "YYYY-WW"
  meals: [ObjectId], // Array of Meal references
  createdBy: ObjectId, // Reference to User (admin)
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user
- `GET /api/auth/me` - Get current user information

#### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/:id` - Update user information
- `DELETE /api/users/:id` - Delete a user (admin only)
- `PUT /api/users/:id/role` - Update user role (admin only)

#### Meals
- `GET /api/meals` - Get all meals
- `POST /api/meals` - Create a new meal (admin only)
- `GET /api/meals/:id` - Get specific meal
- `PUT /api/meals/:id` - Update meal information (admin only)
- `DELETE /api/meals/:id` - Delete a meal (admin only)

#### Weekly Menu
- `GET /api/menu/current` - Get current week's menu
- `POST /api/menu` - Create a new weekly menu (admin only)
- `PUT /api/menu/:weekId` - Update weekly menu (admin only)

#### Selections
- `GET /api/selections` - Get all selections for current user
- `POST /api/selections` - Create a new selection
- `DELETE /api/selections/:id` - Delete a selection
- `GET /api/selections/popular` - Get most popular meal for today

### Real-time Implementation

#### Socket.io Events
- `selection:new` - Emitted when a user makes a new selection
- `selection:delete` - Emitted when a user removes a selection
- `menu:update` - Emitted when the weekly menu is updated
- `time:update` - Emitted to update time-remaining for voting

#### Real-time Dashboard Updates
The homepage will establish a WebSocket connection to receive real-time updates about:
- New meal selections by family members
- Changes in the most popular meal
- Time remaining for voting
- Menu changes

### Time-based Restrictions

#### Scheduling System
- Cron jobs to automatically open/close voting periods
- Voting closes at 11:00 AM and reopens at 4:00 PM daily
- Notifications sent to users when voting periods change

## User Experience Examples

### Family Member Experience
1. **Login**
   - User enters email and password
   - System authenticates and redirects to dashboard

2. **Meal Selection**
   - User views weekly menu with meal options
   - Selects two preferred meals before 11:00 AM
   - Receives confirmation of selection

3. **Dashboard View**
   - Sees real-time updates of family members' selections
   - Views the most popular meal for the day
   - Receives notification when voting closes/opens

### Admin Experience
1. **Meal Management**
   - Admin adds new meals to the database
   - Selects meals for the weekly menu
   - Edits or removes existing meals

2. **User Management**
   - Views list of family members
   - Assigns roles to users
   - Resets passwords if needed

3. **Menu Setting**
   - Selects seven meals for the weekly menu
   - Publishes the menu for family members to view
   - Receives notifications about popular selections

## Future Enhancements

### Phase 5: Advanced Features (Future Development)
1. **Dietary Restrictions**
   - Add detailed dietary preference settings
   - Implement meal filtering based on restrictions
   - Create allergen warnings

2. **Recipe Integration**
   - Add detailed recipes with step-by-step instructions
   - Include nutritional information
   - Add cooking time estimates

3. **Shopping List Generation**
   - Create automated shopping lists based on selected meals
   - Add ingredient quantity calculation
   - Implement shopping list export

4. **Mobile Application**
   - Develop React Native mobile application
   - Add push notifications
   - Implement offline capabilities

## Conclusion
The MealWise Family application will provide a comprehensive solution for family meal planning, allowing collaborative decision-making while maintaining parental control. The phased development approach ensures that core functionalities are implemented first, with room for future enhancements based on user feedback and needs.