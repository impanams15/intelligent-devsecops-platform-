// ─────────────────────────────────────────────────
// Pipeline Routes
// ─────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const {
    getPipelines,
    createPipeline,
    getPipelineStats,
    updatePipeline
} = require('../controllers/pipelineController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getPipelines)
    .post(createPipeline);

router.get('/stats', getPipelineStats);
router.put('/:id', updatePipeline);

module.exports = router;
