const SwapRequest = require('../models/SwapRequest');
const ClothingListing = require('../models/ClothingListing');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { compareSwapValues } = require('../services/valueCalculator');

/**
 * Create a new Swap Request
 */
const createSwapRequest = async (req, res) => {
  try {
    const { requestedListingId, offeredListingId, message, exchangeMethod } = req.body;

    if (!requestedListingId || !offeredListingId) {
      return res.status(400).json({
        success: false,
        message: 'Both the requested item and your offered item must be selected.',
      });
    }

    // 1. Fetch requested item
    const requestedItem = await ClothingListing.findById(requestedListingId);
    if (!requestedItem) {
      return res.status(404).json({ success: false, message: 'Requested item not found.' });
    }

    // 2. Prevent swapping own item
    if (requestedItem.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot request a swap on your own listing.',
      });
    }

    // 3. Verify requested item is available
    if (requestedItem.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: `This item is currently ${requestedItem.status} and not eligible for swap requests.`,
      });
    }

    // 4. Fetch offered item and verify ownership & availability
    const offeredItem = await ClothingListing.findById(offeredListingId);
    if (!offeredItem) {
      return res.status(404).json({ success: false, message: 'Offered item not found.' });
    }

    if (offeredItem.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only offer items from your own wardrobe.',
      });
    }

    if (offeredItem.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: `Your offered item is currently ${offeredItem.status} and cannot be proposed.`,
      });
    }

    // 5. Prevent duplicate active swap requests
    const existingActive = await SwapRequest.findOne({
      requestedListing: requestedListingId,
      offeredListing: offeredListingId,
      status: { $in: ['pending', 'accepted'] },
    });

    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: 'An active swap request already exists between these two items.',
      });
    }

    // 6. Compare values and assess fairness
    const comparison = compareSwapValues(
      offeredItem.estimatedSwapValue,
      requestedItem.estimatedSwapValue
    );

    // 7. Create Swap Request
    const swap = await SwapRequest.create({
      requester: req.user._id,
      recipient: requestedItem.owner,
      requestedListing: requestedItem._id,
      offeredListing: offeredItem._id,
      requesterItemValue: offeredItem.estimatedSwapValue,
      recipientItemValue: requestedItem.estimatedSwapValue,
      valueDifference: comparison.absoluteDifference,
      fairnessMatch: comparison.fairnessMatch,
      message: message || 'I would like to swap this item with you!',
      exchangeMethod: exchangeMethod || 'in_person',
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          changedBy: req.user._id,
          note: 'Swap request submitted by requester.',
          timestamp: new Date(),
        },
      ],
    });

    // 8. Auto-create or link a Conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, requestedItem.owner] },
      swapRequest: swap._id,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, requestedItem.owner],
        swapRequest: swap._id,
        listing: requestedItem._id,
        lastMessage: {
          text: message || `Requested swap: ${offeredItem.title} for ${requestedItem.title}`,
          sender: req.user._id,
          timestamp: new Date(),
        },
      });

      // Insert initial system message into conversation
      await Message.create({
        conversation: conversation._id,
        sender: req.user._id,
        text: message || `Hello! I submitted a swap request offering my "${offeredItem.title}" (est. ₹${offeredItem.estimatedSwapValue}) for your "${requestedItem.title}" (est. ₹${requestedItem.estimatedSwapValue}).`,
      });
    }

    const populatedSwap = await SwapRequest.findById(swap._id)
      .populate('requester', 'name avatar city')
      .populate('recipient', 'name avatar city')
      .populate('requestedListing')
      .populate('offeredListing');

    res.status(201).json({
      success: true,
      message: 'Swap request sent successfully!',
      swap: populatedSwap,
      conversationId: conversation._id,
      comparison,
    });
  } catch (error) {
    console.error('createSwapRequest error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit swap request.',
    });
  }
};

/**
 * Get User's Swap Requests
 */
