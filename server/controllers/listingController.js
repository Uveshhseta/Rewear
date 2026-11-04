const ClothingListing = require('../models/ClothingListing');
const User = require('../models/User');
const { calculateItemSwapValue } = require('../services/valueCalculator');

/**
 * Get all listings with rich filtering, search, and pagination
 */
const getListings = async (req, res) => {
  try {
    const {
      search,
      category,
      gender,
      size,
      condition,
      brand,
      minVal,
      maxVal,
      city,
      postalCode,
      exchangePreference,
      sort,
      page = 1,
      limit = 12,
      owner,
      status,
    } = req.query;

    const query = {};

    // For public browse, default to available approved listings
    if (owner) {
      query.owner = owner;
      if (status) {
        query.status = status;
      }
    } else {
      query.moderationStatus = 'approved';
      if (status) {
        query.status = status;
      } else {
        query.status = { $in: ['available', 'in_swap'] };
      }
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Gender filter
    if (gender && gender !== 'all') {
      query.gender = gender;
    }

    // Size filter
    if (size && size !== 'all') {
      query.size = size;
    }

    // Condition filter
    if (condition && condition !== 'all') {
      query.condition = condition;
    }

    // Brand filter
    if (brand && brand !== 'all') {
      query.brand = { $regex: brand, $options: 'i' };
    }

    // Exchange preference
    if (exchangePreference && exchangePreference !== 'all') {
      query.exchangePreference = { $in: [exchangePreference, 'both'] };
    }

    // City filter
    if (city && city.trim() !== '') {
      query.city = { $regex: city.trim(), $options: 'i' };
    }

    // Postal code filter
    if (postalCode && postalCode.trim() !== '') {
      query.postalCode = postalCode.trim();
    }

    // Swap value range
    if (minVal || maxVal) {
      query.estimatedSwapValue = {};
      if (minVal) query.estimatedSwapValue.$gte = Number(minVal);
      if (maxVal) query.estimatedSwapValue.$lte = Number(maxVal);
    }

    // Text / regex search
    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { brand: { $regex: term, $options: 'i' } },
        { color: { $regex: term, $options: 'i' } },
        { material: { $regex: term, $options: 'i' } },
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'value_asc') sortOption = { estimatedSwapValue: 1 };
    else if (sort === 'value_desc') sortOption = { estimatedSwapValue: -1 };
    else if (sort === 'popular') sortOption = { viewsCount: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await ClothingListing.countDocuments(query);
    const listings = await ClothingListing.find(query)
      .populate('owner', 'name avatar city')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      listings,
    });
  } catch (error) {
    console.error('getListings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve listings.',
    });
  }
};

/**
 * Get single listing details with similar items
 */
const getListingById = async (req, res) => {
  try {
    const listing = await ClothingListing.findById(req.params.id).populate(
      'owner',
      'name email avatar city bio createdAt'
    );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Clothing listing not found.',
      });
    }

    // Increment views
    listing.viewsCount += 1;
    await listing.save();

    // Fetch similar items in the same category
    const similarListings = await ClothingListing.find({
      category: listing.category,
      _id: { $ne: listing._id },
      status: 'available',
      moderationStatus: 'approved',
    })
      .populate('owner', 'name avatar city')
      .limit(4);

    res.status(200).json({
      success: true,
      listing,
      similarListings,
    });
  } catch (error) {
    console.error('getListingById error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load listing details.',
    });
  }
};

/**
 * Create a new clothing listing
 */
const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      gender,
      brand,
      size,
      condition,
      color,
      material,
      referencePrice,
      estimatedSwapValue,
      city,
      postalCode,
      exchangePreference,
      imageUrls,
    } = req.body;

    if (!title || !description || !category || !size || !condition) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, size, and condition are required.',
      });
    }

    // Process uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = images.concat(req.files.map((file) => `/uploads/${file.filename}`));
    }
    if (imageUrls) {
      const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
      images = images.concat(urls.filter(Boolean));
    }

    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one photo of the clothing item.',
      });
    }

    // Calculate or validate estimated swap value
    let swapValue = Number(estimatedSwapValue);
    if (!swapValue || swapValue <= 0) {
      const calcResult = calculateItemSwapValue({
        referencePrice: Number(referencePrice) || 0,
        condition,
        category,
        brand,
      });
      swapValue = calcResult.estimatedSwapValue;
    }

    const listing = await ClothingListing.create({
      owner: req.user._id,
      title,
      description,
      category,
      gender: gender || 'unisex',
      brand: brand || 'Unbranded / Artisan',
      size,
      condition,
      color: color || 'Various',
      material: material || 'Cotton',
      images,
      referencePrice: Number(referencePrice) || 1500,
      estimatedSwapValue: swapValue,
      city: city || req.user.city || 'Mumbai',
      postalCode: postalCode || req.user.postalCode || '',
      exchangePreference: exchangePreference || 'both',
      status: 'available',
      moderationStatus: 'approved',
    });

    const populatedListing = await ClothingListing.findById(listing._id).populate(
      'owner',
      'name avatar city'
    );

    res.status(201).json({
      success: true,
      message: 'Item listed successfully on ReWear marketplace!',
      listing: populatedListing,
    });
  } catch (error) {
    console.error('createListing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create clothing listing.',
    });
  }
};

