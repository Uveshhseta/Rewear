const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const TOKEN_EXPIRY = '7d';

// Generate Token & set HttpOnly cookie
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.__v;

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    message,
    token,
    user: userObj,
  });
};

/**
 * Register Customer
 * Enforces role: 'customer' strictly.
 */
const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, city, postalCode, phone, bio } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // Role is strictly forced to 'customer'
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'customer',
      city: city || 'Mumbai',
      postalCode: postalCode || '',
      phone: phone || '',
      bio: bio || 'Fashion lover swapping clothes to promote circular style.',
    });

    sendTokenResponse(user, 201, res, 'Customer account registered successfully.');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.',
    });
  }
};

/**
 * Customer Login
 */
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by an administrator.',
      });
    }

    sendTokenResponse(user, 200, res, 'Logged in successfully.');
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during customer login.',
    });
  }
};

/**
 * Dedicated Admin Login
 * Strictly checks role === 'admin'
 */
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide administrator credentials.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.',
      });
    }

    // Role validation
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have administrative authorization.',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'This administrative account is suspended.',
      });
    }

    sendTokenResponse(user, 200, res, 'Administrative session established successfully.');
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during administrative authentication.',
    });
  }
};

/**
 * Get Current Authenticated User Profile
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'title category brand estimatedSwapValue images city status',
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile.',
    });
  }
};

/**
 * Update Profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name, bio, city, postalCode, phone, avatar } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (city) updates.city = city;
    if (postalCode !== undefined) updates.postalCode = postalCode;
    if (phone !== undefined) updates.phone = phone;
    if (avatar) updates.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile.',
    });
  }
};

/**
 * Logout
 */
const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * Forgot password handler (safe simulation with mock reset instructions)
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email.' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return safe message without leaking user existence
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, password recovery instructions have been sent.',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Password reset link sent to your registered email address (Demo simulated).',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing password reset.' });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  loginAdmin,
  getMe,
  updateProfile,
  logout,
  forgotPassword,
};

