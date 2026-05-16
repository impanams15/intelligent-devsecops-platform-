// ─────────────────────────────────────────────────
// Pipeline Model
// Represents CI/CD pipeline runs and stages
// ─────────────────────────────────────────────────

const mongoose = require('mongoose');

const stageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'running', 'success', 'failed', 'skipped'],
        default: 'pending'
    },
    duration: {
        type: Number, // seconds
        default: 0
    },
    startedAt: Date,
    completedAt: Date,
    logs: [String]
});

const pipelineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Pipeline name is required']
    },
    repository: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        default: 'main'
    },
    trigger: {
        type: String,
        enum: ['push', 'pull_request', 'manual', 'schedule'],
        default: 'push'
    },
    status: {
        type: String,
        enum: ['queued', 'running', 'success', 'failed', 'cancelled'],
        default: 'queued'
    },
    stages: [stageSchema],
    triggeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    commitMessage: String,
    commitHash: String,
    duration: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

pipelineSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Pipeline', pipelineSchema);
