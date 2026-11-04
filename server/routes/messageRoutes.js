const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
} = require('../controllers/messageController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/conversations', getConversations);
router.post('/conversations', startConversation);
router.get('/conversations/:conversationId', getMessages);
router.post('/conversations/:conversationId', sendMessage);

module.exports = router;

