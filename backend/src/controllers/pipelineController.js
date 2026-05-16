// ─────────────────────────────────────────────────
// Pipeline Controller
// Handles CI/CD pipeline operations
// ─────────────────────────────────────────────────

const Pipeline = require('../models/Pipeline');

/**
 * @route   GET /api/pipelines
 * @desc    Get all pipelines
 * @access  Private
 */
exports.getPipelines = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const pipelines = await Pipeline.find()
            .populate('triggeredBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Pipeline.countDocuments();

        res.json({
            success: true,
            data: pipelines,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching pipelines',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/pipelines
 * @desc    Create a new pipeline run
 * @access  Private
 */
exports.createPipeline = async (req, res) => {
    try {
        const defaultStages = [
            { name: 'Checkout', status: 'pending' },
            { name: 'Install Dependencies', status: 'pending' },
            { name: 'Lint & Format', status: 'pending' },
            { name: 'Unit Tests', status: 'pending' },
            { name: 'Security Scan', status: 'pending' },
            { name: 'Build', status: 'pending' },
            { name: 'Deploy', status: 'pending' }
        ];

        const pipeline = await Pipeline.create({
            ...req.body,
            stages: req.body.stages || defaultStages,
            triggeredBy: req.user.id
        });

        res.status(201).json({
            success: true,
            data: pipeline
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating pipeline',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/pipelines/stats
 * @desc    Get pipeline statistics
 * @access  Private
 */
exports.getPipelineStats = async (req, res) => {
    try {
        const statusStats = await Pipeline.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    avgDuration: { $avg: '$duration' }
                }
            }
        ]);

        // Daily pipeline runs (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const dailyRuns = await Pipeline.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    total: { $sum: 1 },
                    success: {
                        $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
                    },
                    failed: {
                        $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const totalPipelines = await Pipeline.countDocuments();
        const successRate = await Pipeline.countDocuments({ status: 'success' });

        res.json({
            success: true,
            data: {
                statusBreakdown: statusStats,
                dailyRuns,
                totalPipelines,
                successRate: totalPipelines > 0
                    ? ((successRate / totalPipelines) * 100).toFixed(1)
                    : 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching pipeline stats',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/pipelines/:id
 * @desc    Update a pipeline
 * @access  Private
 */
exports.updatePipeline = async (req, res) => {
    try {
        const pipeline = await Pipeline.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!pipeline) {
            return res.status(404).json({
                success: false,
                message: 'Pipeline not found'
            });
        }

        res.json({ success: true, data: pipeline });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating pipeline',
            error: error.message
        });
    }
};
