// ─────────────────────────────────────────────────
// Security Scan Model
// Stores vulnerability scan results
// ─────────────────────────────────────────────────

const mongoose = require('mongoose');

const vulnerabilitySchema = new mongoose.Schema({
    id: String,
    title: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low', 'info'],
        required: true
    },
    description: String,
    package: String,
    version: String,
    fixedVersion: String,
    cveId: String,
    recommendation: String
});

const securityScanSchema = new mongoose.Schema({
    scanType: {
        type: String,
        enum: ['container', 'code', 'dependency', 'infrastructure'],
        required: true
    },
    target: {
        type: String,
        required: true // e.g., image name, repo name
    },
    status: {
        type: String,
        enum: ['running', 'completed', 'failed'],
        default: 'running'
    },
    vulnerabilities: [vulnerabilitySchema],
    summary: {
        critical: { type: Number, default: 0 },
        high: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        low: { type: Number, default: 0 },
        info: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    scanner: {
        type: String,
        enum: ['trivy', 'sonarqube', 'owasp', 'custom'],
        default: 'trivy'
    },
    initiatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    duration: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

securityScanSchema.index({ scanType: 1, createdAt: -1 });

module.exports = mongoose.model('SecurityScan', securityScanSchema);
