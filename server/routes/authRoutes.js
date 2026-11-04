const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  loginAdmin,
  getMe,
  updateProfile,
  logout,
  forgotPassword,
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Customer routes
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/forgot-password', forgotPassword);

// Dedicated Admin login route
router.post('/admin/login', loginAdmin);

// Protected user routes
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.post('/logout', logout);

module.exports = router;

