import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HiOutlineServer, HiOutlineChip, HiOutlineDatabase, HiOutlineClock } from 'react-icons/hi';
import { metricsAPI } from '../services/api';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const socket = io('http://localhost:5000');

const ProgressBar = ({ value = 0, color, label, suffix = '%' }) => {
    const safeValue = isNaN(value) ? 0 : value;
    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: safeValue > 80 ? 'var(--accent-red)' : 'var(--text-primary)' }}>{Number(safeValue).toFixed(1)}{suffix}</span>
            </div>
            <div style={{ height: 6, background: 'rgba(42,48,80,0.5)', borderRadius: 3, overflow: 'hidden' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(safeValue, 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{
                        height: '100%',
                        borderRadius: 3,
                        background: safeValue > 80 ? 'var(--accent-red)' : safeValue > 60 ? 'var(--accent-yellow)' : color,
                    }}
                />
            </div>
        </div>
    );
};

function ServerHealth() {
    const [server, setServer] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [healthRes, historyRes] = await Promise.all([
                metricsAPI.getServer(),
                metricsAPI.getHistory()
            ]);

            if (healthRes.data?.success) {
                setServer(healthRes.data.data);
            }
            if (historyRes.data?.success) {
                setHistory(historyRes.data.data.map(h => ({
                    ...h,
                    time: h.timestamp ? new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '00:00',
                    cpu: h.cpu?.usage || 0,
                    memory: h.memory?.percentage || 0
                })));
            }
        } catch (err) {
            console.error("ServerHealth fetch error:", err);
            toast.error("Failed to fetch server metrics from backend.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        socket.on('metrics_update', (data) => {
            if (!data) return;
            setServer(data);
            setHistory(prev => {
                const newData = [...prev, {
                    ...data,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    cpu: data.cpu?.usage || 0,
                    memory: data.memory?.percentage || 0
                }];
                return newData.slice(-30);
            });
        });

        return () => {
            socket.off('metrics_update');
        };
    }, []);

    const currentServer = {
        serverName: server?.serverName || 'Main Cluster',
        hostname: server?.hostname || 'localhost',
        status: (server?.status || 'healthy').toLowerCase(),
        cpu: server?.cpu || { usage: 0 },
        memory: server?.memory || { percentage: 0 },
        disk: server?.disk || { percentage: 0 },
        uptime: server?.uptime || 0,
        containers: server?.containers || { running: 0, total: 0 }
    };

    if (loading && !server) return <div className="spinner-container"><div className="spinner"></div></div>;

    const uptimeStr = `${Math.floor(currentServer.uptime / 3600)}h ${Math.floor((currentServer.uptime % 3600) / 60)}m`;

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                    Server <span className="gradient-text">Health Monitor</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
                    Real-time infrastructure monitoring for {currentServer.hostname}
                </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <HiOutlineServer size={24} color="var(--accent-blue)" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: 18, fontWeight: 700 }}>{currentServer.serverName}</h3>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{currentServer.hostname}</p>
                            </div>
                        </div>
                        <span className={`status-badge ${currentServer.status}`} style={{ padding: '4px 12px', fontSize: 12 }}>{currentServer.status.toUpperCase()}</span>
                    </div>

                    <ProgressBar value={currentServer.cpu.usage} color="var(--accent-blue)" label="CPU Usage" />
                    <ProgressBar value={currentServer.memory.percentage} color="var(--accent-purple)" label="Memory Usage" />
                    <ProgressBar value={currentServer.disk.percentage} color="var(--accent-cyan)" label="Disk Space" />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--accent-blue)', marginBottom: 4 }}>
                                <HiOutlineChip size={14} />
                                <span style={{ fontSize: 16, fontWeight: 700 }}>{currentServer.containers.running}/{currentServer.containers.total}</span>
                            </div>
                            <p style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Docker Nodes</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--accent-cyan)', marginBottom: 4 }}>
                                <HiOutlineDatabase size={14} />
                                <span style={{ fontSize: 16, fontWeight: 700 }}>{currentServer.memory.available || '0'}MB</span>
                            </div>
                            <p style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Free RAM</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--accent-purple)', marginBottom: 4 }}>
                                <HiOutlineClock size={14} />
                                <span style={{ fontSize: 16, fontWeight: 700 }}>{uptimeStr}</span>
                            </div>
                            <p style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>System Uptime</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="chart-container" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Live Performance Graph</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={history}>
                            <defs>
                                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3} /><stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} /></linearGradient>
                                <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--accent-purple)" stopOpacity={0.2} /><stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0} /></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={10} tickLine={false} />
                            <YAxis stroke="var(--text-secondary)" fontSize={10} tickLine={false} unit="%" />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                            <Area type="monotone" dataKey="cpu" stroke="var(--accent-blue)" fill="url(#colorCpu)" strokeWidth={2} name="CPU Load" />
                            <Area type="monotone" dataKey="memory" stroke="var(--accent-purple)" fill="url(#colorMem)" strokeWidth={2} name="Memory Use" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>
        </div>
    );
}

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return <div style={{ padding: 40, color: 'red' }}><h1>Frontend Crash!</h1><p>{this.state.error?.toString()}</p></div>;
        }
        return this.props.children;
    }
}

export default function SafeServerHealth() {
    return <ErrorBoundary><ServerHealth /></ErrorBoundary>;
}
