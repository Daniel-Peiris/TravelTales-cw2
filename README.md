# TravelTales - A Global Journey Through Stories

A modern travel blogging platform built with React, Express.js, and Sequelize ORM, featuring real-time country data integration and social features.

## 🌟 Features

### Core Features

-   **User Authentication & Registration** - Secure JWT-based authentication
-   **Blog Post Management** - Full CRUD operations for travel stories
-   **Social Features** - Follow users, like/dislike posts, comment system
-   **Country Information** - Real-time country data with flags, currencies, and capitals
-   **Search & Filtering** - Find posts by country, author, or keywords
-   **Responsive Design** - Mobile-first design with Tailwind CSS

### Technical Features

-   **Modern Stack** - React 18, Express.js, Sequelize ORM
-   **Microservices** - Integrated Countries API from CW1
-   **Docker Support** - Full containerization with development/production configs
-   **Security** - Password hashing, JWT tokens, input validation, rate limiting
-   **Performance** - Optimized queries, caching, pagination

## 🏗️ Architecture

```
TravelTales/
├── client/                 # React frontend
├── server/                 # Express.js backend
├── countries-api/          # CW1 microservice
├── docker-compose.yml      # Production containers
├── docker-compose.dev.yml  # Development containers
└── README.md
```

## 🚀 Quick Start

### Prerequisites

-   Node.js 18+
-   Docker & Docker Compose (optional)
-   Git

### The application will be available at:

-   Frontend: http://localhost:5173
-   Backend API: http://localhost:3000
-   Countries API: http://localhost:5000

### Using Docker

```bash
npm run docker:prod
```

## 📁 Project Structure

### Backend (server/)

```
server/
├── models/           # Sequelize models
├── routes/           # Express routes
├── middleware/       # Authentication, validation
├── database/         # SQLite database
└── server.js         # Main application
```

### Frontend (client/)

```
client/
├── src/
│   ├── components/   # Reusable UI components
│   ├── pages/        # Page components
│   ├── contexts/     # React contexts
│   ├── services/     # API services
│   └── App.jsx       # Main application
├── public/           # Static assets
└── dist/             # Built application
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:client       # Start only frontend
npm run dev:server       # Start only backend

# Building
npm run build           # Build both frontend and backend
npm run build:client    # Build frontend only

# Docker
npm run docker:prod     # Start production containers
npm run docker:down     # Stop all containers

# Utilities
npm run clean          # Clean all node_modules and build files
npm run lint           # Lint frontend code
```

### API Endpoints

#### Authentication

-   `POST /api/auth/register` - Register new user
-   `POST /api/auth/login` - Login user
-   `GET /api/auth/me` - Get current user
-   `PUT /api/auth/profile` - Update profile

#### Blog Posts

-   `GET /api/blogs` - Get all blog posts (with filters)
-   `GET /api/blogs/:id` - Get single blog post
-   `POST /api/blogs` - Create new blog post
-   `PUT /api/blogs/:id` - Update blog post
-   `DELETE /api/blogs/:id` - Delete blog post
-   `POST /api/blogs/:id/like` - Like/unlike post
-   `POST /api/blogs/:id/comments` - Add comment

#### Users

-   `GET /api/users/:username` - Get user profile
-   `POST /api/users/:username/follow` - Follow/unfollow user
-   `GET /api/users/:username/followers` - Get user followers
-   `GET /api/users/:username/following` - Get user following

#### Countries

-   `GET /api/countries` - Get all countries
-   `GET /api/countries/:name` - Get country by name
-   `GET /api/countries/list/dropdown` - Get countries for dropdown

## 🛡️ Security Features

-   **Password Security** - bcryptjs with salt rounds
-   **JWT Authentication** - Secure token-based auth
-   **Input Validation** - express-validator for all inputs
-   **Rate Limiting** - Prevent spam and abuse
-   **SQL Injection Protection** - Parameterized queries
-   **XSS Prevention** - Input sanitization
-   **CORS Configuration** - Controlled cross-origin requests

## 🐳 Docker Configuration

### Development

```yaml
# Uses nodemon for hot reloading
# Mounts source code as volumes
# Separate containers for each service
```

### Production

```yaml
# Optimized builds
# Multi-stage Docker builds
# Health checks
# Restart policies
```

## 📊 Database Schema

### Users Table

-   id, username, email, password_hash
-   first_name, last_name, bio, profile_image
-   is_active, created_at, updated_at

### Blog Posts Table

-   id, title, content, country, visit_date
-   images (JSON), tags (JSON), is_published
-   likes_count, comments_count, user_id
-   created_at, updated_at

### Relationships

-   Users → Blog Posts (1:many)
-   Users → Likes (1:many)
-   Users → Comments (1:many)
-   Users → Follows (many:many)
-   Blog Posts → Likes (1:many)
-   Blog Posts → Comments (1:many)

## 🌍 Country Data Integration

The application integrates with Countries API microservice:

1. **Primary Source** - Countries API microservice
2. **Fallback** - Direct RestCountries API calls
3. **Caching** - React Query for client-side caching
4. **Error Handling** - Graceful fallbacks

## 📱 Frontend Features

### Modern React Patterns

-   **Hooks** - useState, useEffect, custom hooks
-   **Context API** - Global state management
-   **React Query** - Server state management
-   **React Router** - Client-side routing
-   **React Hook Form** - Form management

### UI/UX

-   **Responsive Design** - Mobile-first approach
-   **Loading States** - Skeleton loaders
-   **Error Boundaries** - Graceful error handling
-   **Toast Notifications** - User feedback
-   **Infinite Scroll** - Performance optimization

## 🚀 Deployment

### Manual Deployment

1. Build the application: `npm run build`
2. Set production environment variables
3. Start the server: `npm start`

### Docker Deployment

1. Configure production environment
2. Build containers: `docker-compose up --build`
3. Configure reverse proxy (nginx)
4. Set up SSL certificates

### Environment Variables

```bash
# Server
NODE_ENV=production
JWT_SECRET=production-jwt-secret
DATABASE_PATH=/app/database/traveltales.db
COUNTRIES_API_URL=http://countries-api:5000/api
COUNTRIES_API_KEY=production-api-key

# Client
VITE_API_URL=http://localhost:3000/api
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

