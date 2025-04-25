# MealWise Family Deployment Guide

This guide provides instructions for deploying the MealWise Family application to various environments.

## Prerequisites

Before deploying, ensure you have the following:

- Node.js (v14.0.0 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- Git

## Environment Variables

The application requires the following environment variables:

```
# Server Configuration
NODE_ENV=production
PORT=5000

# MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Email Configuration (for password reset)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_EMAIL=noreply@example.com
SMTP_PASSWORD=your_email_password
FROM_EMAIL=noreply@example.com
FROM_NAME=MealWise Family

# Client URL (for CORS)
CLIENT_URL=https://your-domain.com
```

Create a `.env` file in the root directory with these variables before deployment.

## Local Deployment

### Backend

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/mealwise-family.git
   cd mealwise-family
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the required environment variables.

4. Start the server:
   ```bash
   npm start
   ```

   For development with hot reloading:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Heroku Deployment

### Prerequisites

- Heroku CLI installed
- Heroku account
- MongoDB Atlas account (or other MongoDB provider)

### Steps

1. Login to Heroku:
   ```bash
   heroku login
   ```

2. Create a new Heroku app:
   ```bash
   heroku create mealwise-family
   ```

3. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
   heroku config:set JWT_SECRET=your_jwt_secret_key
   heroku config:set JWT_EXPIRE=30d
   heroku config:set JWT_COOKIE_EXPIRE=30
   heroku config:set SMTP_HOST=smtp.example.com
   heroku config:set SMTP_PORT=587
   heroku config:set SMTP_EMAIL=noreply@example.com
   heroku config:set SMTP_PASSWORD=your_email_password
   heroku config:set FROM_EMAIL=noreply@example.com
   heroku config:set FROM_NAME="MealWise Family"
   heroku config:set CLIENT_URL=https://your-heroku-app.herokuapp.com
   ```

4. Add the Heroku remote:
   ```bash
   heroku git:remote -a mealwise-family
   ```

5. Push to Heroku:
   ```bash
   git push heroku main
   ```

6. Open the deployed application:
   ```bash
   heroku open
   ```

## Docker Deployment

### Prerequisites

- Docker installed
- Docker Compose installed (optional, for local deployment)

### Local Docker Deployment

1. Create a `docker-compose.yml` file in the root directory:
   ```yaml
   version: '3'
   services:
     app:
       build: .
       ports:
         - "5000:5000"
       environment:
         - NODE_ENV=production
         - PORT=5000
         - MONGO_URI=mongodb://mongo:27017/mealwise
         - JWT_SECRET=your_jwt_secret_key
         - JWT_EXPIRE=30d
         - JWT_COOKIE_EXPIRE=30
         - CLIENT_URL=http://localhost:5000
       depends_on:
         - mongo
     mongo:
       image: mongo
       ports:
         - "27017:27017"
       volumes:
         - mongo-data:/data/db
   volumes:
     mongo-data:
   ```

2. Create a `Dockerfile` in the root directory:
   ```dockerfile
   FROM node:14-alpine

   WORKDIR /usr/src/app

   COPY package*.json ./
   RUN npm install

   COPY . .

   RUN npm run build --prefix client

   EXPOSE 5000

   CMD ["npm", "start"]
   ```

3. Build and run the containers:
   ```bash
   docker-compose up --build
   ```

4. Access the application at `http://localhost:5000`

### Production Docker Deployment

For production deployment with Docker, you can use services like:

- AWS ECS (Elastic Container Service)
- Google Cloud Run
- Azure Container Instances
- Kubernetes

The specific steps will depend on your chosen platform, but generally:

1. Build the Docker image:
   ```bash
   docker build -t mealwise-family:latest .
   ```

2. Tag the image for your container registry:
   ```bash
   docker tag mealwise-family:latest your-registry/mealwise-family:latest
   ```

3. Push the image to your container registry:
   ```bash
   docker push your-registry/mealwise-family:latest
   ```

4. Deploy the image using your platform's deployment tools, ensuring you set all required environment variables.

## AWS Deployment

### Prerequisites

- AWS account
- AWS CLI installed and configured
- MongoDB Atlas account (or other MongoDB provider)

### Elastic Beanstalk Deployment

1. Install the EB CLI:
   ```bash
   pip install awsebcli
   ```

2. Initialize EB application:
   ```bash
   eb init mealwise-family --platform node.js --region us-east-1
   ```

3. Create an environment:
   ```bash
   eb create production
   ```

4. Set environment variables:
   ```bash
   eb setenv NODE_ENV=production MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname> JWT_SECRET=your_jwt_secret_key JWT_EXPIRE=30d JWT_COOKIE_EXPIRE=30 CLIENT_URL=https://your-eb-url.elasticbeanstalk.com
   ```

5. Deploy the application:
   ```bash
   eb deploy
   ```

6. Open the application:
   ```bash
   eb open
   ```

## Database Setup

### MongoDB Atlas

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create a database user with read/write privileges
4. Whitelist your IP address or set it to allow access from anywhere (0.0.0.0/0)
5. Get your connection string and replace `<username>`, `<password>`, `<cluster>`, and `<dbname>` with your values

### Seeding Demo Data

The application includes a script to seed demo data:

```bash
npm run demo
```

This will create:
- Sample users with different roles
- Sample meals with images and tags
- Sample weekly menu
- Sample selections

## SSL Configuration

For production deployments, always use HTTPS:

### Heroku

SSL is automatically enabled for all Heroku apps with the `*.herokuapp.com` domain.

### Custom Domain with Let's Encrypt

1. Install Certbot: https://certbot.eff.org/
2. Obtain SSL certificates:
   ```bash
   certbot certonly --standalone -d your-domain.com
   ```
3. Configure your web server (Nginx, Apache) to use the certificates

## Monitoring and Logging

### Application Logs

- Heroku: `heroku logs --tail`
- AWS EB: `eb logs`
- Docker: `docker logs <container_id>`

### Performance Monitoring

Consider integrating with:
- New Relic
- Datadog
- AWS CloudWatch
- Prometheus + Grafana

## Backup and Recovery

### Database Backup

For MongoDB Atlas:
1. Go to your cluster
2. Click "Backup"
3. Configure automated backups or create manual snapshots

### Application Backup

Regularly backup:
- Environment variables
- Custom configurations
- Uploaded images (if not using a cloud storage service)

## Scaling

### Horizontal Scaling

- Heroku: Increase dynos
  ```bash
  heroku ps:scale web=3
  ```

- AWS EB: Configure auto-scaling in the EB console

### Vertical Scaling

- Heroku: Upgrade to a larger dyno type
- AWS EB: Choose a larger instance type

## Troubleshooting

### Common Deployment Issues

1. **Connection to MongoDB fails**:
   - Check if the MongoDB URI is correct
   - Ensure IP whitelist includes your server's IP
   - Verify database user credentials

2. **Application crashes on startup**:
   - Check environment variables
   - Verify Node.js version compatibility
   - Check for syntax errors in the code

3. **Frontend not loading**:
   - Ensure the build process completed successfully
   - Check if static files are being served correctly
   - Verify CORS settings if using separate frontend/backend servers

4. **Socket.IO connection issues**:
   - Check if the client URL is correctly set
   - Ensure proxy settings are configured correctly
   - Verify that WebSocket connections are allowed by your hosting provider

## Continuous Integration/Deployment

### GitHub Actions

Create a `.github/workflows/deploy.yml` file:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '14'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "mealwise-family"
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
```

## Security Considerations

1. **Keep dependencies updated**:
   ```bash
   npm audit
   npm update
   ```

2. **Secure environment variables**:
   - Never commit `.env` files to version control
   - Use secrets management in your deployment platform

3. **Implement rate limiting**:
   - The application includes rate limiting middleware
   - Adjust the limits based on your expected traffic

4. **Regular security audits**:
   - Run security scanning tools
   - Review access controls
   - Monitor for unusual activity

## Support and Maintenance

For ongoing support and maintenance:

1. **Regular updates**:
   - Keep Node.js updated
   - Update npm packages
   - Apply security patches

2. **Monitoring**:
   - Set up alerts for application errors
   - Monitor server resources
   - Track user activity and performance metrics

3. **Backup strategy**:
   - Regular database backups
   - Automated backup testing
   - Disaster recovery plan

For additional support, contact the development team at dev@mealwise-family.com.