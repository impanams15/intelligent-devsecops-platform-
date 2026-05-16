// Alerts / Notification Page
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineBell, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

const alertsData = [
    { id: 1, title: 'Critical Vulnerability Detected', message: 'CVE-2024-1234 found in production container image devsecops/backend:latest', type: 'security', severity: 'critical', source: 'Trivy Scanner', channel: 'slack', status: 'active', time: '2 min ago' },
    { id: 2, title: 'High CPU Usage Alert', message: 'Server prod-db-01 CPU usage exceeded 90% for 5 consecutive minutes', type: 'performance', severity: 'high', source: 'Prometheus', channel: 'email', status: 'active', time: '15 min ago' },
    { id: 3, title: 'Anomaly: Unusual Login Pattern', message: 'AI detected 47 failed login attempts from IP 192.168.1.100', type: 'ai_detection', severity: 'critical', source: 'AI Service', channel: 'telegram', status: 'active', time: '32 min ago' },
    { id: 4, title: 'Deployment Failed', message: 'Production deployment v1.2.3 failed at build stage due to test failures', type: 'deployment', severity: 'high', source: 'GitHub Actions', channel: 'slack', status: 'acknowledged', time: '1 hr ago' },
    { id: 5, title: 'Container Restart Loop', message: 'Container auth-service has restarted 5 times in the last hour', type: 'system', severity: 'high', source: 'Kubernetes', channel: 'dashboard', status: 'acknowledged', time: '2 hr ago' },
    { id: 6, title: 'SSL Certificate Expiring', message: 'SSL certificate for api.devsecops.io expires in 7 days', type: 'security', severity: 'medium', source: 'Cert Monitor', channel: 'email', status: 'resolved', time: '5 hr ago' },
    { id: 7, title: 'Disk Space Warning', message: 'Server prod-api-01 disk usage at 85% — consider cleanup', type: 'system', severity: 'medium', source: 'Prometheus', channel: 'dashboard', status: 'resolved', time: '8 hr ago' },
    { id: 8, title: 'Successful Production Deploy', message: 'v1.3.0 deployed to production env successfully', type: 'deployment', severity: 'info', source: 'CI/CD', channel: 'slack', status: 'resolved', time: '12 hr ago' },
];

const channelIcons = { slack: '💬', email: '📧', telegram: '📱', dashboard: '🖥️', all: '📡' };
const typeColors = { security: '#ef4444', performance: '#f97316', deployment: '#3b82f6', system: '#8b5cf6', ai_detection: '#06b6d4' };

export default function Alerts() {
    const [filter, setFilter] = useState('all');
    const [alerts, setAlerts] = useState(alertsData);

    const filtered = filter === 'all' ? alerts : alerts.filter(a => a.status === filter);

    const handleAcknowledge = (id) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a));
    };

    const handleResolve = (id) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
    };

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                    <span className="gradient-text">Notifications</span> Center
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
                    Alerts from Slack, Email, Telegram, and system monitors
                </p>
            </motion.div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {['all', 'active', 'acknowledged', 'resolved'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '8px 20px', borderRadius: 8, border: '1px solid', fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s',
                        background: filter === f ? 'rgba(59,130,246,0.15)' : 'transparent',
                        borderColor: filter === f ? 'var(--accent-blue)' : 'var(--border-color)',
                        color: filter === f ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    }}>
                        {f} {f !== 'all' && <span style={{ marginLeft: 4, opacity: 0.6 }}>({alerts.filter(a => f === 'all' || a.status === f).length})</span>}
                    </button>
                ))}
            </div>

            {/* Alert Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <AnimatePresence>
                    {filtered.map((alert, i) => (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card"
                            style={{
                                padding: '20px 24px',
                                borderLeft: `3px solid ${typeColors[alert.type]}`,
                                opacity: alert.status === 'resolved' ? 0.6 : 1,
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                        <span className={`severity-${alert.severity}`} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                                            {alert.severity}
                                        </span>
                                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                            {channelIcons[alert.channel]} {alert.channel}
                                        </span>
                                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{alert.time}</span>
                                    </div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{alert.title}</h3>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>{alert.message}</p>
                                    <p style={{ fontSize: 11, color: typeColors[alert.type] }}>Source: {alert.source}</p>
                                </div>
                                {alert.status === 'active' && (
                                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                        <button onClick={() => handleAcknowledge(alert.id)} style={{
                                            padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border-color)',
                                            background: 'transparent', color: 'var(--accent-yellow)', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                                        }}>ACK</button>
                                        <button onClick={() => handleResolve(alert.id)} style={{
                                            padding: '6px 14px', borderRadius: 6, border: 'none',
                                            background: 'rgba(16,185,129,0.15)', color: 'var(--accent-green)', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                                        }}>RESOLVE</button>
                                    </div>
                                )}
                                {alert.status !== 'active' && (
                                    <span style={{
                                        padding: '4px 12px', borderRadius: 6, fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                                        background: alert.status === 'resolved' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                        color: alert.status === 'resolved' ? 'var(--accent-green)' : 'var(--accent-yellow)',
                                    }}>{alert.status}</span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
