const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Import routes
let authRoutes, watchlistRoutes, recommendRoutes;
try {
  authRoutes = require('./routes/authRoutes');
  watchlistRoutes = require('./routes/watchlistRoutes');
  recommendRoutes = require('./routes/recommendRoutes');
  console.log('✅ Routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error);
  process.exit(1);
}

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:5173'], 
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Connect to database (non-blocking, won't prevent server from starting)
connectDB().catch((error) => {
  console.error('⚠️  Database connection failed, but server will continue...');
  console.error('   Make sure MONGO_URI is set in your .env file');
});

// Root route - API information
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Movie Watchlist API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        getCurrentUser: 'GET /api/auth/me (protected)',
      },
      watchlist: {
        getAll: 'GET /api/watchlist (protected)',
        add: 'POST /api/watchlist (protected)',
        update: 'PUT /api/watchlist/:id (protected)',
        delete: 'DELETE /api/watchlist/:id (protected)',
      },
      recommendations: {
        getRecommendations: 'POST /api/recommendations (protected)',
      },
      health: 'GET /api/health',
    },
    documentation: 'All protected routes require Bearer token in Authorization header',
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running', status: 'OK' });
});

// Routes - Register all route handlers
app.use('/api/auth', authRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/recommendations', recommendRoutes);

// Debug: Log registered routes
console.log('📋 Registered routes:');
console.log('  - POST /api/auth/register');
console.log('  - POST /api/auth/login');
console.log('  - GET /api/auth/me');
console.log('  - GET /api/watchlist');
console.log('  - POST /api/watchlist');
console.log('  - PUT /api/watchlist/:id');
console.log('  - DELETE /api/watchlist/:id');
console.log('  - POST /api/recommendations');

// 404 handler - Must be after all routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler middleware - Must be last, with 4 parameters
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;

