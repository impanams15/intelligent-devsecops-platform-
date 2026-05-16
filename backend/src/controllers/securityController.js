// ─────────────────────────────────────────────────
// Security Controller
// Handles security scan operations
// ─────────────────────────────────────────────────

const SecurityScan = require('../models/SecurityScan');

/**
 * @route   GET /api/security/scans
 * @desc    Get all security scans
 * @access  Private
 */
exports.getScans = async (req, res) => {
    try {
        const scans = await SecurityScan.find()
            .populate('initiatedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({ success: true, data: scans });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching scans',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/security/scans
 * @desc    Create a new security scan
 * @access  Private
 */
exports.createScan = async (req, res) => {
    try {
        const scan = await SecurityScan.create({
            ...req.body,
            initiatedBy: req.user.id
        });

        res.status(201).json({ success: true, data: scan });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating scan',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/security/stats
 * @desc    Get security scan statistics
 * @access  Private
 */
exports.getSecurityStats = async (req, res) => {
    try {
        // Aggregate vulnerability counts
        const vulnStats = await SecurityScan.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: null,
                    totalScans: { $sum: 1 },
                    totalCritical: { $sum: '$summary.critical' },
                    totalHigh: { $sum: '$summary.high' },
                    totalMedium: { $sum: '$summary.medium' },
                    totalLow: { $sum: '$summary.low' },
                    totalVulnerabilities: { $sum: '$summary.total' }
                }
            }
        ]);

        // Scan type breakdown
        const typeBreakdown = await SecurityScan.aggregate([
            {
                $group: {
                    _id: '$scanType',
                    count: { $sum: 1 },
                    avgVulnerabilities: { $avg: '$summary.total' }
                }
            }
        ]);

        // Recent critical vulnerabilities
        const criticalVulns = await SecurityScan.find({
            'summary.critical': { $gt: 0 }
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('target scanType summary createdAt');

        res.json({
            success: true,
            data: {
                stats: vulnStats[0] || {
                    totalScans: 0,
                    totalCritical: 0,
                    totalHigh: 0,
                    totalMedium: 0,
                    totalLow: 0,
                    totalVulnerabilities: 0
                },
                typeBreakdown,
                criticalVulns
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching security stats',
            error: error.message
        });
    }
};
