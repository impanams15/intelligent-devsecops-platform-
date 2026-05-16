// ─────────────────────────────────────────────────
// Metrics Controller
// Handles server health metrics and monitoring data
// ─────────────────────────────────────────────────

const ServerMetric = require('../models/ServerMetric');
const os = require('os');

/**
 * @route   GET /api/metrics/server
 * @desc    Get current server metrics (simulated or real)
 * @access  Private
 */
exports.getServerMetrics = async (req, res) => {
    try {
        // Get real system metrics from the server
        const cpuUsage = os.loadavg()[0]; // 1-minute load average
        const totalMem = Math.round(os.totalmem() / 1024 / 1024); // MB
        const freeMem = Math.round(os.freemem() / 1024 / 1024); // MB
        const usedMem = totalMem - freeMem;
        const uptime = os.uptime();

        // Simulate additional server data for the dashboard
        const servers = [
            {
                serverName: 'prod-api-01',
                hostname: 'api-prod-east-1.devsecops.io',
                status: 'healthy',
                cpu: { usage: Math.round(Math.random() * 40 + 20), cores: 8, temperature: Math.round(Math.random() * 20 + 45) },
                memory: { total: 16384, used: Math.round(Math.random() * 6000 + 6000), percentage: 0 },
                disk: { total: 500, used: Math.round(Math.random() * 150 + 180), percentage: 0 },
                network: { bytesIn: Math.round(Math.random() * 5000000), bytesOut: Math.round(Math.random() * 3000000), latency: Math.round(Math.random() * 20 + 5) },
                containers: { running: 12, stopped: 2, total: 14 },
                uptime: Math.round(Math.random() * 1000000 + 500000)
            },
            {
                serverName: 'prod-web-01',
                hostname: 'web-prod-east-1.devsecops.io',
                status: 'healthy',
                cpu: { usage: Math.round(Math.random() * 30 + 15), cores: 4, temperature: Math.round(Math.random() * 15 + 40) },
                memory: { total: 8192, used: Math.round(Math.random() * 3000 + 3000), percentage: 0 },
                disk: { total: 250, used: Math.round(Math.random() * 80 + 100), percentage: 0 },
                network: { bytesIn: Math.round(Math.random() * 8000000), bytesOut: Math.round(Math.random() * 6000000), latency: Math.round(Math.random() * 10 + 3) },
                containers: { running: 8, stopped: 1, total: 9 },
                uptime: Math.round(Math.random() * 800000 + 400000)
            },
            {
                serverName: 'prod-db-01',
                hostname: 'db-prod-east-1.devsecops.io',
                status: Math.random() > 0.8 ? 'warning' : 'healthy',
                cpu: { usage: Math.round(Math.random() * 50 + 30), cores: 16, temperature: Math.round(Math.random() * 25 + 50) },
                memory: { total: 32768, used: Math.round(Math.random() * 10000 + 18000), percentage: 0 },
                disk: { total: 1000, used: Math.round(Math.random() * 300 + 500), percentage: 0 },
                network: { bytesIn: Math.round(Math.random() * 3000000), bytesOut: Math.round(Math.random() * 2000000), latency: Math.round(Math.random() * 5 + 1) },
                containers: { running: 5, stopped: 0, total: 5 },
                uptime: Math.round(Math.random() * 2000000 + 1000000)
            },
            {
                serverName: 'staging-01',
                hostname: 'staging-east-1.devsecops.io',
                status: Math.random() > 0.9 ? 'critical' : 'healthy',
                cpu: { usage: Math.round(Math.random() * 60 + 10), cores: 4, temperature: Math.round(Math.random() * 20 + 40) },
                memory: { total: 8192, used: Math.round(Math.random() * 4000 + 2000), percentage: 0 },
                disk: { total: 200, used: Math.round(Math.random() * 60 + 80), percentage: 0 },
                network: { bytesIn: Math.round(Math.random() * 2000000), bytesOut: Math.round(Math.random() * 1000000), latency: Math.round(Math.random() * 30 + 10) },
                containers: { running: 6, stopped: 3, total: 9 },
                uptime: Math.round(Math.random() * 500000 + 100000)
            }
        ];

        // Calculate percentages
        servers.forEach(s => {
            s.memory.percentage = Math.round((s.memory.used / s.memory.total) * 100);
            s.disk.percentage = Math.round((s.disk.used / s.disk.total) * 100);
        });

        res.json({
            success: true,
            data: {
                host: {
                    hostname: os.hostname(),
                    platform: os.platform(),
                    cpuUsage: Math.round(cpuUsage * 100) / 100,
                    totalMemory: totalMem,
                    usedMemory: usedMem,
                    freeMemory: freeMem,
                    uptime
                },
                servers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching server metrics',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/metrics/history
 * @desc    Get historical metrics for charts
 * @access  Private
 */
exports.getMetricsHistory = async (req, res) => {
    try {
        // Generate simulated historical data for charts
        const hours = 24;
        const history = [];
        const now = new Date();

        for (let i = hours; i >= 0; i--) {
            const timestamp = new Date(now - i * 3600000);
            history.push({
                timestamp: timestamp.toISOString(),
                cpu: Math.round(Math.random() * 40 + 20),
                memory: Math.round(Math.random() * 30 + 50),
                disk: Math.round(Math.random() * 10 + 60),
                network: Math.round(Math.random() * 500 + 200),
                requests: Math.round(Math.random() * 1000 + 500),
                errors: Math.round(Math.random() * 20),
                latency: Math.round(Math.random() * 50 + 10)
            });
        }

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching metrics history',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/metrics/containers
 * @desc    Get container status information
 * @access  Private
 */
exports.getContainerStatus = async (req, res) => {
    try {
        // Simulated container data
        const containers = [
            { id: 'c1a2b3', name: 'frontend-app', image: 'devsecops/frontend:latest', status: 'running', cpu: '2.3%', memory: '128MB / 512MB', ports: '3000:3000', uptime: '3d 14h' },
            { id: 'd4e5f6', name: 'backend-api', image: 'devsecops/backend:latest', status: 'running', cpu: '5.1%', memory: '256MB / 1GB', ports: '5000:5000', uptime: '3d 14h' },
            { id: 'g7h8i9', name: 'mongodb', image: 'mongo:7', status: 'running', cpu: '3.8%', memory: '512MB / 2GB', ports: '27017:27017', uptime: '5d 2h' },
            { id: 'j1k2l3', name: 'redis-cache', image: 'redis:7-alpine', status: 'running', cpu: '0.5%', memory: '64MB / 256MB', ports: '6379:6379', uptime: '5d 2h' },
            { id: 'm4n5o6', name: 'nginx-proxy', image: 'nginx:alpine', status: 'running', cpu: '0.2%', memory: '32MB / 128MB', ports: '80:80, 443:443', uptime: '5d 2h' },
            { id: 'p7q8r9', name: 'prometheus', image: 'prom/prometheus:latest', status: 'running', cpu: '1.2%', memory: '256MB / 512MB', ports: '9090:9090', uptime: '3d 14h' },
            { id: 's1t2u3', name: 'grafana', image: 'grafana/grafana:latest', status: 'running', cpu: '0.8%', memory: '128MB / 512MB', ports: '3001:3000', uptime: '3d 14h' },
            { id: 'v4w5x6', name: 'ai-service', image: 'devsecops/ai:latest', status: 'running', cpu: '8.5%', memory: '512MB / 2GB', ports: '8000:8000', uptime: '2d 6h' },
            { id: 'y7z8a9', name: 'sonarqube', image: 'sonarqube:lts', status: 'stopped', cpu: '0%', memory: '0MB / 4GB', ports: '-', uptime: '-' },
        ];

        res.json({
            success: true,
            data: containers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching container status',
            error: error.message
        });
    }
};
