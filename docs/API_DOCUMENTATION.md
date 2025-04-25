# MealWise Family API Documentation

## Base URL

```
https://mealwise-family.herokuapp.com/api
```

For local development:

```
http://localhost:5000/api
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. Most endpoints require a valid token to be included in the request.

### Token Format

Include the token in the request headers:

```
Authorization: Bearer <your_token>
```

Alternatively, the token can be sent as a cookie.

## Response Format

All API responses follow a standard format:

```json
{
  "success": true|false,
  "data": {...} | [...],
  "error": "Error message (only included if success is false)",
  "votingStatus": {
    "isOpen": true|false,
    "hoursRemaining": 5,
    "minutesRemaining": 30,
    "message": "Voting is open for 5 hours and 30 minutes"
  }
}
```

The `votingStatus` field is included in successful responses to indicate whether meal selection voting is currently open.

## Error Handling

Errors are returned with appropriate HTTP status codes and a descriptive message:

```json
{
  "success": false,
  "error": "Detailed error message"
}
```

Common error status codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse. Clients are limited to 100 requests per 10-minute window.

## Endpoints

### Authentication

#### Register a new user

```
POST /auth/register
```

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2023-02-15T12:00:00.000Z"
  }
}
```

#### Login

```
POST /auth/login
```

Request body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2023-02-15T12:00:00.000Z"
  }
}
```

#### Get current user

```
GET /auth/me
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2023-02-15T12:00:00.000Z"
  }
}
```

#### Logout

```
GET /auth/logout
```

Response:
```json
{
  "success": true,
  "data": {}
}
```

#### Forgot Password

```
POST /auth/forgotpassword
```

Request body:
```json
{
  "email": "john@example.com"
}
```

Response:
```json
{
  "success": true,
  "data": "Email sent"
}
```

#### Reset Password

```
PUT /auth/resetpassword/:resettoken
```

Request body:
```json
{
  "password": "newpassword123"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Users

#### Get all users (admin only)

```
GET /users
```

Query parameters:
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)
- `sort` - Sort field (default: createdAt)
- `order` - Sort order (asc or desc, default: desc)

Response:
```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "current": 1,
    "total": 1
  },
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2023-02-15T12:00:00.000Z"
    },
    {
      "_id": "60d21b4667d0d8992e610c86",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "user",
      "createdAt": "2023-02-15T12:30:00.000Z"
    }
  ]
}
```

#### Get single user (admin only)

```
GET /users/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2023-02-15T12:00:00.000Z"
  }
}
```

#### Create user (admin only)

```
POST /users
```

Request body:
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "user"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c87",
    "name": "New User",
    "email": "newuser@example.com",
    "role": "user",
    "createdAt": "2023-02-15T13:00:00.000Z"
  }
}
```

#### Update user

```
PUT /users/:id
```

Request body:
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "Updated Name",
    "email": "updated@example.com",
    "role": "user",
    "createdAt": "2023-02-15T12:00:00.000Z"
  }
}
```

#### Delete user (admin only)

```
DELETE /users/:id
```

Response:
```json
{
  "success": true,
  "data": {}
}
```

### Meals

#### Get all meals

```
GET /meals
```

Query parameters:
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)
- `sort` - Sort field (default: createdAt)
- `order` - Sort order (asc or desc, default: desc)
- `search` - Search term for meal name or description
- `tags` - Filter by tags (comma-separated)

Response:
```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "current": 1,
    "total": 1
  },
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c90",
      "name": "Spaghetti Bolognese",
      "description": "Classic Italian pasta dish",
      "imageUrl": "https://example.com/spaghetti.jpg",
      "tags": ["pasta", "italian", "dinner"],
      "ingredients": [
        {
          "name": "Spaghetti",
          "amount": "200g"
        },
        {
          "name": "Ground beef",
          "amount": "300g"
        }
      ],
      "preparationSteps": [
        "Boil the pasta",
        "Cook the meat sauce",
        "Combine and serve"
      ],
      "createdBy": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "John Doe"
      },
      "createdAt": "2023-02-15T12:00:00.000Z"
    },
    {
      "_id": "60d21b4667d0d8992e610c91",
      "name": "Caesar Salad",
      "description": "Fresh salad with Caesar dressing",
      "imageUrl": "https://example.com/caesar.jpg",
      "tags": ["salad", "healthy", "lunch"],
      "ingredients": [
        {
          "name": "Romaine lettuce",
          "amount": "1 head"
        },
        {
          "name": "Croutons",
          "amount": "100g"
        }
      ],
      "preparationSteps": [
        "Wash and chop the lettuce",
        "Prepare the dressing",
        "Toss and serve"
      ],
      "createdBy": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "John Doe"
      },
      "createdAt": "2023-02-15T12:30:00.000Z"
    }
  ]
}
```

