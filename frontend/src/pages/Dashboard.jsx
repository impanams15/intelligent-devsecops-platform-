// ─────────────────────────────────────────────────
// Dashboard Page
// Main overview with stats, charts, and activity feed
// ─────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import {
    HiOutlineServer, HiOutlineShieldCheck, HiOutlineCode,
    HiOutlineBell, HiOutlineChip, HiOutlineTrendingUp,
    HiOutlineClock, HiOutlineCheckCircle
} from 'react-icons/hi';

// Simulated data for the dashboard
const cpuHistory = Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    cpu: Math.round(Math.random() * 35 + 25),
    memory: Math.round(Math.random() * 25 + 55),
    network: Math.round(Math.random() * 300 + 200),
}));

const deploymentData = [
    { name: 'Mon', success: 8, failed: 1 },
    { name: 'Tue', success: 12, failed: 2 },
    { name: 'Wed', success: 6, failed: 0 },
    { name: 'Thu', success: 15, failed: 3 },
    { name: 'Fri', success: 10, failed: 1 },
    { name: 'Sat', success: 4, failed: 0 },
    { name: 'Sun', success: 3, failed: 0 },
];

const securityPie = [
    { name: 'Critical', value: 3, color: '#ef4444' },
    { name: 'High', value: 8, color: '#f97316' },
    { name: 'Medium', value: 15, color: '#f59e0b' },
    { name: 'Low', value: 24, color: '#10b981' },
];

const recentActivity = [
    { action: 'Production deploy v2.1.4', status: 'success', time: '2 min ago', icon: '🚀' },
    { action: 'Security scan completed', status: 'warning', time: '15 min ago', icon: '🔍' },
    { action: 'AI detected traffic anomaly', status: 'alert', time: '32 min ago', icon: '🤖' },
    { action: 'Pipeline #1247 succeeded', status: 'success', time: '1 hr ago', icon: '✅' },
    { action: 'Container auto-scaled x3', status: 'info', time: '2 hr ago', icon: '📦' },
    { action: 'SSL certificate renewed', status: 'success', time: '3 hr ago', icon: '🔒' },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 12,
            }}>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
                {payload.map((entry, i) => (
                    <p key={i} style={{ color: entry.color }}>
                        {entry.name}: {entry.value}{entry.name === 'cpu' || entry.name === 'memory' ? '%' : ''}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>
                        Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                        Here's what's happening across your infrastructure
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                    <p style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>
                        {currentTime.toLocaleTimeString()}
                    </p>
                </div>
            </motion.div>

            {/* Stat Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 20,
                marginBottom: 28,
            }}>
                <StatCard title="Servers Online" value="4/4" subtitle="All systems operational" icon={HiOutlineServer} color="green" trend={0} delay={0} />
                <StatCard title="Active Pipelines" value="15" subtitle="3 running now" icon={HiOutlineCode} color="blue" trend={12} delay={0.1} />
                <StatCard title="Vulnerabilities" value="50" subtitle="3 critical" icon={HiOutlineShieldCheck} color="red" trend={-8} delay={0.2} />
                <StatCard title="Active Alerts" value="5" subtitle="2 unresolved" icon={HiOutlineBell} color="yellow" trend={15} delay={0.3} />
                <StatCard title="Containers" value="14" subtitle="12 running" icon={HiOutlineChip} color="purple" delay={0.4} />
                <StatCard title="Uptime" value="99.97%" subtitle="Last 30 days" icon={HiOutlineTrendingUp} color="cyan" delay={0.5} />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 28 }}>
                {/* CPU & Memory Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="chart-container"
                >
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
                        System Performance (24h)
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={cpuHistory}>
                            <defs>
                                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fill="url(#cpuGrad)" strokeWidth={2} name="CPU" />
                            <Area type="monotone" dataKey="memory" stroke="#8b5cf6" fill="url(#memGrad)" strokeWidth={2} name="Memory" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Security Overview Pie */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="chart-container"
                >
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
                        Vulnerability Overview
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={securityPie}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={4}
                                dataKey="value"
                            >
                                {securityPie.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                        {securityPie.map((item) => (
                            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                                <span style={{ color: 'var(--text-secondary)' }}>{item.name}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Deployment Chart & Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Deployment History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="chart-container"
                >
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
                        Deployment Activity (7 days)
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={deploymentData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                            <YAxis stroke="#64748b" fontSize={11} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="success" fill="#10b981" radius={[4, 4, 0, 0]} name="Success" />
                            <Bar dataKey="failed" fill="#ef4444" radius={[4, 4, 0, 0]} name="Failed" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="chart-container"
                >
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
                        Recent Activity
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {recentActivity.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + i * 0.05 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '10px 14px',
                                    borderRadius: 10,
                                    background: 'rgba(17, 24, 39, 0.5)',
                                    border: '1px solid rgba(42, 48, 80, 0.3)',
                                }}
                            >
                                <span style={{ fontSize: 18 }}>{item.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: 13, fontWeight: 500 }}>{item.action}</p>
                                    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.time}</p>
                                </div>
                                <span className={`status-dot ${item.status}`} />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
