const express = require('express');
const router = express.Router();
const {
  createSwapRequest,
  getMySwaps,
  getSwapById,
  acceptSwapRequest,
  rejectSwapRequest,
  cancelSwapRequest,
  updateExchangeDetails,
  completeSwap,
} = require('../controllers/swapController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/', createSwapRequest);
router.get('/', getMySwaps);
router.get('/:id', getSwapById);
router.put('/:id/accept', acceptSwapRequest);
router.put('/:id/reject', rejectSwapRequest);
router.put('/:id/cancel', cancelSwapRequest);
router.put('/:id/exchange-details', updateExchangeDetails);
router.put('/:id/complete', completeSwap);

module.exports = router;