#### Get single meal

```
GET /meals/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c90",
    "name": "Spaghetti Bolognese",
    "description": "Classic Italian pasta dish",
    "imageUrl": "https://example.com/spaghetti.jpg",
    "tags": ["pasta", "italian", "dinner"],
    "ingredients": [
      {
        "name": "Spaghetti",
        "amount": "200g"
      },
      {
        "name": "Ground beef",
        "amount": "300g"
      }
    ],
    "preparationSteps": [
      "Boil the pasta",
      "Cook the meat sauce",
      "Combine and serve"
    ],
    "createdBy": {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "John Doe"
    },
    "createdAt": "2023-02-15T12:00:00.000Z"
  }
}
```

#### Create meal (admin only)

```
POST /meals
```

Request body:
```json
{
  "name": "New Meal",
  "description": "Description of the new meal",
  "imageUrl": "https://example.com/newmeal.jpg",
  "tags": ["new", "test"],
  "ingredients": [
    {
      "name": "Ingredient 1",
      "amount": "100g"
    },
    {
      "name": "Ingredient 2",
      "amount": "200ml"
    }
  ],
  "preparationSteps": [
    "Step 1",
    "Step 2",
    "Step 3"
  ]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c92",
    "name": "New Meal",
    "description": "Description of the new meal",
    "imageUrl": "https://example.com/newmeal.jpg",
    "tags": ["new", "test"],
    "ingredients": [
      {
        "name": "Ingredient 1",
        "amount": "100g"
      },
      {
        "name": "Ingredient 2",
        "amount": "200ml"
      }
    ],
    "preparationSteps": [
      "Step 1",
      "Step 2",
      "Step 3"
    ],
    "createdBy": {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "John Doe"
    },
    "createdAt": "2023-02-15T13:00:00.000Z"
  }
}
```

#### Update meal (admin only)

```
PUT /meals/:id
```

Request body:
```json
{
  "name": "Updated Meal",
  "description": "Updated description",
  "tags": ["updated", "test"]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c90",
    "name": "Updated Meal",
    "description": "Updated description",
    "imageUrl": "https://example.com/spaghetti.jpg",
    "tags": ["updated", "test"],
    "ingredients": [
      {
        "name": "Spaghetti",
        "amount": "200g"
      },
      {
        "name": "Ground beef",
        "amount": "300g"
      }
    ],
    "preparationSteps": [
      "Boil the pasta",
      "Cook the meat sauce",
      "Combine and serve"
    ],
    "createdBy": {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "John Doe"
    },
    "createdAt": "2023-02-15T12:00:00.000Z"
  }
}
```

#### Delete meal (admin only)

```
DELETE /meals/:id
```

Response:
```json
{
  "success": true,
  "data": {}
}
```

### Menu

#### Get current week's menu

```
GET /menu
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c95",
    "weekId": "2023-W07",
    "meals": [
      {
        "_id": "60d21b4667d0d8992e610c90",
        "name": "Spaghetti Bolognese",
        "description": "Classic Italian pasta dish",
        "imageUrl": "https://example.com/spaghetti.jpg",
        "tags": ["pasta", "italian", "dinner"]
      },
      {
        "_id": "60d21b4667d0d8992e610c91",
        "name": "Caesar Salad",
        "description": "Fresh salad with Caesar dressing",
        "imageUrl": "https://example.com/caesar.jpg",
        "tags": ["salad", "healthy", "lunch"]
      }
    ],
    "createdAt": "2023-02-15T12:00:00.000Z"
  }
}
```

#### Get menu for specific week

```
GET /menu/:weekId
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c96",
    "weekId": "2023-W06",
    "meals": [
      {
        "_id": "60d21b4667d0d8992e610c90",
        "name": "Spaghetti Bolognese",
        "description": "Classic Italian pasta dish",
        "imageUrl": "https://example.com/spaghetti.jpg",
        "tags": ["pasta", "italian", "dinner"]
      },
      {
        "_id": "60d21b4667d0d8992e610c91",
        "name": "Caesar Salad",
        "description": "Fresh salad with Caesar dressing",
        "imageUrl": "https://example.com/caesar.jpg",
        "tags": ["salad", "healthy", "lunch"]
      }
    ],
    "createdAt": "2023-02-08T12:00:00.000Z"
  }
}
```

#### Create or update menu (admin only)

```
POST /menu
```

