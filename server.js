import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";
import recommendationRoutes from "./routes/recommendRoutes.js";

dotenv.config();

const app = express();

// ✅ FIXED: Proper CORS setup for both dev and deployed frontend
app.use(
  cors({
    origin: [
      "http://localhost:5173", // for local development
      "https://mern-movie-watchlist-frontend-6i6yd9bhl.vercel.app", // your deployed frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight requests
app.options("*", cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/recommendations", recommendationRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("✅ Movie Watchlist Backend is running successfully!");
});

// Connect DB and start server
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error connecting to database:", err);
  });
