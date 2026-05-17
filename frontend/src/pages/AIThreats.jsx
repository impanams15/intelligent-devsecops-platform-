import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { metricsAPI, alertsAPI } from '../services/api';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const socket = io('http://localhost:5000');

export default function AIThreats() {
    const [history, setHistory] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [liveStats, setLiveStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [histRes, alertRes] = await Promise.all([
                metricsAPI.getHistory(),
                alertsAPI.getAll()
            ]);

            if (histRes.data.success) {
                setHistory(histRes.data.data.map(h => ({
                    time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    cpu: h.cpu || 0,
                    memory: h.memory || 0,
                    disk: h.disk || 0,
                    network: h.network || 0,
                    anomaly: (h.cpu || 0) > 85 || (h.memory || 0) > 90
                })));
            }
            if (alertRes.data.success) {
                setAlerts(alertRes.data.data.filter(a => a.type === 'ai_detection' || a.type === 'system' || a.severity === 'critical'));
            }
        } catch (err) {
            console.error("AI Threats fetch error:", err);
            toast.error("Failed to load AI metrics.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        socket.on('metrics_update', (data) => {
            if (!data) return;
            setLiveStats(data);
            setHistory(prev => {
                const newData = [...prev, {
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    cpu: data.cpu?.usage || 0,
                    memory: data.memory?.percentage || 0,
                    disk: data.disk?.percentage || 0,
                    network: (data.network?.rx || 0) + (data.network?.tx || 0),
                    anomaly: (data.cpu?.usage || 0) > 85 || (data.memory?.percentage || 0) > 90
                }];
                return newData.slice(-30);
            });
        });

        socket.on('alert_new', (data) => {
            if (data.type === 'ai_detection' || data.type === 'system' || data.severity === 'critical') {
                setAlerts(prev => [data, ...prev].slice(0, 30));
                toast.error(`🚨 ${data.title}: ${data.message}`, { duration: 5000 });
            }
        });

        return () => {
            socket.off('metrics_update');
            socket.off('alert_new');
        };
    }, []);

    if (loading && history.length === 0) return <div className="spinner-container"><div className="spinner"></div></div>;

    // All stats are computed from REAL live data
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    const aiAlerts = alerts.filter(a => a.type === 'ai_detection').length;
    const currentCpu = liveStats?.cpu?.usage || 0;
    const currentMem = liveStats?.memory?.percentage || 0;
    const riskLevel = criticalAlerts > 3 ? 'Critical' : criticalAlerts > 0 ? 'High' : currentCpu > 80 ? 'Medium' : 'Low';
    const riskColor = riskLevel === 'Critical' ? '#ef4444' : riskLevel === 'High' ? '#f97316' : riskLevel === 'Medium' ? '#f59e0b' : '#10b981';

    const stats = [
        { label: 'AI Engine', value: liveStats ? 'Active' : 'Connecting', color: liveStats ? '#10b981' : '#64748b', icon: '🤖' },
        { label: 'Threats Detected', value: alerts.length, color: alerts.length > 0 ? '#ef4444' : '#10b981', icon: '⚠️' },
        { label: 'Risk Level', value: riskLevel, color: riskColor, icon: riskLevel === 'Low' ? '🟢' : '🔴' },
        { label: 'Live CPU', value: `${currentCpu}%`, color: currentCpu > 85 ? '#ef4444' : '#3b82f6', icon: '⚡' },
    ];

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                    AI <span className="gradient-text">Threat Detection</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
                    Real-time anomaly detection from live CPU, memory, disk, and network metrics
                </p>
            </motion.div>

            {/* AI Status */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                {stats.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="glass-card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{s.label}</p>
                                <p style={{ fontSize: 22, fontWeight: 700, marginTop: 4, color: s.color }}>{s.value}</p>
                            </div>
                            <span style={{ fontSize: 28 }}>{s.icon}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Multi-Metric Anomaly Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="chart-container" style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🔍 Real-time Multi-Metric Anomaly Detection</h3>
                <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={history}>
                        <defs>
                            <linearGradient id="cpuAnom" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="memAnom" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                        <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} unit="%" domain={[0, 100]} />
                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }} />
                        <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'CPU Threshold', fill: '#ef4444', fontSize: 10 }} />
                        <ReferenceLine y={90} stroke="#f97316" strokeDasharray="5 5" label={{ value: 'MEM Threshold', fill: '#f97316', fontSize: 10 }} />
                        <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fill="url(#cpuAnom)" strokeWidth={2} name="CPU %" dot={(props) => {
                            if (props.payload.anomaly) return <circle cx={props.cx} cy={props.cy} r={5} fill="#ef4444" stroke="#ef4444" />;
                            return null;
                        }} />
                        <Area type="monotone" dataKey="memory" stroke="#8b5cf6" fill="url(#memAnom)" strokeWidth={2} name="Memory %" />
                    </AreaChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Live System Gauges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                {[
                    { label: 'CPU', value: currentCpu, color: currentCpu > 85 ? '#ef4444' : '#3b82f6' },
                    { label: 'Memory', value: currentMem, color: currentMem > 90 ? '#ef4444' : '#8b5cf6' },
                    { label: 'Disk', value: liveStats?.disk?.percentage || 0, color: (liveStats?.disk?.percentage || 0) > 90 ? '#ef4444' : '#06b6d4' },
                    { label: 'Network', value: Math.min(((liveStats?.network?.rx || 0) + (liveStats?.network?.tx || 0)) / 10, 100), color: '#10b981', suffix: ' KB/s' },
                ].map((g, i) => (
                    <motion.div key={g.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.05 }} className="glass-card" style={{ padding: 16 }}>
                        <p style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>{g.label}</p>
                        <div style={{ height: 6, background: 'rgba(42,48,80,0.5)', borderRadius: 3, overflow: 'hidden' }}>
                            <motion.div animate={{ width: `${Math.min(g.value, 100)}%` }} style={{ height: '100%', borderRadius: 3, background: g.color }} />
                        </div>
                        <p style={{ fontSize: 18, fontWeight: 700, marginTop: 8, color: g.color }}>{g.suffix ? `${(liveStats?.network?.rx || 0) + (liveStats?.network?.tx || 0)}${g.suffix}` : `${Math.round(g.value)}%`}</p>
                    </motion.div>
                ))}
            </div>

            {/* Threat Feed */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="chart-container">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🚨 Live AI Threat Feed</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto' }}>
                    {alerts.map((t, i) => (
                        <motion.div key={t._id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                            style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 10, background: 'rgba(17,24,39,0.5)', border: '1px solid rgba(42,48,80,0.3)' }}>
                            <span className={`severity-${t.severity}`} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', flexShrink: 0, marginTop: 2 }}>{t.severity}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>{t.title}</span>
                                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{new Date(t.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t.message}</p>
                                <p style={{ fontSize: 11, color: 'var(--accent-blue)', marginTop: 4 }}>Source: {t.source}</p>
                            </div>
                        </motion.div>
                    ))}
                    {alerts.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>✅ No active threats detected. System is healthy.</div>}
                </div>
            </motion.div>
        </div>
    );
}
