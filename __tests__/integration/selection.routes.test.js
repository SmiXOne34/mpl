const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const Meal = require('../../models/Meal');
const Selection = require('../../models/Selection');
const { getCurrentWeekId } = require('../../utils/weekUtils');

// Load the test setup
require('../setup');

describe('Selection Routes', () => {
  let token, userId, mealId, selectionId;
  const weekId = getCurrentWeekId();

  beforeEach(async () => {
    // Create a test user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'chooser' // Role with selection privileges
    });
    userId = user._id;

    // Create a test meal
    const meal = await Meal.create({
      name: 'Test Meal',
      description: 'A test meal for integration testing',
      imageUrl: 'https://example.com/test-meal.jpg',
      tags: ['test', 'integration'],
      ingredients: ['ingredient 1', 'ingredient 2'],
      preparationSteps: ['step 1', 'step 2']
    });
    mealId = meal._id;

    // Create a test selection
    const selection = await Selection.create({
      userId: user._id,
      mealId: meal._id,
      day: 1, // Monday
      weekId
    });
    selectionId = selection._id;

    // Login to get token
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    token = res.body.token;
  });

  describe('GET /api/selections', () => {
    it('should get current user\'s selections', async () => {
      const res = await request(app)
        .get('/api/selections?day=1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].userId.toString()).toBe(userId.toString());
      expect(res.body.data[0].mealId._id.toString()).toBe(mealId.toString());
      expect(res.body.data[0].day).toBe(1);
    });

    it('should return empty array for day with no selections', async () => {
      const res = await request(app)
        .get('/api/selections?day=2') // Tuesday, no selections
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBe(0);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/selections?day=1');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/selections/family', () => {
    it('should get family selections', async () => {
      const res = await request(app)
        .get('/api/selections/family?day=1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].userId._id.toString()).toBe(userId.toString());
      expect(res.body.data[0].mealId._id.toString()).toBe(mealId.toString());
      expect(res.body.data[0].day).toBe(1);
    });

    it('should return empty array for day with no selections', async () => {
      const res = await request(app)
        .get('/api/selections/family?day=2') // Tuesday, no selections
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBe(0);
    });
  });

  describe('GET /api/selections/popular', () => {
    it('should get popular meal for a day', async () => {
      const res = await request(app)
        .get('/api/selections/popular?day=1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.meal._id.toString()).toBe(mealId.toString());
      expect(res.body.data.count).toBe(1);
    });

    it('should return 404 for day with no selections', async () => {
      const res = await request(app)
        .get('/api/selections/popular?day=2') // Tuesday, no selections
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('POST /api/selections', () => {
    it('should create a new selection', async () => {
      const res = await request(app)
        .post('/api/selections')
        .set('Authorization', `Bearer ${token}`)
        .send({
          mealId: mealId.toString(),
          day: 2 // Tuesday
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.userId.toString()).toBe(userId.toString());
      expect(res.body.data.mealId._id.toString()).toBe(mealId.toString());
      expect(res.body.data.day).toBe(2);
    });

    it('should not create selection with invalid day', async () => {
      const res = await request(app)
        .post('/api/selections')
        .set('Authorization', `Bearer ${token}`)
        .send({
          mealId: mealId.toString(),
          day: 7 // Invalid day
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    it('should not create selection without required fields', async () => {
      const res = await request(app)
        .post('/api/selections')
        .set('Authorization', `Bearer ${token}`)
        .send({
          // Missing mealId
          day: 2
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/selections/:id', () => {
    it('should delete a selection', async () => {
      const res = await request(app)
        .delete(`/api/selections/${selectionId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify selection was deleted
      const selection = await Selection.findById(selectionId);
      expect(selection).toBeNull();
    });

    it('should not delete non-existent selection', async () => {
      const fakeId = '60f1a5c5f32d8a2a6c9c9c9c'; // Valid format but doesn't exist
      const res = await request(app)
        .delete(`/api/selections/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/selections/history', () => {
    it('should get user\'s selection history', async () => {
      const res = await request(app)
        .get('/api/selections/history')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].userId.toString()).toBe(userId.toString());
      expect(res.body.data[0].mealId._id.toString()).toBe(mealId.toString());
      expect(res.body.data[0].dayName).toBe('Monday');
    });

    it('should filter history by timeframe', async () => {
      // Create an older selection (1 month ago)
      const oldDate = new Date();
      oldDate.setMonth(oldDate.getMonth() - 1);
      
      // Create a selection with a past date
      await Selection.create({
        userId,
        mealId,
        day: 3, // Wednesday
        weekId: 'old-week',
        createdAt: oldDate
      });

      // Get selections from this week only
      const res = await request(app)
        .get('/api/selections/history?timeframe=week')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBe(1); // Only the recent selection
      expect(res.body.data[0].day).toBe(1); // Monday
    });
  });
});