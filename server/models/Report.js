const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reportedListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClothingListing',
    },
    swapRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SwapRequest',
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for the report'],
      enum: [
        'inappropriate_content',
        'counterfeit_or_fake',
        'misrepresented_condition',
        'unresponsive_user',
        'scam_or_harassment',
        'prohibited_item',
        'other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Please describe the issue in detail'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Report', reportSchema);

