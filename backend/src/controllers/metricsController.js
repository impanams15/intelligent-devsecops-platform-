// ─────────────────────────────────────────────────
// Metrics Controller
// Handles server health metrics and monitoring data
// ─────────────────────────────────────────────────

const ServerMetric = require('../models/ServerMetric');

/**
 * @route   GET /api/metrics/server
 * @desc    Get current server metrics (real)
 * @access  Private
 */
exports.getServerMetrics = async (req, res) => {
    try {
        const monitor = req.app.get('monitor');
        const stats = await monitor.getRealMetrics();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching server metrics',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/metrics/history
 * @desc    Get historical metrics for charts
 * @access  Private
 */
exports.getMetricsHistory = async (req, res) => {
    try {
        const metrics = await ServerMetric.find()
            .sort({ createdAt: -1 })
            .limit(100);

        const history = metrics.reverse().map(m => ({
            timestamp: m.timestamp || m.createdAt,
            cpu: m.cpu?.usage || 0,
            memory: m.memory?.percentage || 0,
            disk: m.disk?.percentage || 0,
            network: m.network?.rx || 0,
            containers: m.containers?.running || 0
        }));

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching metrics history',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/metrics/containers
 * @desc    Get real container status information
 * @access  Private
 */
exports.getContainerStatus = async (req, res) => {
    try {
        const monitor = req.app.get('monitor');
        const containers = await monitor.getContainerStats();

        res.json({
            success: true,
            data: containers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching real container status',
            error: error.message
        });
    }
};
