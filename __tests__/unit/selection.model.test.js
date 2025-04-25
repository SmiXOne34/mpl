const mongoose = require('mongoose');
const Selection = require('../../models/Selection');
const User = require('../../models/User');
const Meal = require('../../models/Meal');

// Load the test setup
require('../setup');

describe('Selection Model', () => {
  let user, meal;

  // Create a test user and meal before each test
  beforeEach(async () => {
    // Create a test user
    user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    });

    // Create a test meal
    meal = await Meal.create({
      name: 'Test Meal',
      description: 'A test meal for unit testing',
      imageUrl: 'https://example.com/test-meal.jpg',
      tags: ['test', 'unit-testing'],
      ingredients: ['ingredient 1', 'ingredient 2'],
      preparationSteps: ['step 1', 'step 2']
    });
  });

  it('should create a new selection', async () => {
    // Create test selection data
    const selectionData = {
      userId: user._id,
      mealId: meal._id,
      day: 1, // Monday
      weekId: '2023-W10' // Example week ID
    };

    // Create a new selection
    const selection = await Selection.create(selectionData);

    // Check that the selection was created successfully
    expect(selection).toBeDefined();
    expect(selection._id).toBeDefined();
    expect(selection.userId.toString()).toBe(user._id.toString());
    expect(selection.mealId.toString()).toBe(meal._id.toString());
    expect(selection.day).toBe(selectionData.day);
    expect(selection.weekId).toBe(selectionData.weekId);
    expect(selection.createdAt).toBeDefined();
  });

  it('should require userId, mealId, and day fields', async () => {
    try {
      await Selection.create({});
      // If we reach this point, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors.userId).toBeDefined();
      expect(error.errors.mealId).toBeDefined();
      expect(error.errors.day).toBeDefined();
    }
  });

  it('should validate day is between 0 and 6', async () => {
    // Try with day = -1 (invalid)
    try {
      await Selection.create({
        userId: user._id,
        mealId: meal._id,
        day: -1,
        weekId: '2023-W10'
      });
      // If we reach this point, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors.day).toBeDefined();
    }

    // Try with day = 7 (invalid)
    try {
      await Selection.create({
        userId: user._id,
        mealId: meal._id,
        day: 7,
        weekId: '2023-W10'
      });
      // If we reach this point, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors.day).toBeDefined();
    }

    // Try with day = 0 (valid - Sunday)
    const selection1 = await Selection.create({
      userId: user._id,
      mealId: meal._id,
      day: 0,
      weekId: '2023-W10'
    });
    expect(selection1).toBeDefined();
    expect(selection1.day).toBe(0);

    // Try with day = 6 (valid - Saturday)
    const selection2 = await Selection.create({
      userId: user._id,
      mealId: meal._id,
      day: 6,
      weekId: '2023-W10'
    });
    expect(selection2).toBeDefined();
    expect(selection2.day).toBe(6);
  });

  it('should get family selections for a specific day', async () => {
    // Create another user (family member)
    const familyMember = await User.create({
      name: 'Family Member',
      email: 'family@example.com',
      password: 'password123',
      role: 'user'
    });

    // Create selections for both users
    await Selection.create({
      userId: user._id,
      mealId: meal._id,
      day: 2, // Tuesday
      weekId: '2023-W10'
    });

    await Selection.create({
      userId: familyMember._id,
      mealId: meal._id,
      day: 2, // Tuesday
      weekId: '2023-W10'
    });

    // Get family selections for Tuesday
    const familySelections = await Selection.getFamilySelections(2, '2023-W10');

    // Check that both selections were returned
    expect(familySelections).toBeDefined();
    expect(familySelections.length).toBe(2);
    
    // Check that the selections have the correct properties
    familySelections.forEach(selection => {
      expect(selection.day).toBe(2);
      expect(selection.weekId).toBe('2023-W10');
      expect(selection.userId).toBeDefined();
      expect(selection.mealId).toBeDefined();
    });
  });

  it('should get the most popular meal for a specific day', async () => {
    // Create another meal
    const anotherMeal = await Meal.create({
      name: 'Another Meal',
      description: 'Another test meal',
      imageUrl: 'https://example.com/another-meal.jpg',
      tags: ['test', 'popular'],
      ingredients: ['ingredient 1', 'ingredient 2'],
      preparationSteps: ['step 1', 'step 2']
    });

    // Create another user
    const anotherUser = await User.create({
      name: 'Another User',
      email: 'another@example.com',
      password: 'password123',
      role: 'user'
    });

    // Create a third user
    const thirdUser = await User.create({
      name: 'Third User',
      email: 'third@example.com',
      password: 'password123',
      role: 'user'
    });

    // Create selections for Wednesday (day 3)
    // Two users select the first meal
    await Selection.create({
      userId: user._id,
      mealId: meal._id,
      day: 3,
      weekId: '2023-W10'
    });

    await Selection.create({
      userId: anotherUser._id,
      mealId: meal._id,
      day: 3,
      weekId: '2023-W10'
    });

    // One user selects the second meal
    await Selection.create({
      userId: thirdUser._id,
      mealId: anotherMeal._id,
      day: 3,
      weekId: '2023-W10'
    });

    // Get the most popular meal for Wednesday
    const popularMeal = await Selection.getPopularMeal(3, '2023-W10');

    // Check that the correct meal was returned
    expect(popularMeal).toBeDefined();
    expect(popularMeal.meal._id.toString()).toBe(meal._id.toString());
    expect(popularMeal.count).toBe(2);
  });
});