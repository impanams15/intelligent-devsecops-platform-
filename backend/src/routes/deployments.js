// ─────────────────────────────────────────────────
// Deployment Routes
// ─────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const {
    getDeployments,
    createDeployment,
    getDeploymentStats,
    updateDeploymentStatus
} = require('../controllers/deploymentController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
    .get(getDeployments)
    .post(createDeployment);

router.get('/stats', getDeploymentStats);
router.put('/:id/status', updateDeploymentStatus);

module.exports = router;
