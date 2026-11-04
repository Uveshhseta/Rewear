const express = require('express');
const router = express.Router();
const {
  getAdminMetrics,
  getAdminAnalytics,
  getAllUsers,
  toggleUserStatus,
  getAllListingsAdmin,
  moderateListing,
  getAllSwapsAdmin,
} = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Enforce both token verification and admin role check
router.use(verifyToken, verifyAdmin);

router.get('/metrics', getAdminMetrics);
router.get('/analytics', getAdminAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/status', toggleUserStatus);
router.get('/listings', getAllListingsAdmin);
router.put('/listings/:id/moderate', moderateListing);
router.get('/swaps', getAllSwapsAdmin);

module.exports = router;

