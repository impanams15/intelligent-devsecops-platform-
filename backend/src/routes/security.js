// ─────────────────────────────────────────────────
// Security Routes
// ─────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const {
    getScans,
    createScan,
    getSecurityStats
} = require('../controllers/securityController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/scans')
    .get(getScans)
    .post(createScan);

router.get('/stats', getSecurityStats);

module.exports = router;
