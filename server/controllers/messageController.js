const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

/**
 * Get all conversations for current user
 */
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name avatar city')
      .populate('listing', 'title images estimatedSwapValue category')
      .populate('swapRequest', 'status requesterItemValue recipientItemValue exchangeMethod')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    console.error('getConversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversations.',
    });
  }
};

/**
 * Get message history for a conversation
 */
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId).populate(
      'participants',
      'name avatar city'
    );

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p._id.toString() === req.user._id.toString()
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation.',
      });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark messages as read by current user
    await Message.updateMany(
      {
        conversation: conversationId,
        readBy: { $ne: req.user._id },
      },
      {
        $addToSet: { readBy: req.user._id },
      }
    );

    res.status(200).json({
      success: true,
      conversation,
      messages,
    });
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages.',
    });
  }
};

/**
 * Send a new message
 */
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, attachments } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty.' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to send messages in this conversation.',
      });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text: text.trim(),
      attachments: attachments || [],
      readBy: [req.user._id],
    });

    conversation.lastMessage = {
      text: text.trim(),
      sender: req.user._id,
      timestamp: new Date(),
    };
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'name avatar'
    );

    // If socket server is initialized, emit message
    const io = req.app.get('io');
    if (io) {
      io.to(conversationId).emit('new_message', populatedMessage);
    }

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message.',
    });
  }
};

/**
 * Create or open existing conversation
 */
const startConversation = async (req, res) => {
  try {
    const { recipientId, listingId, swapRequestId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'Recipient is required.' });
    }

    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot chat with yourself.' });
    }

    let query = {
      participants: { $all: [req.user._id, recipientId] },
    };

    if (swapRequestId) {
      query.swapRequest = swapRequestId;
    }

    let conversation = await Conversation.findOne(query);

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
        listing: listingId || null,
        swapRequest: swapRequestId || null,
        lastMessage: {
          text: 'Conversation started.',
          sender: req.user._id,
          timestamp: new Date(),
        },
      });
    }

    const populated = await Conversation.findById(conversation._id)
      .populate('participants', 'name avatar city')
      .populate('listing', 'title images estimatedSwapValue')
      .populate('swapRequest', 'status');

    res.status(200).json({
      success: true,
      conversation: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to start conversation.' });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
};

