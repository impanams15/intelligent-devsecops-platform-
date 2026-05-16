// ─────────────────────────────────────────────────
// Server Metric Model
// Stores server health and performance metrics
// ─────────────────────────────────────────────────

const mongoose = require('mongoose');

const serverMetricSchema = new mongoose.Schema({
    serverName: {
        type: String,
        required: true
    },
    hostname: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['healthy', 'warning', 'critical', 'offline'],
        default: 'healthy'
    },
    cpu: {
        usage: { type: Number, default: 0 },     // percentage
        cores: { type: Number, default: 1 },
        temperature: { type: Number, default: 0 } // celsius
    },
    memory: {
        total: { type: Number, default: 0 },      // MB
        used: { type: Number, default: 0 },       // MB
        percentage: { type: Number, default: 0 }
    },
    disk: {
        total: { type: Number, default: 0 },      // GB
        used: { type: Number, default: 0 },       // GB
        percentage: { type: Number, default: 0 }
    },
    network: {
        bytesIn: { type: Number, default: 0 },
        bytesOut: { type: Number, default: 0 },
        latency: { type: Number, default: 0 }     // ms
    },
    containers: {
        running: { type: Number, default: 0 },
        stopped: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    uptime: {
        type: Number, // seconds
        default: 0
    }
}, {
    timestamps: true
});

// TTL index: auto-delete metrics older than 30 days
serverMetricSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('ServerMetric', serverMetricSchema);
