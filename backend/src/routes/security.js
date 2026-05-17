// ─────────────────────────────────────────────────
// Security Routes
// ─────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const {
    getScans,
    createScan,
    getSecurityStats,
    triggerRealScan
} = require('../controllers/securityController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/scan/live', triggerRealScan);

router.route('/scans')
    .get(getScans)
    .post(createScan);

router.get('/stats', getSecurityStats);

module.exports = router;
