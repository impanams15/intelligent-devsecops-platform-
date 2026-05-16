// Container Status Page
import { motion } from 'framer-motion';
import { HiOutlineChip, HiOutlinePlay, HiOutlineStop } from 'react-icons/hi';

const containers = [
    { id: 'c1a2b3', name: 'frontend-app', image: 'devsecops/frontend:latest', status: 'running', cpu: '2.3%', memory: '128MB / 512MB', ports: '3000:3000', uptime: '3d 14h', health: 'healthy' },
    { id: 'd4e5f6', name: 'backend-api', image: 'devsecops/backend:latest', status: 'running', cpu: '5.1%', memory: '256MB / 1GB', ports: '5000:5000', uptime: '3d 14h', health: 'healthy' },
    { id: 'g7h8i9', name: 'mongodb', image: 'mongo:7', status: 'running', cpu: '3.8%', memory: '512MB / 2GB', ports: '27017:27017', uptime: '5d 2h', health: 'healthy' },
    { id: 'j1k2l3', name: 'redis-cache', image: 'redis:7-alpine', status: 'running', cpu: '0.5%', memory: '64MB / 256MB', ports: '6379:6379', uptime: '5d 2h', health: 'healthy' },
    { id: 'm4n5o6', name: 'nginx-proxy', image: 'nginx:alpine', status: 'running', cpu: '0.2%', memory: '32MB / 128MB', ports: '80:80, 443:443', uptime: '5d 2h', health: 'healthy' },
    { id: 'p7q8r9', name: 'prometheus', image: 'prom/prometheus:latest', status: 'running', cpu: '1.2%', memory: '256MB / 512MB', ports: '9090:9090', uptime: '3d 14h', health: 'healthy' },
    { id: 's1t2u3', name: 'grafana', image: 'grafana/grafana:latest', status: 'running', cpu: '0.8%', memory: '128MB / 512MB', ports: '3001:3000', uptime: '3d 14h', health: 'healthy' },
    { id: 'v4w5x6', name: 'ai-service', image: 'devsecops/ai:latest', status: 'running', cpu: '8.5%', memory: '512MB / 2GB', ports: '8000:8000', uptime: '2d 6h', health: 'healthy' },
    { id: 'y7z8a9', name: 'sonarqube', image: 'sonarqube:lts', status: 'stopped', cpu: '0%', memory: '0MB / 4GB', ports: '-', uptime: '-', health: 'stopped' },
];

const running = containers.filter(c => c.status === 'running').length;
const stopped = containers.filter(c => c.status === 'stopped').length;

export default function Containers() {
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
                                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.05 }}>
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
