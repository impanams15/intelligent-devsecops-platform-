// ─────────────────────────────────────────────────
// Database Seeder
// Populates MongoDB with realistic demo data
// ─────────────────────────────────────────────────

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Deployment = require('../models/Deployment');
const Pipeline = require('../models/Pipeline');
const SecurityScan = require('../models/SecurityScan');
const Alert = require('../models/Alert');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📦 Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany();
        await Deployment.deleteMany();
        await Pipeline.deleteMany();
        await SecurityScan.deleteMany();
        await Alert.deleteMany();

        // Create users
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@devsecops.io',
            password: 'admin123',
            role: 'admin'
        });

        const dev = await User.create({
            name: 'Dev User',
            email: 'dev@devsecops.io',
            password: 'dev123',
            role: 'developer'
        });

        console.log('✅ Users seeded');

        // Create deployments
        const deployments = [];
        const envs = ['development', 'staging', 'production'];
        const statuses = ['success', 'success', 'success', 'failed', 'building', 'success'];
        const projects = ['frontend-app', 'backend-api', 'ai-service', 'auth-service'];

        for (let i = 0; i < 12; i++) {
            deployments.push({
                projectName: projects[i % projects.length],
                environment: envs[i % envs.length],
                version: `v1.${Math.floor(i / 3)}.${i % 3}`,
                status: statuses[i % statuses.length],
                branch: i % 3 === 0 ? 'main' : 'develop',
                commitHash: Math.random().toString(36).substring(2, 9),
                deployedBy: i % 2 === 0 ? admin._id : dev._id,
                duration: Math.round(Math.random() * 300 + 60),
                createdAt: new Date(Date.now() - i * 86400000 * Math.random()),
                logs: [
                    { message: 'Deployment initiated', level: 'info' },
                    { message: 'Docker image built successfully', level: 'info' },
                    { message: 'Container deployed to cluster', level: 'info' }
                ]
            });
        }
        await Deployment.insertMany(deployments);
        console.log('✅ Deployments seeded');

        // Create pipelines
        const pipelines = [];
        const pipelineStatuses = ['success', 'failed', 'success', 'running', 'success', 'cancelled'];
        const triggers = ['push', 'pull_request', 'manual', 'push'];

        for (let i = 0; i < 15; i++) {
            const status = pipelineStatuses[i % pipelineStatuses.length];
            pipelines.push({
                name: `Build #${1000 + i}`,
                repository: `devsecops/${projects[i % projects.length]}`,
                branch: i % 3 === 0 ? 'main' : 'feature/update-' + i,
                trigger: triggers[i % triggers.length],
                status,
                stages: [
                    { name: 'Checkout', status: 'success', duration: 5 },
                    { name: 'Install Dependencies', status: 'success', duration: 45 },
                    { name: 'Lint & Format', status: 'success', duration: 12 },
                    { name: 'Unit Tests', status: status === 'failed' && i % 3 === 0 ? 'failed' : 'success', duration: 30 },
                    { name: 'Security Scan', status: status === 'failed' && i % 3 !== 0 ? 'failed' : (status === 'running' ? 'running' : 'success'), duration: 25 },
                    { name: 'Build', status: status === 'success' ? 'success' : 'skipped', duration: 60 },
                    { name: 'Deploy', status: status === 'success' ? 'success' : 'skipped', duration: 45 }
                ],
                triggeredBy: i % 2 === 0 ? admin._id : dev._id,
                commitMessage: ['feat: add new feature', 'fix: resolve bug', 'chore: update deps', 'refactor: clean code'][i % 4],
                commitHash: Math.random().toString(36).substring(2, 9),
                duration: Math.round(Math.random() * 400 + 100),
                createdAt: new Date(Date.now() - i * 43200000)
            });
        }
        await Pipeline.insertMany(pipelines);
        console.log('✅ Pipelines seeded');

        // Create security scans
        const scans = [];
        const scanTypes = ['container', 'code', 'dependency', 'infrastructure'];
        const targets = ['devsecops/frontend:latest', 'devsecops/backend:latest', 'github.com/devsecops/api', 'k8s-cluster-prod'];
        const severities = ['critical', 'high', 'medium', 'low', 'info'];

        for (let i = 0; i < 8; i++) {
            const critCount = Math.floor(Math.random() * 3);
            const highCount = Math.floor(Math.random() * 5);
            const medCount = Math.floor(Math.random() * 10);
            const lowCount = Math.floor(Math.random() * 15);

            const vulns = [];
            for (let j = 0; j < critCount + highCount + medCount; j++) {
                const sev = j < critCount ? 'critical' : (j < critCount + highCount ? 'high' : 'medium');
                vulns.push({
                    title: ['SQL Injection Risk', 'XSS Vulnerability', 'Outdated Package', 'Insecure Config', 'Buffer Overflow', 'Path Traversal', 'CSRF Token Missing', 'Weak Cipher'][j % 8],
                    severity: sev,
                    description: `Detected ${sev} vulnerability in target`,
                    package: ['lodash', 'express', 'jsonwebtoken', 'axios', 'mongoose'][j % 5],
                    version: `${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 20)}`,
                    fixedVersion: `${Math.floor(Math.random() * 5) + 5}.0.0`,
                    cveId: `CVE-2024-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
                    recommendation: 'Update to the latest patched version'
                });
            }

            scans.push({
                scanType: scanTypes[i % scanTypes.length],
                target: targets[i % targets.length],
                status: 'completed',
                vulnerabilities: vulns,
                summary: { critical: critCount, high: highCount, medium: medCount, low: lowCount, info: 0, total: critCount + highCount + medCount + lowCount },
                scanner: i % 2 === 0 ? 'trivy' : 'sonarqube',
                initiatedBy: admin._id,
                duration: Math.round(Math.random() * 120 + 30),
                createdAt: new Date(Date.now() - i * 86400000)
            });
        }
        await SecurityScan.insertMany(scans);
        console.log('✅ Security scans seeded');

        // Create alerts
        const alerts = [];
        const alertTypes = ['security', 'performance', 'deployment', 'system', 'ai_detection'];
        const alertMessages = [
            { title: 'Critical Vulnerability Detected', message: 'CVE-2024-1234 found in production container', severity: 'critical', type: 'security' },
            { title: 'High CPU Usage Alert', message: 'Server prod-db-01 CPU usage exceeded 90% for 5 minutes', severity: 'high', type: 'performance' },
            { title: 'Deployment Failed', message: 'Production deployment v1.2.3 failed at build stage', severity: 'high', type: 'deployment' },
            { title: 'Disk Space Warning', message: 'Server prod-api-01 disk usage at 85%', severity: 'medium', type: 'system' },
            { title: 'Anomaly Detected: Unusual Login Pattern', message: 'AI detected 47 failed login attempts from IP 192.168.1.100', severity: 'critical', type: 'ai_detection' },
            { title: 'Container Restart Loop', message: 'Container auth-service has restarted 5 times in last hour', severity: 'high', type: 'system' },
            { title: 'SSL Certificate Expiring', message: 'SSL certificate for api.devsecops.io expires in 7 days', severity: 'medium', type: 'security' },
            { title: 'AI Alert: Traffic Anomaly', message: 'Unusual spike in API requests detected (300% above baseline)', severity: 'high', type: 'ai_detection' },
            { title: 'Memory Leak Detected', message: 'Backend API memory usage growing linearly - possible leak', severity: 'medium', type: 'performance' },
            { title: 'Successful Production Deploy', message: 'v1.3.0 deployed to production successfully', severity: 'info', type: 'deployment' },
        ];

        for (let i = 0; i < alertMessages.length; i++) {
            alerts.push({
                ...alertMessages[i],
                source: ['trivy', 'prometheus', 'github-actions', 'system', 'ai-service'][i % 5],
                status: i < 3 ? 'active' : (i < 6 ? 'acknowledged' : 'resolved'),
                channel: ['dashboard', 'slack', 'email', 'telegram', 'all'][i % 5],
                createdAt: new Date(Date.now() - i * 7200000)
            });
        }
        await Alert.insertMany(alerts);
        console.log('✅ Alerts seeded');

        console.log('\n🎉 Database seeded successfully!');
        console.log('📧 Admin: admin@devsecops.io / admin123');
        console.log('📧 Developer: dev@devsecops.io / dev123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error.message);
        process.exit(1);
    }
};

seedData();
