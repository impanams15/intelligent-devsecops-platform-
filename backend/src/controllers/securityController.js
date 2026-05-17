// ─────────────────────────────────────────────────
// Security Controller
// Handles security scan operations
// ─────────────────────────────────────────────────

const SecurityScan = require('../models/SecurityScan');

/**
 * @route   GET /api/security/scans
 * @desc    Get all security scans
 * @access  Private
 */
exports.getScans = async (req, res) => {
    try {
        const scans = await SecurityScan.find()
            .populate('initiatedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({ success: true, data: scans });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching scans',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/security/scans
 * @desc    Create a new security scan
 * @access  Private
 */
exports.createScan = async (req, res) => {
    try {
        const scan = await SecurityScan.create({
            ...req.body,
            initiatedBy: req.user.id
        });

        res.status(201).json({ success: true, data: scan });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating scan',
            error: error.message
        });
    }
};

const { exec } = require('child_process');
const path = require('path');

/**
 * @route   POST /api/security/scan/live
 * @desc    Run a real-time npm audit scan on the system
 * @access  Private
 */
exports.triggerRealScan = async (req, res) => {
    try {
        console.log('🔍 Initiating real-time vulnerability scan...');

        // We'll run npm audit on the backend directory
        // In a container, this scans the backend's own dependencies
        exec('npm audit --json', async (error, stdout, stderr) => {
            let auditData;
            try {
                auditData = JSON.parse(stdout);
            } catch (e) {
                return res.status(500).json({ success: false, message: 'Failed to parse audit results' });
            }

            const metadata = auditData.metadata?.vulnerabilities || { info: 0, low: 0, moderate: 0, high: 0, critical: 0 };

            // Map npm audit levels to our model
            const scan = await SecurityScan.create({
                scanType: 'dependency',
                target: 'backend-api-core',
                status: 'completed',
                vulnerabilities: [
                    {
                        title: 'Dependency Vulnerabilities (Live)',
                        severity: metadata.critical > 0 ? 'critical' : (metadata.high > 0 ? 'high' : 'medium'),
                        description: `Live scan detected ${metadata.total || 0} issues in the current project dependencies.`,
                        package: 'npm-registry',
                        version: 'latest',
                        cveId: 'LIVE-SCAN',
                        recommendation: 'Run npm audit fix to resolve vulnerabilities.'
                    }
                ],
                summary: {
                    critical: metadata.critical || 0,
                    high: metadata.high || 0,
                    medium: metadata.moderate || 0,
                    low: metadata.low || 0,
                    info: metadata.info || 0,
                    total: (metadata.critical || 0) + (metadata.high || 0) + (metadata.moderate || 0) + (metadata.low || 0)
                },
                scanner: 'npm-audit-internal',
                duration: 5,
                createdAt: new Date()
            });

            res.json({ success: true, message: 'Live scan completed', data: scan });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @route   GET /api/security/stats
 * @desc    Get security scan statistics
 * @access  Private
 */
exports.getSecurityStats = async (req, res) => {
    try {
        // Aggregate vulnerability counts
        const vulnStats = await SecurityScan.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: null,
                    totalScans: { $sum: 1 },
                    totalCritical: { $sum: '$summary.critical' },
                    totalHigh: { $sum: '$summary.high' },
                    totalMedium: { $sum: '$summary.medium' },
                    totalLow: { $sum: '$summary.low' },
                    totalVulnerabilities: { $sum: '$summary.total' }
                }
            }
        ]);

        // If no scans exist, we should probably return a clear state or even a mock "scanned" result if we want
        // But the user wants REAL data. So we return 0 if no scans have been run.

        res.json({
            success: true,
            data: {
                stats: vulnStats[0] || {
                    totalScans: 0,
                    totalCritical: 0,
                    totalHigh: 0,
                    totalMedium: 0,
                    totalLow: 0,
                    totalVulnerabilities: 0
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching security stats',
            error: error.message
        });
    }
};

