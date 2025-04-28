#!/bin/bash

# Production build script for MealWise Family

echo "Starting production build process..."

# Step 1: Clean up previous builds
echo "Cleaning up previous builds..."
rm -rf client/build
rm -rf node_modules
rm -rf client/node_modules

# Step 2: Install server dependencies (production only)
echo "Installing server dependencies (production only)..."
npm install --production

# Step 3: Build client
echo "Building client application..."
cd client
npm install --production=false
GENERATE_SOURCEMAP=false CI=false npm run build
cd ..

# Step 4: Create production package
echo "Creating production package..."
mkdir -p dist
cp -r server.js package.json package-lock.json .env.production routes models controllers middleware utils config dist/
cp -r client/build dist/client/
cp -r node_modules dist/

# Step 5: Create startup script
echo "Creating startup script..."
cat > dist/start.sh << 'EOF'
#!/bin/bash
export NODE_ENV=production
node server.js
EOF
chmod +x dist/start.sh

echo "Production build complete! The application is ready in the 'dist' directory."
echo "To start the application in production mode, run: cd dist && ./start.sh"