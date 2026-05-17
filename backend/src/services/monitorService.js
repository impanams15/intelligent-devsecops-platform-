const si = require('systeminformation');
const os = require('os');
const Docker = require('dockerode');
const promClient = require('prom-client');
const axios = require('axios');
const ServerMetric = require('../models/ServerMetric');

// Initialize Docker
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// Initialize Prometheus Registry
const registry = new promClient.Registry();
promClient.collectDefaultMetrics({ register: registry });

// Define Custom Metrics
const cpuGauge = new promClient.Gauge({
    name: 'system_cpu_usage_percentage',
    help: 'Current CPU usage in percentage',
    registers: [registry]
});

const memGauge = new promClient.Gauge({
    name: 'system_memory_usage_percentage',
    help: 'Current memory usage in percentage',
    registers: [registry]
});

class MonitorService {
    constructor(io) {
        this.io = io;
        this.previousStats = null;
        this.startMonitoring();
    }

    async startMonitoring() {
        console.log('📡 Real-time Monitor Service Started');

        // Loop every 5 seconds for dashboard updates
        setInterval(async () => {
            const stats = await this.getRealMetrics();
            if (!stats) return;

            // 1. Broadcast to all connected clients via Socket.io
            if (this.io) {
                this.io.emit('metrics_update', stats);
            }

            // 2. Send to AI Service for Anomaly Detection
            try {
                const aiUrl = process.env.AI_SERVICE_URL || 'http://ai-service:8000';

                // CPU Analysis
                const aiRes = await axios.post(`${aiUrl}/api/detect/cpu`, { metrics: [stats.cpu.usage] });
                if (aiRes.data?.is_anomaly || (aiRes.data?.data?.anomalies && aiRes.data.data.anomalies.length > 0)) {
                    const Alert = require('../models/Alert');
                    const newAlert = await Alert.create({
                        title: 'AI Anomaly Detected',
                        message: `Unusual CPU pattern detected: ${stats.cpu.usage}% load`,
                        type: 'ai_detection',
                        severity: stats.cpu.usage > 90 ? 'critical' : 'high',
                        source: 'ai-service',
                        metadata: { usage: stats.cpu.usage }
                    });
                    this.io.emit('alert_new', newAlert);
                }

                // Traffic Analysis
                const trafficRequests = stats.network.rx + stats.network.tx;
                const trafficRes = await axios.post(`${aiUrl}/api/detect/traffic`, { trafficData: [trafficRequests] });
                if (trafficRes.data?.data?.anomalies && trafficRes.data.data.anomalies.length > 0) {
                    const Alert = require('../models/Alert');
                    const newAlert = await Alert.create({
                        title: 'Network Traffic Anomaly',
                        message: `Unusual network traffic spike: ${trafficRequests} KB/s`,
                        type: 'ai_detection',
                        severity: 'high',
                        source: 'ai-service'
                    });
                    this.io.emit('alert_new', newAlert);
                }

            } catch (err) {
                // Silently skip if AI service is down
            }

            // 2a. Real Container Crash Detection
            if (this.previousStats) {
                if (stats.containers.running < this.previousStats.containers.running) {
                    const Alert = require('../models/Alert');
                    const crashAlert = await Alert.create({
                        title: 'Container Crash Detected',
                        message: `A Docker container unexpectedly stopped or crashed! Running: ${stats.containers.running}/${stats.containers.total}`,
                        type: 'system',
                        severity: 'critical',
                        source: 'docker-engine'
                    });
                    this.io.emit('alert_new', crashAlert);
                }
            }
            this.previousStats = stats;

            // 2b. Basic Threshold Alerting
            if (stats.cpu.usage > 95 || stats.memory.percentage > 95) {
                const Alert = require('../models/Alert');
                const existing = await Alert.findOne({
                    title: 'System Resource Breach',
                    status: 'active',
                    createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Avoid spam
                });

                if (!existing) {
                    const breachAlert = await Alert.create({
                        title: 'System Resource Breach',
                        message: `Critical resource usage: CPU ${stats.cpu.usage}%, MEM ${stats.memory.percentage}%`,
                        type: 'system',
                        severity: 'critical',
                        source: 'monitor-service'
                    });
                    this.io.emit('alert_new', breachAlert);
                }
            }

            // 3. Update Prometheus Gauges
            cpuGauge.set(stats.cpu.usage);
            memGauge.set(stats.memory.percentage || 0);

            // 3. Save to History (every 15 seconds)
            const seconds = new Date().getSeconds();
            if (seconds === 0 || seconds === 15 || seconds === 30 || seconds === 45) {
                await this.saveStatsToDB(stats);
            }
        }, 5000);
    }

