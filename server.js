const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Import routes safely
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

// Initialize Express app
const app = express();

// ---------------------------
// ✅ CORS Configuration
// ---------------------------
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://mern-movie-watchlist-frontend-9qx2mujxh.vercel.app', // your deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('❌ CORS blocked for origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Handle preflight requests
app.options('*', cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB
connectDB()
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((error) => {
    console.error('⚠️ Database connection failed. Make sure MONGO_URI is set in .env');
    console.error(error);
  });

// ---------------------------
// ✅ Root route (API info)
// ---------------------------
app.get('/', (req, res) => {
  res.status(200).json({
    message: '🎬 Movie Watchlist API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    status: 'running',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (protected)',
      },
      watchlist: {
        get: 'GET /api/watchlist (protected)',
        add: 'POST /api/watchlist (protected)',
        update: 'PUT /api/watchlist/:id (protected)',
        delete: 'DELETE /api/watchlist/:id (protected)',
      },
      recommendations: {
        get: 'POST /api/recommendations (protected)',
      },
    },
  });
});

// ---------------------------
// ✅ Health check route
// ---------------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running ✅', status: 'OK' });
});

// ---------------------------
// ✅ Route registrations
// ---------------------------
app.use('/api/auth', authRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/recommendations', recommendRoutes);

console.log('📋 Registered routes:');
console.log('  - POST /api/auth/register');
console.log('  - POST /api/auth/login');
console.log('  - GET /api/auth/me');
console.log('  - GET /api/watchlist');
console.log('  - POST /api/watchlist');
console.log('  - PUT /api/watchlist/:id');
console.log('  - DELETE /api/watchlist/:id');
console.log('  - POST /api/recommendations');

// ---------------------------
// ✅ 404 Handler
// ---------------------------
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ---------------------------
// ✅ Global Error Handler
// ---------------------------
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message);
  res.status(500).json({
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ---------------------------
// ✅ Start Server
// ---------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
