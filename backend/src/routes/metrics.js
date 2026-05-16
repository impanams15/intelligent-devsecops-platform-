// ─────────────────────────────────────────────────
// Metrics Routes
// ─────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const {
    getServerMetrics,
    getMetricsHistory,
    getContainerStatus
} = require('../controllers/metricsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/server', getServerMetrics);
router.get('/history', getMetricsHistory);
router.get('/containers', getContainerStatus);

module.exports = router;
