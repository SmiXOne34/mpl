// MongoDB initialization script
db = db.getSiblingDB('admin');

// Check if the root user already exists
const rootUser = db.getUser("root");
if (!rootUser) {
  // Create root user if it doesn't exist
  db.createUser({
    user: "root",
    pwd: "rootpassword",
    roles: [{ role: "root", db: "admin" }]
  });
}

// Switch to the application database
db = db.getSiblingDB('mealwise');

// Create application database user
try {
  db.createUser({
    user: "mealwiseuser",
    pwd: "mealwisepassword",
    roles: [{ role: "readWrite", db: "mealwise" }]
  });
} catch (error) {
  // User might already exist, which is fine
  print("Note: mealwiseuser may already exist");
}

// Create collections if they don't exist
db.createCollection("users");
db.createCollection("meals");
db.createCollection("mealplans");
db.createCollection("grocerylists");
db.createCollection("recipes");

print("MongoDB initialization completed successfully");