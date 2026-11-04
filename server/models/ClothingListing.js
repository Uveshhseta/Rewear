const mongoose = require('mongoose');

const clothingListingSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A listing must have an owner'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide an item title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide an item description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['women', 'men', 'ethnic_wear', 'shoes', 'accessories', 'kids'],
      index: true,
    },
    gender: {
      type: String,
      enum: ['women', 'men', 'unisex', 'kids'],
      default: 'unisex',
    },
    brand: {
      type: String,
      trim: true,
      default: 'Unbranded / Artisan',
    },
    size: {
      type: String,
      required: [true, 'Please specify a size'],
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'Other'],
      index: true,
    },
    condition: {
      type: String,
      required: [true, 'Please specify the item condition'],
      enum: ['new_with_tags', 'like_new', 'good', 'fair'],
      index: true,
    },
    color: {
      type: String,
      trim: true,
      default: 'Various',
    },
    material: {
      type: String,
      trim: true,
      default: 'Cotton',
    },
    images: {
      type: [String],
      required: [true, 'Please upload at least one image'],
      validate: {
        validator: function (val) {
          return val && val.length > 0;
        },
        message: 'A listing must have at least one image',
      },
    },
    referencePrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
      default: 1500,
    },
    estimatedSwapValue: {
      type: Number,
      required: true,
      min: [50, 'Estimated swap value must be at least ₹50'],
      index: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide the city'],
      trim: true,
      index: true,
    },
    postalCode: {
      type: String,
      trim: true,
    },
    exchangePreference: {
      type: String,
      enum: ['in_person', 'courier', 'both'],
      default: 'both',
    },
    status: {
      type: String,
      enum: ['available', 'in_swap', 'swapped', 'hidden'],
      default: 'available',
      index: true,
    },
    moderationStatus: {
      type: String,
      enum: ['approved', 'flagged', 'removed'],
      default: 'approved',
      index: true,
    },
    moderationReason: {
      type: String,
      default: '',
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for search
clothingListingSchema.index({
  title: 'text',
  description: 'text',
  brand: 'text',
  color: 'text',
  material: 'text',
});

module.exports = mongoose.model('ClothingListing', clothingListingSchema);