const getMySwaps = async (req, res) => {
  try {
    const { type = 'all', status } = req.query;
    const userId = req.user._id;

    let query = {};

    if (type === 'incoming') {
      query.recipient = userId;
    } else if (type === 'outgoing') {
      query.requester = userId;
    } else {
      query.$or = [{ requester: userId }, { recipient: userId }];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const swaps = await SwapRequest.find(query)
      .populate('requester', 'name avatar city')
      .populate('recipient', 'name avatar city')
      .populate('requestedListing')
      .populate('offeredListing')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: swaps.length,
      swaps,
    });
  } catch (error) {
    console.error('getMySwaps error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve swap requests.',
    });
  }
};

/**
 * Get Single Swap Request Details
 */
const getSwapById = async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id)
      .populate('requester', 'name email avatar city bio phone')
      .populate('recipient', 'name email avatar city bio phone')
      .populate('requestedListing')
      .populate('offeredListing')
      .populate('statusHistory.changedBy', 'name');

    if (!swap) {
      return res.status(404).json({ success: false, message: 'Swap request not found.' });
    }

    const userId = req.user._id.toString();
    const isParticipant =
      swap.requester._id.toString() === userId || swap.recipient._id.toString() === userId;

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this swap request.',
      });
    }

    res.status(200).json({
      success: true,
      swap,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load swap details.' });
  }
};

/**
 * Accept Swap Request
 * Enforces race-condition locking and marks items as 'in_swap'
 */
const acceptSwapRequest = async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({ success: false, message: 'Swap request not found.' });
    }

    // Only recipient can accept
    if (swap.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient of this swap request can accept it.',
      });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept a swap that is currently ${swap.status}.`,
      });
    }

    // Check listings status again to prevent race condition
    const requestedItem = await ClothingListing.findById(swap.requestedListing);
    const offeredItem = await ClothingListing.findById(swap.offeredListing);

    if (!requestedItem || !offeredItem) {
      return res.status(400).json({
        success: false,
        message: 'One or both clothing listings are no longer available.',
      });
    }

    if (requestedItem.status !== 'available' || offeredItem.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'One of the items is already reserved or in another active swap.',
      });
    }

    // Update listings to 'in_swap' to prevent conflicting accepts
    requestedItem.status = 'in_swap';
    offeredItem.status = 'in_swap';
    await requestedItem.save();
    await offeredItem.save();

    // Update Swap Request
    swap.status = 'accepted';
    swap.statusHistory.push({
      status: 'accepted',
      changedBy: req.user._id,
      note: 'Swap accepted by item owner. Logistics negotiation active.',
      timestamp: new Date(),
    });
    await swap.save();

    // Auto-reject other conflicting pending requests for these items
    await SwapRequest.updateMany(
      {
        _id: { $ne: swap._id },
        status: 'pending',
        $or: [
          { requestedListing: { $in: [requestedItem._id, offeredItem._id] } },
          { offeredListing: { $in: [requestedItem._id, offeredItem._id] } },
        ],
      },
      {
        $set: { status: 'rejected' },
        $push: {
          statusHistory: {
            status: 'rejected',
            changedBy: req.user._id,
            note: 'System auto-rejected because item was accepted into another swap.',
            timestamp: new Date(),
          },
        },
      }
    );

    // Notify conversation
    const conversation = await Conversation.findOne({ swapRequest: swap._id });
    if (conversation) {
      await Message.create({
        conversation: conversation._id,
        sender: req.user._id,
        text: '🎉 Swap Accepted! Both items are now reserved. Let us finalize meeting or shipping details.',
      });
    }

    const populated = await SwapRequest.findById(swap._id)
      .populate('requester', 'name avatar city')
      .populate('recipient', 'name avatar city')
      .populate('requestedListing')
      .populate('offeredListing');

    res.status(200).json({
      success: true,
      message: 'Swap accepted! You can now coordinate handover or shipping with the other user.',
      swap: populated,
    });
  } catch (error) {
    console.error('acceptSwapRequest error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to accept swap request.',
    });
  }
};

/**
 * Reject Swap Request
 */
const rejectSwapRequest = async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({ success: false, message: 'Swap request not found.' });
    }

    if (swap.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient can reject this request.',
      });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a swap that is ${swap.status}.`,
      });
    }

    swap.status = 'rejected';
    swap.statusHistory.push({
      status: 'rejected',
      changedBy: req.user._id,
      note: req.body.note || 'Rejected by recipient.',
      timestamp: new Date(),
    });
    await swap.save();

    res.status(200).json({
      success: true,
      message: 'Swap request declined.',
      swap,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reject swap request.' });
  }
};

