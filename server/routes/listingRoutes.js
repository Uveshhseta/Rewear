const express = require('express');
const router = express.Router();
const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  toggleWishlist,
  calculateValueLive,
  getFeaturedListings,
  getNearbyListings,
} = require('../controllers/listingController');
const { verifyToken, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', optionalAuth, getListings);
router.get('/featured', getFeaturedListings);
router.get('/nearby', optionalAuth, getNearbyListings);
router.post('/calculate-value', calculateValueLive);
router.get('/:id', optionalAuth, getListingById);

// Protected routes
router.post('/', verifyToken, upload.array('images', 6), createListing);
router.put('/:id', verifyToken, upload.array('images', 6), updateListing);
router.delete('/:id', verifyToken, deleteListing);
router.post('/:id/wishlist', verifyToken, toggleWishlist);

module.exports = router;