Request body:
```json
{
  "weekId": "2023-W08",
  "meals": [
    "60d21b4667d0d8992e610c90",
    "60d21b4667d0d8992e610c91",
    "60d21b4667d0d8992e610c92"
  ]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c97",
    "weekId": "2023-W08",
    "meals": [
      {
        "_id": "60d21b4667d0d8992e610c90",
        "name": "Spaghetti Bolognese",
        "description": "Classic Italian pasta dish",
        "imageUrl": "https://example.com/spaghetti.jpg",
        "tags": ["pasta", "italian", "dinner"]
      },
      {
        "_id": "60d21b4667d0d8992e610c91",
        "name": "Caesar Salad",
        "description": "Fresh salad with Caesar dressing",
        "imageUrl": "https://example.com/caesar.jpg",
        "tags": ["salad", "healthy", "lunch"]
      },
      {
        "_id": "60d21b4667d0d8992e610c92",
        "name": "New Meal",
        "description": "Description of the new meal",
        "imageUrl": "https://example.com/newmeal.jpg",
        "tags": ["new", "test"]
      }
    ],
    "createdAt": "2023-02-22T12:00:00.000Z"
  }
}
```

#### Delete menu (admin only)

```
DELETE /menu/:weekId
```

Response:
```json
{
  "success": true,
  "data": {}
}
```

### Selections

#### Get user's selections for a day

```
GET /selections?day=1
```

Query parameters:
- `day` - Day of the week (0-6, where 0 is Sunday)
- `weekId` - Week ID (optional, defaults to current week)

Response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c98",
      "userId": "60d21b4667d0d8992e610c85",
      "mealId": {
        "_id": "60d21b4667d0d8992e610c90",
        "name": "Spaghetti Bolognese",
        "description": "Classic Italian pasta dish",
        "imageUrl": "https://example.com/spaghetti.jpg",
        "tags": ["pasta", "italian", "dinner"]
      },
      "day": 1,
      "weekId": "2023-W07",
      "createdAt": "2023-02-15T12:00:00.000Z"
    }
  ]
}
```

#### Get family selections for a day

```
GET /selections/family?day=1
```

Query parameters:
- `day` - Day of the week (0-6, where 0 is Sunday)
- `weekId` - Week ID (optional, defaults to current week)

Response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c98",
      "userId": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "John Doe"
      },
      "mealId": {
        "_id": "60d21b4667d0d8992e610c90",
        "name": "Spaghetti Bolognese",
        "imageUrl": "https://example.com/spaghetti.jpg"
      },
      "day": 1,
      "weekId": "2023-W07"
    },
    {
      "_id": "60d21b4667d0d8992e610c99",
      "userId": {
        "_id": "60d21b4667d0d8992e610c86",
        "name": "Jane Smith"
      },
      "mealId": {
        "_id": "60d21b4667d0d8992e610c91",
        "name": "Caesar Salad",
        "imageUrl": "https://example.com/caesar.jpg"
      },
      "day": 1,
      "weekId": "2023-W07"
    }
  ]
}
```

#### Get popular meal for a day

```
GET /selections/popular?day=1
```

Query parameters:
- `day` - Day of the week (0-6, where 0 is Sunday)
- `weekId` - Week ID (optional, defaults to current week)

Response:
```json
{
  "success": true,
  "data": {
    "meal": {
      "_id": "60d21b4667d0d8992e610c90",
      "name": "Spaghetti Bolognese",
      "description": "Classic Italian pasta dish",
      "imageUrl": "https://example.com/spaghetti.jpg",
      "tags": ["pasta", "italian", "dinner"]
    },
    "count": 2
  }
}
```

#### Create a selection

```
POST /selections
```

Request body:
```json
{
  "mealId": "60d21b4667d0d8992e610c90",
  "day": 1
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c98",
    "userId": "60d21b4667d0d8992e610c85",
    "mealId": {
      "_id": "60d21b4667d0d8992e610c90",
      "name": "Spaghetti Bolognese",
      "description": "Classic Italian pasta dish",
      "imageUrl": "https://example.com/spaghetti.jpg",
      "tags": ["pasta", "italian", "dinner"]
    },
    "day": 1,
    "weekId": "2023-W07",
    "createdAt": "2023-02-15T12:00:00.000Z"
  }
}
```

#### Delete a selection

```
DELETE /selections/:id
```

Response:
```json
{
  "success": true,
  "data": {}
}
```

#### Get selection history

```
GET /selections/history
```

Query parameters:
- `timeframe` - Time period (all, week, month)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)

Response:
```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "current": 1,
    "total": 1
  },
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c98",
      "userId": "60d21b4667d0d8992e610c85",
      "mealId": {
        "_id": "60d21b4667d0d8992e610c90",
        "name": "Spaghetti Bolognese",
        "description": "Classic Italian pasta dish",
        "imageUrl": "https://example.com/spaghetti.jpg",
        "tags": ["pasta", "italian", "dinner"]
      },
      "day": 1,
      "dayName": "Monday",
      "weekId": "2023-W07",
      "createdAt": "2023-02-15T12:00:00.000Z"
    },
    {
      "_id": "60d21b4667d0d8992e610c99",
      "userId": "60d21b4667d0d8992e610c85",
      "mealId": {
        "_id": "60d21b4667d0d8992e610c91",
        "name": "Caesar Salad",
        "description": "Fresh salad with Caesar dressing",
        "imageUrl": "https://example.com/caesar.jpg",
        "tags": ["salad", "healthy", "lunch"]
      },
      "day": 2,
      "dayName": "Tuesday",
      "weekId": "2023-W07",
      "createdAt": "2023-02-16T12:00:00.000Z"
    }
  ]
}
```

