// ─────────────────────────────────────────────────
// Alert Model
// Stores system alerts and notifications
// ─────────────────────────────────────────────────

const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Alert title is required']
    },
    message: {
        type: String,
        required: [true, 'Alert message is required']
    },
    type: {
        type: String,
        enum: ['security', 'performance', 'deployment', 'system', 'ai_detection'],
        required: true
    },
    severity: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low', 'info'],
        default: 'info'
    },
    source: {
        type: String, // e.g., 'trivy', 'prometheus', 'ai-service'
        default: 'system'
    },
    status: {
        type: String,
        enum: ['active', 'acknowledged', 'resolved', 'dismissed'],
        default: 'active'
    },
    channel: {
        type: String,
        enum: ['slack', 'email', 'telegram', 'dashboard', 'all'],
        default: 'dashboard'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    acknowledgedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: Date
}, {
    timestamps: true
});

alertSchema.index({ status: 1, severity: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
