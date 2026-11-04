const Report = require('../models/Report');
const ClothingListing = require('../models/ClothingListing');

/**
 * Submit a new report (Customer or Admin)
 */
const createReport = async (req, res) => {
  try {
    const { reportedUser, reportedListing, swapRequest, reason, description } = req.body;

    if (!reason || !description) {
      return res.status(400).json({
        success: false,
        message: 'Reason and detailed description are required to submit a report.',
      });
    }

    const report = await Report.create({
      reporter: req.user._id,
      reportedUser: reportedUser || null,
      reportedListing: reportedListing || null,
      swapRequest: swapRequest || null,
      reason,
      description,
      status: 'pending',
    });

    // If listing reported, mark its moderation status as flagged
    if (reportedListing) {
      await ClothingListing.findByIdAndUpdate(reportedListing, {
        moderationStatus: 'flagged',
        moderationReason: `Flagged by report: ${reason}`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our moderation team will investigate.',
      report,
    });
  } catch (error) {
    console.error('createReport error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit report.',
    });
  }
};

/**
 * Admin: Get all reports
 */
const getReports = async (req, res) => {
  try {
    const { status, reason, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (reason && reason !== 'all') query.reason = reason;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Report.countDocuments(query);

    const reports = await Report.find(query)
      .populate('reporter', 'name email avatar')
      .populate('reportedUser', 'name email avatar')
      .populate('reportedListing', 'title images estimatedSwapValue moderationStatus')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      reports,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reports.' });
  }
};

/**
 * Admin: Update Report Status & Add Resolution Notes
 */
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, actionOnListing } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    if (status) report.status = status;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;
    report.resolvedBy = req.user._id;

    await report.save();

    // Optional admin action on the listing directly
    if (report.reportedListing && actionOnListing) {
      if (actionOnListing === 'remove') {
        await ClothingListing.findByIdAndUpdate(report.reportedListing, {
          moderationStatus: 'removed',
          status: 'hidden',
          moderationReason: adminNotes || 'Removed due to community guideline violation.',
        });
      } else if (actionOnListing === 'approve') {
        await ClothingListing.findByIdAndUpdate(report.reportedListing, {
          moderationStatus: 'approved',
          status: 'available',
          moderationReason: '',
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Report updated successfully.',
      report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update report status.' });
  }
};

module.exports = {
  createReport,
  getReports,
  updateReportStatus,
};