### Notifications

#### Get user's notifications

```
GET /notifications
```

Query parameters:
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)
- `read` - Filter by read status (true, false, or all)

Response:
```json
{
  "success": true,
  "count": 2,
  "unreadCount": 1,
  "pagination": {
    "current": 1,
    "total": 1
  },
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c9a",
      "userId": "60d21b4667d0d8992e610c85",
      "title": "New Menu Available",
      "message": "The menu for next week is now available",
      "type": "menu",
      "read": false,
      "createdAt": "2023-02-15T12:00:00.000Z"
    },
    {
      "_id": "60d21b4667d0d8992e610c9b",
      "userId": "60d21b4667d0d8992e610c85",
      "title": "Selection Reminder",
      "message": "Don't forget to make your meal selections for the week",
      "type": "reminder",
      "read": true,
      "createdAt": "2023-02-14T12:00:00.000Z"
    }
  ]
}
```

#### Get a single notification

```
GET /notifications/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c9a",
    "userId": "60d21b4667d0d8992e610c85",
    "title": "New Menu Available",
    "message": "The menu for next week is now available",
    "type": "menu",
    "read": false,
    "createdAt": "2023-02-15T12:00:00.000Z"
  }
}
```

#### Mark notification as read

```
PUT /notifications/:id/read
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c9a",
    "userId": "60d21b4667d0d8992e610c85",
    "title": "New Menu Available",
    "message": "The menu for next week is now available",
    "type": "menu",
    "read": true,
    "createdAt": "2023-02-15T12:00:00.000Z"
  }
}
```

#### Mark all notifications as read

```
PUT /notifications/read-all
```

Response:
```json
{
  "success": true,
  "data": {
    "modifiedCount": 2
  }
}
```

#### Delete a notification

```
DELETE /notifications/:id
```

Response:
```json
{
  "success": true,
  "data": {}
}
```

## Time Restrictions

Meal selections are only allowed during specific time windows:

- **Voting Open**: 4:00 PM to 11:00 AM the next day
- **Voting Closed**: 11:00 AM to 4:00 PM

Attempting to create or modify selections outside of the voting window will result in a 403 Forbidden error, except for users with admin privileges who can bypass this restriction.

## Socket.IO Events

The API includes real-time functionality using Socket.IO.

### Client Events (emit to server)

- `join` - Join a user's notification channel
  ```javascript
  socket.emit('join', { userId: '60d21b4667d0d8992e610c85' });
  ```

- `leave` - Leave a user's notification channel
  ```javascript
  socket.emit('leave', { userId: '60d21b4667d0d8992e610c85' });
  ```

### Server Events (listen from client)

- `notification` - Receive a new notification
  ```javascript
  socket.on('notification', (notification) => {
    console.log(notification);
    // {
    //   _id: '60d21b4667d0d8992e610c9a',
    //   userId: '60d21b4667d0d8992e610c85',
    //   title: 'New Menu Available',
    //   message: 'The menu for next week is now available',
    //   type: 'menu',
    //   read: false,
    //   createdAt: '2023-02-15T12:00:00.000Z'
    // }
  });
  ```

- `selection` - Receive a new family selection
  ```javascript
  socket.on('selection', (selection) => {
    console.log(selection);
    // {
    //   _id: '60d21b4667d0d8992e610c98',
    //   userId: {
    //     _id: '60d21b4667d0d8992e610c85',
    //     name: 'John Doe'
    //   },
    //   mealId: {
    //     _id: '60d21b4667d0d8992e610c90',
    //     name: 'Spaghetti Bolognese',
    //     imageUrl: 'https://example.com/spaghetti.jpg'
    //   },
    //   day: 1,
    //   weekId: '2023-W07'
    // }
  });
  ```

- `menu` - Receive a new menu
  ```javascript
  socket.on('menu', (menu) => {
    console.log(menu);
    // {
    //   _id: '60d21b4667d0d8992e610c97',
    //   weekId: '2023-W08',
    //   meals: [
    //     {
    //       _id: '60d21b4667d0d8992e610c90',
    //       name: 'Spaghetti Bolognese'
    //     },
    //     {
    //       _id: '60d21b4667d0d8992e610c91',
    //       name: 'Caesar Salad'
    //     }
    //   ]
    // }
  });
  ```