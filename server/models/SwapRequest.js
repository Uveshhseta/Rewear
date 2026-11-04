const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requestedListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClothingListing',
      required: true,
      index: true,
    },
    offeredListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClothingListing',
      required: true,
      index: true,
    },
    requesterItemValue: {
      type: Number,
      required: true,
    },
    recipientItemValue: {
      type: Number,
      required: true,
    },
    valueDifference: {
      type: Number,
      required: true,
    },
    fairnessMatch: {
      type: String,
      enum: ['equitable', 'fair', 'variance'],
      default: 'equitable',
    },
    message: {
      type: String,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      default: 'Hi, I would love to swap this piece with you! Let me know if you are interested.',
    },
    exchangeMethod: {
      type: String,
      enum: ['in_person', 'courier'],
      default: 'in_person',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
      index: true,
    },
    meetingDetails: {
      locationName: { type: String, default: '' },
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      scheduledDate: { type: Date },
      notes: { type: String, default: '' },
    },
    courierDetails: {
      carrier: { type: String, default: '' },
      trackingNumber: { type: String, default: '' },
      status: {
        type: String,
        enum: ['not_dispatched', 'dispatched', 'in_transit', 'delivered'],
        default: 'not_dispatched',
      },
      dispatchedAt: { type: Date },
      notes: { type: String, default: '' },
    },
    completedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    statusHistory: [
      {
        status: { type: String },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SwapRequest', swapRequestSchema);

