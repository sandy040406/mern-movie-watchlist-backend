const express = require('express');
const router = express.Router();
const {
  getWatchlist,
  addToWatchlist,
  updateWatchlist,
  deleteFromWatchlist,
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.route('/').get(getWatchlist).post(addToWatchlist);
router.route('/:id').put(updateWatchlist).delete(deleteFromWatchlist);

module.exports = router;

