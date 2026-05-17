import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineBell, HiOutlineCheck, HiOutlineCheckCircle } from 'react-icons/hi';
import { alertsAPI } from '../services/api';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const socket = io('http://localhost:5000');

const channelIcons = { slack: '💬', email: '📧', telegram: '📱', dashboard: '🖥️', all: '📡' };
const typeColors = { security: '#ef4444', performance: '#f97316', deployment: '#3b82f6', system: '#8b5cf6', ai_detection: '#06b6d4' };

export default function Alerts() {
    const [filter, setFilter] = useState('all');
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await alertsAPI.getAll();
            if (res.data.success) {
                setAlerts(res.data.data);
            }
        } catch (err) {
            console.error("Alerts fetch error:", err);
            toast.error("Failed to load real-time alerts stream.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        socket.on('alert_new', (newAlert) => {
            setAlerts(prev => [newAlert, ...prev].slice(0, 50));
        });

        return () => {
            socket.off('alert_new');
        };
    }, []);

    const filtered = filter === 'all' ? alerts : alerts.filter(a => a.status === filter);

    const handleAcknowledge = async (id) => {
        try {
            await alertsAPI.acknowledge(id);
            await fetchData();
        } catch (err) { console.error(err); }
    };

    const handleResolve = async (id) => {
        try {
            await alertsAPI.resolve(id);
            await fetchData();
        } catch (err) { console.error(err); }
    };

    if (loading && alerts.length === 0) return <div className="spinner-container"><div className="spinner"></div></div>;

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
                        {f} {f !== 'all' && <span style={{ marginLeft: 4, opacity: 0.6 }}>({alerts.filter(a => a.status === f).length})</span>}
                    </button>
                ))}
            </div>

            {/* Alert Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <AnimatePresence>
                    {filtered.map((alert, i) => (
                        <motion.div
                            key={alert._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card"
                            style={{
                                padding: '20px 24px',
                                borderLeft: `3px solid ${typeColors[alert.type] || '#6366f1'}`,
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
                                            {channelIcons[alert.channel] || '📡'} {alert.channel}
                                        </span>
                                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{new Date(alert.createdAt).toLocaleString()}</span>
                                    </div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{alert.title}</h3>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>{alert.message}</p>
                                    <p style={{ fontSize: 11, color: typeColors[alert.type] || '#6366f1' }}>Source: {alert.source}</p>
                                </div>
                                {alert.status === 'active' && (
                                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                        <button onClick={() => handleAcknowledge(alert._id)} style={{
                                            padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border-color)',
                                            background: 'transparent', color: 'var(--accent-yellow)', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                                        }}>ACK</button>
                                        <button onClick={() => handleResolve(alert._id)} style={{
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
                    {filtered.length === 0 && <div className="glass-card" style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>No notifications found in this category.</div>}
                </AnimatePresence>
            </div>
        </div>
    );
}
