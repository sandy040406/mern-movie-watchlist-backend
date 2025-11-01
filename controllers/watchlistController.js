const Watchlist = require('../models/watchlistModel');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// --- Initialize Gemini client ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Get Watchlist
const getWatchlist = async (req, res) => {
  try {
    const watchlist = await Watchlist.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(watchlist);
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Add to Watchlist
const addToWatchlist = async (req, res) => {
  try {
    const { title, description, poster, genre, tmdbId } = req.body;

    if (!title || !tmdbId) {
      return res.status(400).json({ message: 'Please provide title and TMDb ID' });
    }

    const existing = await Watchlist.findOne({ user: req.user._id, tmdbId });
    if (existing) return res.status(400).json({ message: 'Movie already exists in your watchlist' });

    const movie = await Watchlist.create({
      user: req.user._id,
      title,
      description: description || '',
      poster: poster || '',
      genre: genre || [],
      tmdbId,
      watched: false,
    });

    res.status(201).json(movie);
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Update Watchlist
const updateWatchlist = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Watchlist.findById(id);
    if (!item) return res.status(404).json({ message: 'Movie not found' });
    if (item.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Unauthorized' });

    Object.assign(item, req.body);
    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    console.error('Update watchlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Delete from Watchlist
const deleteFromWatchlist = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Watchlist.findById(id);
    if (!item) return res.status(404).json({ message: 'Movie not found' });
    if (item.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Unauthorized' });

    await Watchlist.findByIdAndDelete(id);
    res.json({ message: 'Movie removed', id });
  } catch (error) {
    console.error('Delete watchlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Get AI Recommendations (using Gemini)
const getRecommendations = async (req, res) => {
  try {
    const { watchlist } = req.body;
    if (!watchlist || !watchlist.length)
      return res.status(400).json({ message: 'Watchlist is empty' });

    const movieTitles = watchlist.map(m => m.title).join(', ');
    console.log('🎬 Watchlist titles:', movieTitles);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      Based on the user's watchlist: ${movieTitles},
      recommend 5 similar movies the user might enjoy.
      For each movie, return a JSON object with "title", "genre", and "reason".
      Return only valid JSON array (no markdown or text outside JSON).
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 🔹 Normalize and parse safely
    const cleanedText = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    let recommendations = [];
    try {
      const jsonMatch = cleanedText.match(/\[.*\]/s);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return res.status(500).json({
        message: 'Invalid AI response',
        rawOutput: cleanedText,
      });
    }

    console.log('✅ Parsed recommendations:', recommendations);
    res.json({ recommendations });
  } catch (error) {
    console.error('❌ Error fetching recommendations:', error);
    res.status(500).json({ message: 'Failed to get recommendations' });
  }
};


module.exports = {
  getWatchlist,
  addToWatchlist,
  updateWatchlist,
  deleteFromWatchlist,
  getRecommendations,
};
