const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a movie title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    poster: {
      type: String,
      default: '',
    },
    genre: {
      type: [String],
      default: [],
    },
    tmdbId: {
      type: Number,
      required: [true, 'Please add TMDb ID'],
    },
    watched: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
watchlistSchema.index({ user: 1, tmdbId: 1 });

module.exports = mongoose.model('Watchlist', watchlistSchema);

