/**
 * Demo Data for MealWise Family application
 * This file contains sample data for testing and demonstration purposes
 */

// Import required modules
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./database');

// Import models
const User = require('./User');
const Meal = require('./Meal');
const Selection = require('./Selection');
const WeeklyMenu = require('./WeeklyMenu');

// Connect to database
connectDB();

// Create demo data
const createDemoData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Meal.deleteMany();
    await Selection.deleteMany();
    await WeeklyMenu.deleteMany();
    
    console.log('All existing data cleared');
    
    // Create users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('password123', 10);
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin'
    });
    
    const user1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: userPassword,
      role: 'chooser',
      preferences: ['vegetarian', 'spicy']
    });
    
    const user2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: userPassword,
      role: 'chooser',
      preferences: ['gluten-free']
    });
    
    const user3 = await User.create({
      name: 'Mike Johnson',
      email: 'mike@example.com',
      password: userPassword,
      role: 'viewer'
    });
    
    console.log('Users created');
    
    // Create meals
    const meal1 = await Meal.create({
      name: 'Spaghetti Bolognese',
      description: 'Classic Italian pasta dish with meat sauce',
      ingredients: [
        { name: 'Spaghetti', quantity: '500', unit: 'g' },
        { name: 'Ground Beef', quantity: '400', unit: 'g' },
        { name: 'Onion', quantity: '1', unit: 'medium' },
        { name: 'Garlic', quantity: '2', unit: 'cloves' },
        { name: 'Canned Tomatoes', quantity: '400', unit: 'g' },
        { name: 'Tomato Paste', quantity: '2', unit: 'tbsp' },
        { name: 'Olive Oil', quantity: '2', unit: 'tbsp' },
        { name: 'Salt', quantity: '1', unit: 'tsp' },
        { name: 'Pepper', quantity: '1/2', unit: 'tsp' },
        { name: 'Italian Herbs', quantity: '1', unit: 'tsp' }
      ],
      preparationSteps: [
        'Boil water and cook pasta according to package instructions',
        'Heat olive oil in a large pan over medium heat',
        'Add chopped onion and garlic, sauté until soft',
        'Add ground beef and cook until browned',
        'Add canned tomatoes, tomato paste, and herbs',
        'Simmer for 20 minutes',
        'Season with salt and pepper',
        'Serve sauce over cooked pasta'
      ],
      imageUrl: 'https://example.com/spaghetti.jpg',
      tags: ['italian', 'pasta', 'beef'],
      createdBy: admin._id
    });
    
    const meal2 = await Meal.create({
      name: 'Chicken Curry',
      description: 'Spicy Indian chicken curry with rice',
      ingredients: [
        { name: 'Chicken Breast', quantity: '500', unit: 'g' },
        { name: 'Onion', quantity: '1', unit: 'large' },
        { name: 'Garlic', quantity: '3', unit: 'cloves' },
        { name: 'Ginger', quantity: '1', unit: 'inch' },
        { name: 'Curry Powder', quantity: '2', unit: 'tbsp' },
        { name: 'Coconut Milk', quantity: '400', unit: 'ml' },
        { name: 'Tomatoes', quantity: '2', unit: 'medium' },
        { name: 'Vegetable Oil', quantity: '2', unit: 'tbsp' },
        { name: 'Salt', quantity: '1', unit: 'tsp' },
        { name: 'Rice', quantity: '300', unit: 'g' }
      ],
      preparationSteps: [
        'Dice chicken into bite-sized pieces',
        'Chop onion, garlic, and ginger',
        'Heat oil in a large pan over medium heat',
        'Add onion, garlic, and ginger, sauté until soft',
        'Add curry powder and stir for 1 minute',
        'Add chicken and cook until browned',
        'Add chopped tomatoes and coconut milk',
        'Simmer for 20 minutes',
        'Season with salt',
        'Serve with cooked rice'
      ],
      imageUrl: 'https://example.com/curry.jpg',
      tags: ['indian', 'spicy', 'chicken'],
      createdBy: admin._id
    });
    
    const meal3 = await Meal.create({
      name: 'Vegetable Stir Fry',
      description: 'Quick and healthy vegetable stir fry with tofu',
      ingredients: [
        { name: 'Tofu', quantity: '300', unit: 'g' },
        { name: 'Broccoli', quantity: '1', unit: 'head' },
        { name: 'Carrot', quantity: '2', unit: 'medium' },
        { name: 'Bell Pepper', quantity: '1', unit: 'medium' },
        { name: 'Soy Sauce', quantity: '3', unit: 'tbsp' },
        { name: 'Sesame Oil', quantity: '1', unit: 'tbsp' },
        { name: 'Garlic', quantity: '2', unit: 'cloves' },
        { name: 'Ginger', quantity: '1', unit: 'inch' },
        { name: 'Rice', quantity: '300', unit: 'g' }
      ],
      preparationSteps: [
        'Press tofu to remove excess water and cut into cubes',
        'Cut vegetables into bite-sized pieces',
        'Heat sesame oil in a wok or large pan',
        'Add minced garlic and ginger, stir for 30 seconds',
        'Add tofu and cook until golden',
        'Add vegetables and stir fry for 5-7 minutes',
        'Add soy sauce and stir to combine',
        'Serve over cooked rice'
      ],
      imageUrl: 'https://example.com/stirfry.jpg',
      tags: ['vegetarian', 'asian', 'healthy'],
      createdBy: admin._id
    });
    
    const meal4 = await Meal.create({
      name: 'Beef Tacos',
      description: 'Mexican style beef tacos with fresh toppings',
      ingredients: [
        { name: 'Ground Beef', quantity: '500', unit: 'g' },
        { name: 'Taco Seasoning', quantity: '1', unit: 'packet' },
        { name: 'Taco Shells', quantity: '12', unit: 'shells' },
        { name: 'Lettuce', quantity: '1', unit: 'head' },
        { name: 'Tomato', quantity: '2', unit: 'medium' },
        { name: 'Cheddar Cheese', quantity: '200', unit: 'g' },
        { name: 'Sour Cream', quantity: '200', unit: 'g' },
        { name: 'Avocado', quantity: '1', unit: 'medium' },
        { name: 'Onion', quantity: '1', unit: 'medium' }
      ],
      preparationSteps: [
        'Brown ground beef in a pan over medium heat',
        'Add taco seasoning and water according to packet instructions',
        'Simmer for 5-10 minutes',
        'Chop lettuce, tomato, and onion',
        'Grate cheese',
        'Slice avocado',
        'Heat taco shells according to package instructions',
        'Assemble tacos with beef and toppings'
      ],
      imageUrl: 'https://example.com/tacos.jpg',
      tags: ['mexican', 'beef', 'spicy'],
      createdBy: admin._id
    });
    
    const meal5 = await Meal.create({
      name: 'Grilled Salmon',
      description: 'Healthy grilled salmon with lemon and herbs',
      ingredients: [
        { name: 'Salmon Fillets', quantity: '4', unit: 'fillets' },
        { name: 'Lemon', quantity: '1', unit: 'medium' },
        { name: 'Olive Oil', quantity: '2', unit: 'tbsp' },
        { name: 'Garlic', quantity: '2', unit: 'cloves' },
        { name: 'Dill', quantity: '1', unit: 'tbsp' },
        { name: 'Salt', quantity: '1', unit: 'tsp' },
        { name: 'Pepper', quantity: '1/2', unit: 'tsp' },
        { name: 'Asparagus', quantity: '1', unit: 'bunch' }
      ],
      preparationSteps: [
        'Preheat grill to medium-high heat',
        'Mix olive oil, minced garlic, dill, salt, and pepper',
        'Brush salmon fillets with the mixture',
        'Slice lemon into rounds',
        'Place salmon on grill, skin side down',
        'Top with lemon slices',
        'Grill for 4-6 minutes per side',
        'Grill asparagus for 3-4 minutes',
        'Serve salmon with grilled asparagus'
      ],
      imageUrl: 'https://example.com/salmon.jpg',
      tags: ['seafood', 'healthy', 'gluten-free'],
      createdBy: admin._id
    });
    
    const meal6 = await Meal.create({
      name: 'Margherita Pizza',
      description: 'Classic Italian pizza with tomato, mozzarella, and basil',
      ingredients: [
        { name: 'Pizza Dough', quantity: '1', unit: 'ball' },
        { name: 'Tomato Sauce', quantity: '200', unit: 'g' },
        { name: 'Fresh Mozzarella', quantity: '200', unit: 'g' },
        { name: 'Fresh Basil', quantity: '1', unit: 'handful' },
        { name: 'Olive Oil', quantity: '1', unit: 'tbsp' },
        { name: 'Salt', quantity: '1/2', unit: 'tsp' }
      ],
      preparationSteps: [
        'Preheat oven to 475°F (245°C)',
        'Roll out pizza dough on a floured surface',
        'Transfer to a pizza stone or baking sheet',
        'Spread tomato sauce evenly over dough',
        'Tear mozzarella into pieces and distribute over sauce',
        'Bake for 10-12 minutes until crust is golden',
        'Remove from oven and top with fresh basil leaves',
        'Drizzle with olive oil and sprinkle with salt',
        'Slice and serve immediately'
      ],
      imageUrl: 'https://example.com/pizza.jpg',
      tags: ['italian', 'vegetarian', 'pizza'],
      createdBy: admin._id
    });
    
    const meal7 = await Meal.create({
      name: 'Beef Stew',
      description: 'Hearty beef stew with vegetables and potatoes',
      ingredients: [
        { name: 'Beef Chuck', quantity: '700', unit: 'g' },
        { name: 'Potatoes', quantity: '4', unit: 'medium' },
        { name: 'Carrots', quantity: '3', unit: 'medium' },
        { name: 'Onion', quantity: '1', unit: 'large' },
        { name: 'Garlic', quantity: '3', unit: 'cloves' },
        { name: 'Beef Broth', quantity: '1', unit: 'liter' },
        { name: 'Tomato Paste', quantity: '2', unit: 'tbsp' },
        { name: 'Flour', quantity: '3', unit: 'tbsp' },
        { name: 'Vegetable Oil', quantity: '2', unit: 'tbsp' },
        { name: 'Bay Leaves', quantity: '2', unit: 'leaves' },
        { name: 'Thyme', quantity: '1', unit: 'tsp' },
        { name: 'Salt', quantity: '1', unit: 'tsp' },
        { name: 'Pepper', quantity: '1/2', unit: 'tsp' }
      ],
      preparationSteps: [
        'Cut beef into 1-inch cubes',
        'Season beef with salt and pepper',
        'Heat oil in a large pot over medium-high heat',
        'Brown beef in batches and set aside',
        'Add chopped onion and garlic to the pot, sauté until soft',
        'Sprinkle flour over the onions and stir',
        'Slowly add beef broth while stirring',
        'Add tomato paste, bay leaves, and thyme',
        'Return beef to the pot and bring to a simmer',
        'Cover and cook on low heat for 1 hour',
        'Add chopped potatoes and carrots',
        'Cook for another 45 minutes until vegetables are tender',
        'Adjust seasoning and serve hot'
      ],
      imageUrl: 'https://example.com/stew.jpg',
      tags: ['beef', 'comfort-food', 'winter'],
      createdBy: admin._id
    });
    
    console.log('Meals created');
    
    // Create weekly menu
    const currentWeekId = WeeklyMenu.getCurrentWeekId();
    
    const weeklyMenu = await WeeklyMenu.create({
      weekId: currentWeekId,
      meals: [
        meal1._id,
        meal2._id,
        meal3._id,
        meal4._id,
        meal5._id,
        meal6._id,
        meal7._id
      ],
      createdBy: admin._id
    });
    
    console.log('Weekly menu created');
    
    // Create selections
    const today = new Date().getDay();
    
    await Selection.create({
      userId: user1._id,
      mealId: meal3._id, // Vegetable Stir Fry (matches preference: vegetarian)
      weekId: currentWeekId,
      day: today
    });
    
    await Selection.create({
      userId: user1._id,
      mealId: meal2._id, // Chicken Curry (matches preference: spicy)
      weekId: currentWeekId,
      day: today
    });
    
    await Selection.create({
      userId: user2._id,
      mealId: meal5._id, // Grilled Salmon (matches preference: gluten-free)
      weekId: currentWeekId,
      day: today
    });
    
    await Selection.create({
      userId: user2._id,
      mealId: meal3._id, // Vegetable Stir Fry
      weekId: currentWeekId,
      day: today
    });
    
    console.log('Selections created');
    
    console.log('Demo data created successfully');
    process.exit();
  } catch (error) {
    console.error('Error creating demo data:', error);
    process.exit(1);
  }
};

// Run the function
createDemoData();