/**
 * Update an existing listing
 */
const updateListing = async (req, res) => {
  try {
    const listing = await ClothingListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found.',
      });
    }

    // Enforce ownership unless admin
    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this listing.',
      });
    }

    const {
      title,
      description,
      category,
      gender,
      brand,
      size,
      condition,
      color,
      material,
      referencePrice,
      estimatedSwapValue,
      city,
      postalCode,
      exchangePreference,
      status,
      imageUrls,
    } = req.body;

    if (title) listing.title = title;
    if (description) listing.description = description;
    if (category) listing.category = category;
    if (gender) listing.gender = gender;
    if (brand) listing.brand = brand;
    if (size) listing.size = size;
    if (condition) listing.condition = condition;
    if (color) listing.color = color;
    if (material) listing.material = material;
    if (city) listing.city = city;
    if (postalCode !== undefined) listing.postalCode = postalCode;
    if (exchangePreference) listing.exchangePreference = exchangePreference;
    if (status && ['available', 'in_swap', 'swapped', 'hidden'].includes(status)) {
      listing.status = status;
    }

    // Update images if new ones supplied
    if (req.files && req.files.length > 0) {
      listing.images = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (imageUrls && imageUrls.length > 0) {
      listing.images = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
    }

    if (referencePrice) listing.referencePrice = Number(referencePrice);
    if (estimatedSwapValue) {
      listing.estimatedSwapValue = Number(estimatedSwapValue);
    } else if (referencePrice || condition || category) {
      const calcResult = calculateItemSwapValue({
        referencePrice: listing.referencePrice,
        condition: listing.condition,
        category: listing.category,
        brand: listing.brand,
      });
      listing.estimatedSwapValue = calcResult.estimatedSwapValue;
    }

    await listing.save();

    const updated = await ClothingListing.findById(listing._id).populate('owner', 'name avatar city');

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully.',
      listing: updated,
    });
  } catch (error) {
    console.error('updateListing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update listing.',
    });
  }
};

/**
 * Delete listing
 */
const deleteListing = async (req, res) => {
  try {
    const listing = await ClothingListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found.',
      });
    }

    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete your own listings.',
      });
    }

    if (listing.status === 'in_swap') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an item actively involved in an ongoing accepted swap.',
      });
    }

    await ClothingListing.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete listing.',
    });
  }
};

/**
 * Toggle Wishlist
 */
const toggleWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    const isWishlisted = user.wishlist.some((item) => item.toString() === id);

    if (isWishlisted) {
      user.wishlist = user.wishlist.filter((item) => item.toString() !== id);
    } else {
      user.wishlist.push(id);
    }

    await user.save();

    res.status(200).json({
      success: true,
      isWishlisted: !isWishlisted,
      wishlist: user.wishlist,
      message: !isWishlisted ? 'Saved to your wishlist' : 'Removed from your wishlist',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update wishlist.',
    });
  }
};

/**
 * Calculate Swap Value live preview
 */
const calculateValueLive = (req, res) => {
  const { referencePrice, condition, category, brand } = req.body;
  const result = calculateItemSwapValue({ referencePrice, condition, category, brand });
  res.status(200).json({
    success: true,
    result,
  });
};

/**
 * Featured Listings for Homepage
 */
const getFeaturedListings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 16;
    const featured = await ClothingListing.find({
      status: 'available',
      moderationStatus: 'approved',
    })
      .populate('owner', 'name avatar city')
      .sort({ viewsCount: -1, createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      listings: featured,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch featured items.' });
  }
};

/**
 * Nearby Listings
 */
const getNearbyListings = async (req, res) => {
  try {
    const userCity = req.query.city || (req.user ? req.user.city : 'Mumbai');
    const nearby = await ClothingListing.find({
      city: { $regex: userCity, $options: 'i' },
      status: 'available',
      moderationStatus: 'approved',
    })
      .populate('owner', 'name avatar city')
      .limit(6);

    res.status(200).json({
      success: true,
      city: userCity,
      listings: nearby,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch nearby items.' });
  }
};

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  toggleWishlist,
  calculateValueLive,
  getFeaturedListings,
  getNearbyListings,
};