    async getRealMetrics() {
        try {
            const cpu = await si.currentLoad();
            const mem = await si.mem();
            const disk = await si.fsSize();
            const network = await si.networkStats();
            const containers = await docker.listContainers();

            return {
                timestamp: new Date(),
                hostname: os.hostname(),
                cpu: {
                    usage: Math.round(cpu.currentLoad),
                    cores: os.cpus().length,
                    temp: 0 // Temp requires admin/special drivers on some systems
                },
                memory: {
                    total: Math.round(mem.total / 1024 / 1024),
                    used: Math.round(mem.active / 1024 / 1024),
                    percentage: Math.round((mem.active / mem.total) * 100)
                },
                disk: {
                    total: disk && disk.length > 0 ? Math.round(disk[0].size / 1024 / 1024 / 1024) : 0,
                    used: disk && disk.length > 0 ? Math.round(disk[0].used / 1024 / 1024 / 1024) : 0,
                    percentage: disk && disk.length > 0 ? Math.round(disk[0].use) : 0
                },
                network: {
                    rx: network && network.length > 0 ? Math.round(network[0].rx_sec / 1024) : 0, // KB/s
                    tx: network && network.length > 0 ? Math.round(network[0].tx_sec / 1024) : 0
                },
                containers: {
                    running: containers.filter(c => c.State === 'running').length,
                    total: containers.length
                },
                uptime: Math.round(os.uptime())
            };
        } catch (err) {
            console.error('Monitoring Error:', err.message);
            return null;
        }
    }

    async saveStatsToDB(stats) {
        try {
            await ServerMetric.create({
                serverName: 'Primary Host',
                hostname: stats.hostname,
                status: stats.cpu.usage > 90 ? 'critical' : stats.cpu.usage > 70 ? 'warning' : 'healthy',
                cpu: stats.cpu,
                memory: stats.memory,
                disk: stats.disk,
                uptime: stats.uptime,
                containers: stats.containers
            });

            // Keep only last 100 minutes of history
            const count = await ServerMetric.countDocuments();
            if (count > 400) {
                await ServerMetric.findOneAndDelete({}, { sort: { timestamp: 1 } });
            }
        } catch (err) {
            console.error('DB Metric Error:', err.message);
        }
    }

    getRegistry() {
        return registry;
    }

    async getContainerStats() {
        const containers = await docker.listContainers({ all: true });
        return await Promise.all(containers.map(async (info) => {
            const container = docker.getContainer(info.Id);
            const stats = await container.stats({ stream: false });

            // Calculate CPU percentage
            const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
            const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
            const cpuPercent = (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100.0;

            return {
                id: info.Id.substring(0, 12),
                name: info.Names[0].replace('/', ''),
                image: info.Image,
                status: info.State,
                cpu: isNaN(cpuPercent) ? 0 : Math.round(cpuPercent),
                memory: Math.round(stats.memory_stats.usage / 1024 / 1024),
                memoryLimit: Math.round(stats.memory_stats.limit / 1024 / 1024),
                uptime: info.Status
            };
        }));
    }
}

module.exports = MonitorService;
