import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineChip } from 'react-icons/hi';
import { metricsAPI } from '../services/api';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function Containers() {
    const [containers, setContainers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await metricsAPI.getContainers();
            if (res.data.success) {
                setContainers(res.data.data);
            }
        } catch (err) {
            console.error("Containers fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        socket.on('metrics_update', () => {
            // Re-fetch detailed container stats when system metrics update
            fetchData();
        });

        return () => {
            socket.off('metrics_update');
        };
    }, []);

    const running = containers.filter(c => c.status === 'running' || c.status === 'Up').length;
    const stopped = containers.filter(c => c.status !== 'running' && c.status !== 'Up').length;

    if (loading && containers.length === 0) return <div className="spinner-container"><div className="spinner"></div></div>;

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                    <span className="gradient-text">Container</span> Management
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>Docker container status and resource monitoring</p>
            </motion.div>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card stat-card-blue" style={{ padding: 20 }}>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Containers</p>
                    <p style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{containers.length}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card stat-card-green" style={{ padding: 20 }}>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Running</p>
                    <p style={{ fontSize: 28, fontWeight: 700, marginTop: 4, color: 'var(--accent-green)' }}>{running}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card stat-card-red" style={{ padding: 20 }}>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Stopped</p>
                    <p style={{ fontSize: 28, fontWeight: 700, marginTop: 4, color: 'var(--accent-red)' }}>{stopped}</p>
                </motion.div>
            </div>

            {/* Container Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="chart-container">
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr><th>Container</th><th>Image</th><th>Status</th><th>CPU</th><th>Memory</th><th>Ports</th><th>Uptime</th></tr>
                        </thead>
                        <tbody>
                            {containers.map((c, i) => (
                                <motion.tr key={c.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.05 }}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <HiOutlineChip size={16} color={c.status === 'running' ? '#10b981' : '#ef4444'} />
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</p>
                                                <p style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{c.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.image}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span className={`status-dot ${c.status}`} />
                                            <span style={{ fontSize: 12, fontWeight: 600, color: c.status === 'running' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                                {c.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.cpu}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.memory}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.ports}</td>
                                    <td style={{ fontSize: 12 }}>{c.uptime}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
