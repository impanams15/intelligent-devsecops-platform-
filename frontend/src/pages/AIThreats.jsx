// AI Threat Detection Page
import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { HiOutlineLightningBolt, HiOutlineEye, HiOutlineExclamation } from 'react-icons/hi';

// Simulated CPU anomaly data
const cpuData = Array.from({ length: 48 }, (_, i) => {
    let value = Math.round(Math.random() * 25 + 30);
    // Inject anomalies
    if (i === 12 || i === 28 || i === 35 || i === 41) value = Math.round(Math.random() * 15 + 85);
    return { time: `${String(i % 24).padStart(2, '0')}:00`, value, anomaly: value > 80 };
});

// Login attempts
const loginData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    successful: Math.round(Math.random() * 50 + 20),
    failed: i === 3 || i === 4 || i === 14 ? Math.round(Math.random() * 30 + 40) : Math.round(Math.random() * 5),
}));

// Traffic data
const trafficData = Array.from({ length: 24 }, (_, i) => {
    let requests = Math.round(Math.random() * 200 + 400);
    if (i === 8 || i === 15) requests = Math.round(Math.random() * 500 + 1500);
    return { time: `${String(i).padStart(2, '0')}:00`, requests, baseline: 600 };
});

const threats = [
    { time: '2 min ago', type: 'CPU Spike', desc: 'Server prod-db-01 CPU hit 96% — anomalous behavior detected', severity: 'critical', source: 'AI Engine' },
    { time: '15 min ago', type: 'Brute Force', desc: '47 failed login attempts from 192.168.1.100 in 5 minutes', severity: 'critical', source: 'Login Monitor' },
    { time: '32 min ago', type: 'Traffic Spike', desc: 'API requests 300% above baseline — possible DDoS attempt', severity: 'high', source: 'Traffic Analyzer' },
    { time: '1 hr ago', type: 'Unusual Pattern', desc: 'Root access attempt detected from unknown IP 10.0.45.88', severity: 'high', source: 'Log Analyzer' },
    { time: '3 hr ago', type: 'Memory Leak', desc: 'Backend API memory usage growing linearly — predicted OOM in 6h', severity: 'medium', source: 'AI Predictor' },
    { time: '5 hr ago', type: 'Port Scan', desc: 'Sequential port scanning detected from external IP range', severity: 'medium', source: 'Network Monitor' },
];

export default function AIThreats() {
    return (
        <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                    AI <span className="gradient-text">Threat Detection</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
                    Machine learning-powered anomaly detection and threat analysis
                </p>
            </motion.div>

            {/* AI Status */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                {[
                    { label: 'AI Engine', value: 'Active', color: '#10b981', icon: '🤖' },
                    { label: 'Anomalies (24h)', value: '6', color: '#ef4444', icon: '⚠️' },
                    { label: 'Risk Level', value: 'High', color: '#f97316', icon: '🔴' },
                    { label: 'Models Accuracy', value: '97.3%', color: '#3b82f6', icon: '🎯' },
                ].map((s, i) => (
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

            {/* CPU Anomaly Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="chart-container" style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🔍 CPU Anomaly Detection</h3>
                <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={cpuData}>
                        <defs>
                            <linearGradient id="cpuAnom" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                        <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} unit="%" domain={[0, 100]} />
                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }} />
                        <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Threshold', fill: '#ef4444', fontSize: 11 }} />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#cpuAnom)" strokeWidth={2} dot={(props) => {
                            if (props.payload.anomaly) return <circle cx={props.cx} cy={props.cy} r={5} fill="#ef4444" stroke="#ef4444" />;
                            return null;
                        }} />
                    </AreaChart>
                </ResponsiveContainer>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
                {/* Login Anomaly */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="chart-container">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🔐 Login Pattern Analysis</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={loginData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                            <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                            <YAxis stroke="#64748b" fontSize={11} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }} />
                            <Bar dataKey="successful" fill="#10b981" radius={[3, 3, 0, 0]} name="Successful" />
                            <Bar dataKey="failed" fill="#ef4444" radius={[3, 3, 0, 0]} name="Failed" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Traffic Anomaly */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="chart-container">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🌐 Traffic Anomaly Detection</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={trafficData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                            <YAxis stroke="#64748b" fontSize={11} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }} />
                            <Line type="monotone" dataKey="baseline" stroke="#64748b" strokeDasharray="5 5" name="Baseline" dot={false} />
                            <Line type="monotone" dataKey="requests" stroke="#06b6d4" strokeWidth={2} name="Requests" dot={(p) => p.payload.requests > 1000 ? <circle cx={p.cx} cy={p.cy} r={5} fill="#ef4444" /> : null} />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Threat Feed */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="chart-container">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🚨 AI Threat Feed</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {threats.map((t, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.05 }}
                            style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 10, background: 'rgba(17,24,39,0.5)', border: '1px solid rgba(42,48,80,0.3)' }}>
                            <span className={`severity-${t.severity}`} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', flexShrink: 0, marginTop: 2 }}>{t.severity}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>{t.type}</span>
                                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t.time}</span>
                                </div>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t.desc}</p>
                                <p style={{ fontSize: 11, color: 'var(--accent-blue)', marginTop: 4 }}>Source: {t.source}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
