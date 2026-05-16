// ─────────────────────────────────────────────────
// Deployment Model
// Tracks deployment history and status
// ─────────────────────────────────────────────────

const mongoose = require('mongoose');

const deploymentSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true
    },
    environment: {
        type: String,
        enum: ['development', 'staging', 'production'],
        required: true
    },
    version: {
        type: String,
        required: [true, 'Version is required']
    },
    status: {
        type: String,
        enum: ['pending', 'building', 'deploying', 'success', 'failed', 'rolled_back'],
        default: 'pending'
    },
    branch: {
        type: String,
        default: 'main'
    },
    commitHash: {
        type: String,
        default: ''
    },
    deployedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    duration: {
        type: Number, // Duration in seconds
        default: 0
    },
    logs: [{
        timestamp: { type: Date, default: Date.now },
        message: String,
        level: { type: String, enum: ['info', 'warn', 'error'], default: 'info' }
    }],
    metadata: {
        dockerImage: String,
        replicas: { type: Number, default: 1 },
        namespace: { type: String, default: 'default' }
    }
}, {
    timestamps: true
});

// Index for faster queries
deploymentSchema.index({ status: 1, createdAt: -1 });
deploymentSchema.index({ projectName: 1, environment: 1 });

module.exports = mongoose.model('Deployment', deploymentSchema);