/**
 * Cancel Outgoing Swap Request
 */
const cancelSwapRequest = async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({ success: false, message: 'Swap request not found.' });
    }

    if (swap.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the requester can cancel their request.',
      });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a swap that is already ${swap.status}.`,
      });
    }

    swap.status = 'cancelled';
    swap.statusHistory.push({
      status: 'cancelled',
      changedBy: req.user._id,
      note: 'Cancelled by requester.',
      timestamp: new Date(),
    });
    await swap.save();

    res.status(200).json({
      success: true,
      message: 'Swap request cancelled.',
      swap,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel swap request.' });
  }
};

/**
 * Update Exchange Logistics (Meeting location or Courier details)
 */
const updateExchangeDetails = async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({ success: false, message: 'Swap request not found.' });
    }

    const userId = req.user._id.toString();
    if (swap.requester.toString() !== userId && swap.recipient.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized for this swap.' });
    }

    const { exchangeMethod, meetingDetails, courierDetails } = req.body;

    if (exchangeMethod) swap.exchangeMethod = exchangeMethod;
    if (meetingDetails) {
      swap.meetingDetails = { ...swap.meetingDetails, ...meetingDetails };
    }
    if (courierDetails) {
      swap.courierDetails = { ...swap.courierDetails, ...courierDetails };
    }

    await swap.save();

    res.status(200).json({
      success: true,
      message: 'Exchange logistics updated.',
      swap,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update exchange details.' });
  }
};

/**
 * Complete Swap
 * Marks items as 'swapped' once complete
 */
const completeSwap = async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({ success: false, message: 'Swap request not found.' });
    }

    const userId = req.user._id.toString();
    const isParticipant =
      swap.requester.toString() === userId || swap.recipient.toString() === userId;

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (swap.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Only an accepted swap can be marked as completed.',
      });
    }

    // Add user to completedBy if not present
    if (!swap.completedBy.some((id) => id.toString() === userId)) {
      swap.completedBy.push(req.user._id);
    }

    // Complete swap
    swap.status = 'completed';
    swap.statusHistory.push({
      status: 'completed',
      changedBy: req.user._id,
      note: 'Swap finalized and confirmed completed.',
      timestamp: new Date(),
    });

    await swap.save();

    // Mark both items as 'swapped'
    await ClothingListing.updateMany(
      { _id: { $in: [swap.requestedListing, swap.offeredListing] } },
      { $set: { status: 'swapped' } }
    );

    // Notify conversation
    const conversation = await Conversation.findOne({ swapRequest: swap._id });
    if (conversation) {
      await Message.create({
        conversation: conversation._id,
        sender: req.user._id,
        text: '✨ Swap marked as COMPLETED! Thank you for giving clothes a second life and championing sustainable fashion.',
      });
    }

    const populated = await SwapRequest.findById(swap._id)
      .populate('requester', 'name avatar city')
      .populate('recipient', 'name avatar city')
      .populate('requestedListing')
      .populate('offeredListing');

    res.status(200).json({
      success: true,
      message: 'Congratulations! Clothing exchange marked as completed.',
      swap: populated,
    });
  } catch (error) {
    console.error('completeSwap error:', error);
    res.status(500).json({ success: false, message: 'Failed to complete swap.' });
  }
};

module.exports = {
  createSwapRequest,
  getMySwaps,
  getSwapById,
  acceptSwapRequest,
  rejectSwapRequest,
  cancelSwapRequest,
  updateExchangeDetails,
  completeSwap,
};

