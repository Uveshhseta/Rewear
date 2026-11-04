const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  updateReportStatus,
} = require('../controllers/reportController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Customer or Admin can submit a report
router.post('/', verifyToken, createReport);

// Admin-only management
router.get('/', verifyToken, verifyAdmin, getReports);
router.put('/:id', verifyToken, verifyAdmin, updateReportStatus);

module.exports = router;

