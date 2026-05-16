// ─────────────────────────────────────────────────
// Server Health Page
// Displays server metrics, health status, and resource usage
// ─────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';
import { HiOutlineServer, HiOutlineChip, HiOutlineDatabase, HiOutlineGlobe } from 'react-icons/hi';

const servers = [
    {
        name: 'prod-api-01', host: 'api-prod-east-1.devsecops.io', status: 'healthy',
        cpu: 42, memory: 68, disk: 55, uptime: '15d 8h', containers: { running: 12, total: 14 },
        latency: 12, region: 'US-East',
    },
    {
        name: 'prod-web-01', host: 'web-prod-east-1.devsecops.io', status: 'healthy',
        cpu: 28, memory: 54, disk: 42, uptime: '15d 8h', containers: { running: 8, total: 9 },
        latency: 8, region: 'US-East',
    },
    {
        name: 'prod-db-01', host: 'db-prod-east-1.devsecops.io', status: 'warning',
        cpu: 78, memory: 82, disk: 71, uptime: '30d 2h', containers: { running: 5, total: 5 },
        latency: 3, region: 'US-East',
    },
    {
        name: 'staging-01', host: 'staging-east-1.devsecops.io', status: 'healthy',
        cpu: 35, memory: 45, disk: 38, uptime: '5d 12h', containers: { running: 6, total: 9 },
        latency: 22, region: 'US-West',
    },
];

const cpuHistory = Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    'prod-api-01': Math.round(Math.random() * 30 + 30),
    'prod-web-01': Math.round(Math.random() * 20 + 20),
    'prod-db-01': Math.round(Math.random() * 30 + 55),
    'staging-01': Math.round(Math.random() * 25 + 20),
}));

const ProgressBar = ({ value, color, label }) => (
    <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: value > 80 ? 'var(--accent-red)' : 'var(--text-primary)' }}>{value}%</span>
        </div>
        <div style={{ height: 6, background: 'rgba(42,48,80,0.5)', borderRadius: 3, overflow: 'hidden' }}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{
                    height: '100%',
                    borderRadius: 3,
                    background: value > 80 ? 'var(--accent-red)' : value > 60 ? 'var(--accent-yellow)' : color,
                }}
            />
        </div>
    </div>
);

export default function ServerHealth() {
    return (
        <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.03em' }}>
                    Server <span className="gradient-text">Health Monitor</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
                    Real-time infrastructure monitoring across all environments
                </p>
            </motion.div>

            {/* Server Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 20,
                marginBottom: 28,
            }}>
                {servers.map((server, i) => (
                    <motion.div
                        key={server.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card"
                        style={{ padding: 24 }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 12,
                                    background: server.status === 'healthy' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <HiOutlineServer size={20} color={server.status === 'healthy' ? '#10b981' : '#f59e0b'} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>{server.name}</h3>
                                    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{server.host}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className={`status-dot ${server.status}`} />
                                <span style={{
                                    fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                                    color: server.status === 'healthy' ? 'var(--accent-green)' : 'var(--accent-yellow)',
                                }}>{server.status}</span>
                            </div>
                        </div>

                        {/* Resources */}
                        <ProgressBar value={server.cpu} color="var(--accent-blue)" label="CPU Usage" />
                        <ProgressBar value={server.memory} color="var(--accent-purple)" label="Memory" />
                        <ProgressBar value={server.disk} color="var(--accent-cyan)" label="Disk" />

                        {/* Bottom Stats */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                            gap: 12, marginTop: 16, paddingTop: 16,
                            borderTop: '1px solid var(--border-color)',
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: 16, fontWeight: 700 }}>{server.containers.running}/{server.containers.total}</p>
                                <p style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Containers</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: 16, fontWeight: 700 }}>{server.latency}ms</p>
                                <p style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Latency</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: 16, fontWeight: 700 }}>{server.uptime}</p>
                                <p style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Uptime</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* CPU History Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="chart-container"
            >
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>CPU Usage Trends (24h)</h3>
                <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={cpuHistory}>
                        <defs>
                            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                            <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.2} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                            <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} /><stop offset="100%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
                            <linearGradient id="g4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                        <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} unit="%" />
                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }} />
                        <Area type="monotone" dataKey="prod-api-01" stroke="#3b82f6" fill="url(#g1)" strokeWidth={2} />
                        <Area type="monotone" dataKey="prod-web-01" stroke="#10b981" fill="url(#g2)" strokeWidth={2} />
                        <Area type="monotone" dataKey="prod-db-01" stroke="#f59e0b" fill="url(#g3)" strokeWidth={2} />
                        <Area type="monotone" dataKey="staging-01" stroke="#8b5cf6" fill="url(#g4)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </motion.div>
        </div>
    );
}
