import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { securityAPI, alertsAPI } from '../services/api';
import { HiOutlineShieldCheck, HiOutlineExclamation, HiOutlineLockOpen, HiOutlineCheckCircle, HiOutlineTerminal } from 'react-icons/hi';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const socket = io('http://localhost:5000');

export default function Security() {
    const [scans, setScans] = useState([]);
    const [anomalies, setAnomalies] = useState([]);
    const [vulnSummary, setVulnSummary] = useState([]);
    const [stats, setStats] = useState({ totalScans: 0, critical: 0, open: 0, resolved: 0 });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [scanRes, statRes, alertRes] = await Promise.all([
                securityAPI.getScans(),
                securityAPI.getStats(),
                alertsAPI.getAll({ type: 'ai_detection', limit: 10 })
            ]);

            if (scanRes.data?.success) {
                setScans(scanRes.data.data);
            }

            if (alertRes.data?.success) {
                setAnomalies(alertRes.data.data);
            }

            if (statRes.data?.success) {
                const s = statRes.data.data.stats;
                setStats({
                    totalScans: s.totalScans || 0,
                    critical: s.totalCritical || 0,
                    open: s.totalVulnerabilities || 0,
                    resolved: (s.totalScans * 5) - s.totalVulnerabilities // Estimated fix rate
                });

                setVulnSummary([
                    { name: 'Critical', value: s.totalCritical || 0, color: '#ef4444' },
                    { name: 'High', value: s.totalHigh || 0, color: '#f97316' },
                    { name: 'Medium', value: s.totalMedium || 0, color: '#f59e0b' },
                    { name: 'Low', value: s.totalLow || 0, color: '#10b981' },
                ]);
            }
        } catch (err) {
            console.error("Security fetch error:", err);
            toast.error("Failed to load security scans and anomaly logs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        socket.on('alert_new', (data) => {
            if (data.type === 'ai_detection' || data.type === 'security') {
                setAnomalies(prev => [data, ...prev].slice(0, 20));
                if (data.severity === 'critical') {
                    setStats(prev => ({ ...prev, critical: prev.critical + 1 }));
                }
            }
        });

        return () => socket.off('alert_new');
    }, []);

    if (loading && scans.length === 0) return <div className="spinner-container"><div className="spinner"></div></div>;

    // Flatten vulnerabilities from all scans for the table
    const allVulnerabilities = scans.flatMap(scan =>
        scan.vulnerabilities.map(v => ({
            ...v,
            scanTarget: scan.target,
            scanType: scan.scanType,
            status: scan.status === 'completed' ? 'open' : 'scanning'
        }))
    ).slice(0, 50);

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                    Security <span className="gradient-text">Operations Center</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
                    Live vulnerability tracking and AI-powered anomaly detection
                </p>
            </motion.div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                {[
                    { label: 'Network Scans', value: stats.totalScans, icon: HiOutlineShieldCheck, color: 'var(--accent-blue)' },
                    { label: 'Critical Risks', value: stats.critical, icon: HiOutlineExclamation, color: 'var(--accent-red)' },
                    { label: 'Total Vulnerabilities', value: stats.open, icon: HiOutlineLockOpen, color: 'var(--accent-yellow)' },
                    { label: 'Remediated', value: stats.resolved, icon: HiOutlineCheckCircle, color: 'var(--accent-green)' },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card" style={{ padding: 20, borderLeft: `3px solid ${s.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</p>
                                <p style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{s.value}</p>
                            </div>
                            <s.icon size={20} color={s.color} style={{ opacity: 0.5 }} />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 20, marginBottom: 28 }}>
                {/* Vulnerability Analysis */}
                <div className="chart-container" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Vulnerability Risk Profile</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={vulnSummary} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" animationDuration={1000}>
                                {vulnSummary.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                        {vulnSummary.map(v => (
                            <div key={v.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                                <div style={{ width: 8, height: 8, borderRadius: 2, background: v.color }} />
                                <span style={{ color: 'var(--text-secondary)' }}>{v.name}: <strong>{v.value}</strong></span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Anomaly Logs */}
                <div className="chart-container" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                        <HiOutlineTerminal color="var(--accent-cyan)" />
                        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Real-Time Anomaly Detection Logs</h3>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', maxHeight: 250, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {anomalies.map((log, i) => (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={log._id || i} style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 6, borderLeft: `2px solid ${log.severity === 'critical' ? 'var(--accent-red)' : 'var(--accent-cyan)'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: log.severity === 'critical' ? 'var(--accent-red)' : 'var(--accent-cyan)' }}>{log.title.toUpperCase()}</span>
                                    <span style={{ fontSize: 9, color: 'var(--text-secondary)' }}>{new Date(log.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <p style={{ fontSize: 11, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{log.message}</p>
                            </motion.div>
                        ))}
                        {anomalies.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12, marginTop: 40 }}>Analyzing system patterns... No anomalies detected.</p>}
                    </div>
                </div>
            </div>

            {/* Detailed Vulnerability List */}
            <div className="chart-container" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Latest Vulnerability Findings</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Severity</th>
                                <th>Target</th>
                                <th>Issue</th>
                                <th>CVE / ID</th>
                                <th>Package</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allVulnerabilities.map((v, i) => (
                                <tr key={i}>
                                    <td><span className={`severity-${v.severity}`} style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{v.severity.toUpperCase()}</span></td>
                                    <td style={{ fontSize: 12 }}>{v.scanTarget}</td>
                                    <td style={{ fontSize: 12, fontWeight: 500 }}>{v.title}</td>
                                    <td style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{v.cveId || 'N/A'}</td>
                                    <td style={{ fontSize: 11, fontFamily: 'monospace' }}>{v.package}@{v.version}</td>
                                    <td>
                                        <span style={{ fontSize: 10, color: v.status === 'open' ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 700 }}>{v.status.toUpperCase()}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {allVulnerabilities.length === 0 && (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <HiOutlineShieldCheck size={40} style={{ opacity: 0.2, marginBottom: 16 }} />
                            <p>No active vulnerabilities discovered in recent scans.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
