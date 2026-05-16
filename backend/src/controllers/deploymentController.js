// ─────────────────────────────────────────────────
// Deployment Controller
// Handles CRUD operations for deployments
// ─────────────────────────────────────────────────

const Deployment = require('../models/Deployment');

/**
 * @route   GET /api/deployments
 * @desc    Get all deployments with pagination
 * @access  Private
 */
exports.getDeployments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const deployments = await Deployment.find()
            .populate('deployedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Deployment.countDocuments();

        res.json({
            success: true,
            data: deployments,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching deployments',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/deployments
 * @desc    Create a new deployment
 * @access  Private
 */
exports.createDeployment = async (req, res) => {
    try {
        const deployment = await Deployment.create({
            ...req.body,
            deployedBy: req.user.id
        });

        res.status(201).json({
            success: true,
            data: deployment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating deployment',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/deployments/stats
 * @desc    Get deployment statistics
 * @access  Private
 */
exports.getDeploymentStats = async (req, res) => {
    try {
        const stats = await Deployment.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get recent deployments (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentDeployments = await Deployment.find({
            createdAt: { $gte: sevenDaysAgo }
        })
            .populate('deployedBy', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        // Environment breakdown
        const envBreakdown = await Deployment.aggregate([
            {
                $group: {
                    _id: '$environment',
                    count: { $sum: 1 },
                    avgDuration: { $avg: '$duration' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                statusBreakdown: stats,
                recentDeployments,
                environmentBreakdown: envBreakdown
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching deployment stats',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/deployments/:id/status
 * @desc    Update deployment status
 * @access  Private
 */
exports.updateDeploymentStatus = async (req, res) => {
    try {
        const deployment = await Deployment.findByIdAndUpdate(
            req.params.id,
            {
                status: req.body.status,
                $push: {
                    logs: {
                        message: `Status changed to ${req.body.status}`,
                        level: req.body.status === 'failed' ? 'error' : 'info'
                    }
                }
            },
            { new: true, runValidators: true }
        );

        if (!deployment) {
            return res.status(404).json({
                success: false,
                message: 'Deployment not found'
            });
        }

        res.json({
            success: true,
            data: deployment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating deployment',
            error: error.message
        });
    }
};
