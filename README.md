# MealWise Family - Collaborative Meal Planning Application

MealWise Family is a web application designed to simplify meal planning for families by allowing members to collaboratively choose meals from a predefined weekly menu.

![MealWise Family Dashboard](https://example.com/dashboard-screenshot.png)

## Features

### For Family Members

- **Authentication**: Secure login via email with password recovery
- **Profile Management**: Personalized profiles with dietary preferences
- **Menu Display**: Weekly menu of meal options
- **Meal Selection**: Vote on meals during designated time windows
- **Time-Restricted Voting**: Meal choices must be submitted by 11:00 AM and reopen at 4:00 PM
- **Real-time Updates**: See the most popular meal choice and other family members' selections
- **Statistics and Analytics**: Track meal preferences and selection patterns
- **Notifications**: Receive alerts about new menus and selections

### For Parents (Admin)

- **Secure Authentication**: Password-protected admin access
- **Meal Management**: Add, edit, or delete meals from the database
- **Role Management**: Assign roles (Admin, Chooser, Viewer) to family members
- **Menu Setting**: Define the meals for each week
- **Data Overview**: View historical meal choices and preferences
- **User Management**: Add, edit, or remove family members

## Technology Stack

### Frontend

- React.js
- Redux for state management
- Material-UI for user interface
- Socket.io client for real-time updates

### Backend

- Node.js with Express.js
- MongoDB for database
- Mongoose for ODM
- JWT for authentication
- Socket.io for real-time communication

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/mealwise-family.git
cd mealwise-family
```

2. Install dependencies

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

3. Set up environment variables

```bash
# Create a .env file in the root directory with the following variables
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/mealwise
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
```

4. Run the application

```bash
# Start both server and client in development mode
npm run dev
```

The server will run on http://localhost:9091 and the client on http://localhost:3000

### Demo Data

To populate the database with sample data for testing:

```bash
npm run demo
```

This will create:

- Admin user (email: <admin@example.com>, password: admin123)
- Regular users with different roles
- Sample meals with ingredients and preparation steps
- A weekly menu
- Sample meal selections

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
└── README.md               # Project documentation
```

## Documentation

For detailed information about the project, please refer to:

- [API Documentation](docs/API_DOCUMENTATION.md) - Detailed API endpoints and usage
- [User Guide](docs/USER_GUIDE.md) - Comprehensive guide for end users
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Instructions for deploying the application

## Testing

Run tests with:

```bash
npm test
```

For test coverage:

```bash
npm run test:coverage
```

## Real-time Features

MealWise Family uses Socket.io to provide real-time updates:

- New meal selections by family members
- Changes in the most popular meal
- Updates to the weekly menu
- Time-based notifications for voting periods

## User Roles

- **Admin**: Full access to manage meals, users, and view all data
- **Chooser**: Can select meals from the weekly menu
- **Viewer**: Can only view the dashboard and meal selections

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## Acknowledgments

- [Express.js](https://expressjs.com/)
- [React](https://reactjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Material-UI](https://material-ui.com/)
- [Socket.IO](https://socket.io/)
- Icons provided by Material-UI
- Sample meal data inspired by various recipe websites

## Contact

For questions or support, please contact:

- **Email**: support@mealwise-family.com
- **Website**: https://mealwise-family.com
- **GitHub**: https://github.com/yourusername/mealwise-family
