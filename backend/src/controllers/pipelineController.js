const Pipeline = require('../models/Pipeline');
const axios = require('axios');

/**
 * @route   GET /api/pipelines
 * @desc    Get all pipelines (Real GitHub Actions if token exists)
 * @access  Private
 */
exports.getPipelines = async (req, res) => {
    try {
        const githubToken = process.env.GITHUB_TOKEN;
        const githubRepo = process.env.GITHUB_REPOSITORY?.trim();

        if (githubToken && githubRepo) {
            console.log(`[GitHub API] Fetching workflow runs for: ${githubRepo}`);
            const response = await axios.get(`https://api.github.com/repos/${githubRepo}/actions/runs`, {
                headers: {
                    Authorization: `Bearer ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            const runs = response.data.workflow_runs.map(run => ({
                id: run.id,
                name: run.name,
                status: run.status === 'completed' ? (run.conclusion === 'success' ? 'success' : 'failed') : 'running',
                commit: run.head_commit?.message || 'No commit message',
                author: run.triggering_actor?.login || 'system',
                branch: run.head_branch,
                duration: run.run_started_at ? Math.round((new Date(run.updated_at) - new Date(run.run_started_at)) / 1000) : 0,
                createdAt: run.run_started_at,
                url: run.html_url,
                isReal: true
            }));

            return res.json({ success: true, data: runs });
        }

        console.warn('[GitHub API] Missing GITHUB_TOKEN or GITHUB_REPOSITORY. Falling back to DB.');
        const pipelines = await Pipeline.find().sort({ createdAt: -1 }).limit(20);
        res.json({ success: true, data: pipelines });
    } catch (error) {
        console.error('[GitHub API Error]', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching pipelines from GitHub',
            error: error.response?.data?.message || error.message
        });
    }
};

/**
 * @route   GET /api/pipelines/stats
 * @desc    Get real pipeline statistics
 * @access  Private
 */
exports.getPipelineStats = async (req, res) => {
    try {
        const githubToken = process.env.GITHUB_TOKEN;
        const githubRepo = process.env.GITHUB_REPOSITORY?.trim();

        if (githubToken && githubRepo) {
            const response = await axios.get(`https://api.github.com/repos/${githubRepo}/actions/runs?per_page=50`, {
                headers: { Authorization: `Bearer ${githubToken}` }
            });

            const runs = response.data.workflow_runs;
            const total = runs.length;
            const successCount = runs.filter(r => r.conclusion === 'success').length;
            const successRate = total > 0 ? ((successCount / total) * 100).toFixed(1) : 0;

            return res.json({
                success: true,
                data: {
                    totalPipelines: total,
                    successRate,
                    total: total,
                    success: successCount,
                    failed: total - successCount
                }
            });
        }

        const pipelines = await Pipeline.find().sort({ createdAt: -1 }).limit(100);
        const total = pipelines.length;
        const successCount = pipelines.filter(p => p.status === 'success').length;
        const successRate = total > 0 ? ((successCount / total) * 100).toFixed(1) : 0;

        res.json({
            success: true,
            data: {
                totalPipelines: total,
                successRate,
                total: total,
                success: successCount,
                failed: total - successCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @route   POST /api/pipelines
 */
exports.createPipeline = async (req, res) => {
    res.status(501).json({ success: false, message: 'Pipeline triggering must be configured via GitHub Actions' });
};

/**
 * @route   PUT /api/pipelines/:id
 */
exports.updatePipeline = async (req, res) => {
    res.status(501).json({ success: false, message: 'Updates are handled automatically via GitHub hooks' });
};
