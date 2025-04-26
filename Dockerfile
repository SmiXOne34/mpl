FROM node:18-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget curl

WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY client/package*.json ./client/

# Copy .npmrc files
COPY .npmrc ./
COPY client/.npmrc ./client/

# Install dependencies
RUN npm install --legacy-peer-deps
RUN cd client && npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the React app
RUN cd client && npm run build

# Expose the port the app runs on
EXPOSE 9091

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 CMD wget -q --spider http://localhost:9091/api/health || exit 1

# Command to run the application
CMD ["node", "server.js"]