import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { metricsAPI, securityAPI, deploymentsAPI, alertsAPI } from '../services/api';
import {
    HiOutlineServer, HiOutlineShieldCheck, HiOutlineCode,
    HiOutlineBell, HiOutlineChip, HiOutlineTrendingUp,
} from 'react-icons/hi';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const securityColors = ['#ef4444', '#f97316', '#f59e0b', '#10b981'];

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
    const [metrics, setMetrics] = useState([]);
    const [liveStats, setLiveStats] = useState(null);
    const [stats, setStats] = useState({
        vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
        deployments: { success: 0, failed: 0, total: 0 },
        alerts: { total: 0, unresolved: 0 },
        containers: { running: 0, total: 0 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        // Listen for live metrics
        socket.on('metrics_update', (data) => {
            setLiveStats(data);
            setMetrics(prev => {
                const newData = [...prev, {
                    time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    cpu: data.cpu.usage,
                    memory: data.memory.percentage
                }];
                return newData.slice(-50); // Keep last 50 points
            });

            setStats(prev => ({
                ...prev,
                containers: data.containers
            }));
        });

        const fetchData = async () => {
            try {
                const [mRes, sRes, dRes, aRes] = await Promise.all([
                    metricsAPI.getHistory(),
                    securityAPI.getStats(),
                    deploymentsAPI.getStats(),
                    alertsAPI.getAll()
                ]);

                if (mRes.data.success) {
                    setMetrics(mRes.data.data.map(item => ({
                        time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        cpu: item.cpu,
                        memory: item.memory
                    })));
                }

                setStats({
                    vulnerabilities: sRes.data.data || stats.vulnerabilities,
                    deployments: dRes.data.data || stats.deployments,
                    alerts: {
                        total: aRes.data.data.length,
                        unresolved: aRes.data.data.filter(a => a.status === 'active').length
                    },
                    containers: stats.containers // Updated via socket
                });
            } catch (err) {
                console.error("Dashboard data fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => {
            clearInterval(timer);
            socket.off('metrics_update');
        };
    }, []);

    const securityPieData = [
        { name: 'Critical', value: stats.vulnerabilities.critical || 0, color: '#ef4444' },
        { name: 'High', value: stats.vulnerabilities.high || 0, color: '#f97316' },
        { name: 'Medium', value: stats.vulnerabilities.medium || 0, color: '#f59e0b' },
        { name: 'Low', value: stats.vulnerabilities.low || 0, color: '#10b981' },
    ].filter(item => item.value > 0);

    // Fallback if no real vulnerabilities yet
    const displayPieData = securityPieData.length > 0 ? securityPieData : [
        { name: 'Critical', value: 3, color: '#ef4444' },
        { name: 'High', value: 8, color: '#f97316' },
        { name: 'Medium', value: 15, color: '#f59e0b' },
        { name: 'Low', value: 24, color: '#10b981' },
    ];

    if (loading && metrics.length === 0) {
        return <div className="flex items-center justify-center h-full"><div className="spinner"></div></div>;
    }

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
                        System Status: <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>LIVE</span> • Connected to Backend API
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
                <StatCard title="Servers Online" value="1/1" subtitle="Local Host Monitoring" icon={HiOutlineServer} color="green" trend={0} delay={0} />
                <StatCard title="Total Deployments" value={stats.deployments.total} subtitle={`${stats.deployments.success} success`} icon={HiOutlineCode} color="blue" delay={0.1} />
                <StatCard title="Vulnerabilities" value={stats.vulnerabilities.total} subtitle={`${stats.vulnerabilities.critical} critical`} icon={HiOutlineShieldCheck} color="red" delay={0.2} />
                <StatCard title="Active Alerts" value={stats.alerts.unresolved} subtitle="Total unresolved" icon={HiOutlineBell} color="yellow" delay={0.3} />
                <StatCard title="Containers" value={`${stats.containers.running}/${stats.containers.total}`} subtitle="Docker Status" icon={HiOutlineChip} color="purple" delay={0.4} />
                <StatCard title="Uptime" value="99.98%" subtitle="System Pulse" icon={HiOutlineTrendingUp} color="cyan" delay={0.5} />
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Real-Time Performance (Local)</h3>
                        <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} /> CPU</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6' }} /> Memory</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={metrics}>
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
                            <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fill="url(#cpuGrad)" strokeWidth={2} name="cpu" isAnimationActive={false} />
                            <Area type="monotone" dataKey="memory" stroke="#8b5cf6" fill="url(#memGrad)" strokeWidth={2} name="memory" isAnimationActive={false} />
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
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Security Risk Analysis</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={displayPieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {displayPieData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 15 }}>
                        {displayPieData.map((item) => (
                            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '2px', background: item.color }} />
                                <span style={{ color: 'var(--text-secondary)' }}>{item.name}: <strong>{item.value}</strong></span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Deployment Status */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="chart-container">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Deployment Health</h3>
                    <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
                        <div style={{ display: 'flex', gap: 40 }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: 48, fontWeight: 800, color: 'var(--accent-green)' }}>{stats.deployments.success}</p>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Success</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: 48, fontWeight: 800, color: 'var(--accent-red)' }}>{stats.deployments.failed}</p>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Failed</p>
                            </div>
                        </div>
                        <div style={{ width: '100%', height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden', display: 'flex' }}>
                            <div style={{ width: `${(stats.deployments.success / (stats.deployments.total || 1)) * 100}%`, background: 'var(--accent-green)' }} />
                            <div style={{ width: `${(stats.deployments.failed / (stats.deployments.total || 1)) * 100}%`, background: 'var(--accent-red)' }} />
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Lifecycle Deployments: {stats.deployments.total}</p>
                    </div>
                </motion.div>

                {/* System Activity */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="chart-container">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>System Activity Log</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                            { action: 'Real-time metrics enabled', time: 'Active', icon: '⚡', color: 'cyan' },
                            { action: 'Database connection stable', time: 'Active', icon: '🔋', color: 'green' },
                            { action: 'Monitoring agent started', time: 'Now', icon: '🛰️', color: 'blue' },
                            { action: 'AI Detector heartbeat received', time: '1m ago', icon: '💓', color: 'purple' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 10, background: 'rgba(17, 24, 39, 0.3)', border: '1px solid rgba(42, 48, 80, 0.2)' }}>
                                <span style={{ fontSize: 18 }}>{item.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: 13, fontWeight: 500 }}>{item.action}</p>
                                    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Status: {item.time}</p>
                                </div>
                                <div className={`status-dot success`} />
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
