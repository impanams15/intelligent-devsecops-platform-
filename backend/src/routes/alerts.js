// ─────────────────────────────────────────────────
// Alert Routes
// ─────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const {
    getAlerts,
    createAlert,
    acknowledgeAlert,
    resolveAlert,
    getAlertStats
} = require('../controllers/alertController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getAlerts)
    .post(createAlert);

router.get('/stats', getAlertStats);
router.put('/:id/acknowledge', acknowledgeAlert);
router.put('/:id/resolve', resolveAlert);

module.exports = router;
