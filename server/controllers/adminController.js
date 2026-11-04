const User = require('../models/User');
const ClothingListing = require('../models/ClothingListing');
const SwapRequest = require('../models/SwapRequest');
const Report = require('../models/Report');

/**
 * Admin Dashboard Live Summary Metrics (MongoDB Live Counts)
 */
const getAdminMetrics = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalListings,
      availableListings,
      pendingSwaps,
      acceptedSwaps,
      completedSwaps,
      openReports,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'customer', status: 'active' }),
      ClothingListing.countDocuments(),
      ClothingListing.countDocuments({ status: 'available', moderationStatus: 'approved' }),
      SwapRequest.countDocuments({ status: 'pending' }),
      SwapRequest.countDocuments({ status: 'accepted' }),
      SwapRequest.countDocuments({ status: 'completed' }),
      Report.countDocuments({ status: { $in: ['pending', 'investigating'] } }),
    ]);

    // Calculate approximate environmental circular impact
    // 1 garment recirculated saves approx 2700 Litres of water and 3.6 kg of CO2
    const waterSavedLitres = completedSwaps * 2 * 2700;
    const co2SavedKg = Math.round(completedSwaps * 2 * 3.6 * 10) / 10;
    const itemsRecirculated = completedSwaps * 2;

    res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        activeUsers,
        totalListings,
        availableListings,
        pendingSwaps,
        acceptedSwaps,
        completedSwaps,
        openReports,
        environmentalImpact: {
          itemsRecirculated,
          waterSavedLitres,
          co2SavedKg,
        },
      },
    });
  } catch (error) {
    console.error('getAdminMetrics error:', error);
    res.status(500).json({ success: false, message: 'Failed to aggregate dashboard metrics.' });
  }
};

/**
 * Admin Platform Analytics (MongoDB Aggregation Pipelines)
 */
const getAdminAnalytics = async (req, res) => {
  try {
    // 1. Listings by Category Aggregation
    const categoryStats = await ClothingListing.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgValue: { $avg: '$estimatedSwapValue' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 2. Swaps by Status Funnel Aggregation
    const swapStatusStats = await SwapRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // 3. Condition Distribution
    const conditionStats = await ClothingListing.aggregate([
      {
        $group: {
          _id: '$condition',
          count: { $sum: 1 },
        },
      },
    ]);

    // 4. Monthly User Registrations (last 6 months)
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        categoryStats,
        swapStatusStats,
        conditionStats,
        userGrowth,
      },
    });
  } catch (error) {
    console.error('getAdminAnalytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to aggregate platform analytics.' });
  }
};

/**
 * Admin: Get All Users
 */
const getAllUsers = async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 15 } = req.query;

    const query = {};
    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.status = status;

    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { city: { $regex: term, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};

/**
 * Admin: Toggle User Account Suspension
 */
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot suspend their own account.',
      });
    }

    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account is now ${user.status}.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
};

/**
 * Admin: Get All Listings for Moderation
 */
const getAllListingsAdmin = async (req, res) => {
  try {
    const { search, category, moderationStatus, status, page = 1, limit = 15 } = req.query;

    const query = {};
    if (category && category !== 'all') query.category = category;
    if (moderationStatus && moderationStatus !== 'all') query.moderationStatus = moderationStatus;
    if (status && status !== 'all') query.status = status;

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { brand: { $regex: search.trim(), $options: 'i' } },
        { city: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await ClothingListing.countDocuments(query);
    const listings = await ClothingListing.find(query)
      .populate('owner', 'name email avatar city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      listings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load listings.' });
  }
};

/**
 * Admin: Moderate a Listing (Approve, Flag, Remove)
 */
const moderateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { moderationStatus, reason } = req.body;

    const listing = await ClothingListing.findById(id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (!['approved', 'flagged', 'removed'].includes(moderationStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid moderation status.' });
    }

    listing.moderationStatus = moderationStatus;
    listing.moderationReason = reason || (moderationStatus === 'approved' ? '' : 'Flagged by admin review');

    // If removed, set status to hidden
    if (moderationStatus === 'removed') {
      listing.status = 'hidden';
    } else if (moderationStatus === 'approved' && listing.status === 'hidden') {
      listing.status = 'available';
    }

    await listing.save();

    res.status(200).json({
      success: true,
      message: `Listing is now marked as ${moderationStatus}.`,
      listing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update moderation status.' });
  }
};

/**
 * Admin: Get All Swaps
 */
const getAllSwapsAdmin = async (req, res) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await SwapRequest.countDocuments(query);
    const swaps = await SwapRequest.find(query)
      .populate('requester', 'name email avatar city')
      .populate('recipient', 'name email avatar city')
      .populate('requestedListing', 'title images estimatedSwapValue')
      .populate('offeredListing', 'title images estimatedSwapValue')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      swaps,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load swaps.' });
  }
};

module.exports = {
  getAdminMetrics,
  getAdminAnalytics,
  getAllUsers,
  toggleUserStatus,
  getAllListingsAdmin,
  moderateListing,
  getAllSwapsAdmin,
};

