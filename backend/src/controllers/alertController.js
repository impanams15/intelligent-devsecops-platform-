// ─────────────────────────────────────────────────
// Alert Controller
// Handles notifications and alert management
// ─────────────────────────────────────────────────

const Alert = require('../models/Alert');

/**
 * @route   GET /api/alerts
 * @desc    Get all alerts with filtering
 * @access  Private
 */
exports.getAlerts = async (req, res) => {
    try {
        const { status, severity, type } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (severity) filter.severity = severity;
        if (type) filter.type = type;

        const alerts = await Alert.find(filter)
            .populate('acknowledgedBy', 'name')
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Alert.countDocuments({ status: 'active' });

        res.json({
            success: true,
            data: alerts,
            unreadCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching alerts',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/alerts
 * @desc    Create a new alert
 * @access  Private
 */
exports.createAlert = async (req, res) => {
    try {
        const alert = await Alert.create(req.body);
        res.status(201).json({ success: true, data: alert });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating alert',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/alerts/:id/acknowledge
 * @desc    Acknowledge an alert
 * @access  Private
 */
exports.acknowledgeAlert = async (req, res) => {
    try {
        const alert = await Alert.findByIdAndUpdate(
            req.params.id,
            {
                status: 'acknowledged',
                acknowledgedBy: req.user.id
            },
            { new: true }
        );

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        res.json({ success: true, data: alert });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error acknowledging alert',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/alerts/:id/resolve
 * @desc    Resolve an alert
 * @access  Private
 */
exports.resolveAlert = async (req, res) => {
    try {
        const alert = await Alert.findByIdAndUpdate(
            req.params.id,
            {
                status: 'resolved',
                resolvedAt: new Date()
            },
            { new: true }
        );

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        res.json({ success: true, data: alert });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error resolving alert',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/alerts/stats
 * @desc    Get alert statistics
 * @access  Private
 */
exports.getAlertStats = async (req, res) => {
    try {
        const severityStats = await Alert.aggregate([
            {
                $group: {
                    _id: '$severity',
                    count: { $sum: 1 }
                }
            }
        ]);

        const typeStats = await Alert.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        const activeAlerts = await Alert.countDocuments({ status: 'active' });
        const totalAlerts = await Alert.countDocuments();

        res.json({
            success: true,
            data: {
                severityStats,
                typeStats,
                activeAlerts,
                totalAlerts
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching alert stats',
            error: error.message
        });
    }
};
