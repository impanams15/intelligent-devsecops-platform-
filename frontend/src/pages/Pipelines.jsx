import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { HiOutlineCode, HiOutlineCheck, HiOutlineX, HiOutlineClock, HiOutlinePlay } from 'react-icons/hi';

const pipelines = [
    {
        id: 1, name: 'Build #1012', repo: 'devsecops/frontend-app', branch: 'main',
        status: 'success', duration: '3m 24s', time: '5 min ago',
        commit: 'feat: add dashboard charts', author: 'Admin User',
        stages: [
            { name: 'Checkout', status: 'success', duration: '5s' },
            { name: 'Install', status: 'success', duration: '45s' },
            { name: 'Lint', status: 'success', duration: '12s' },
            { name: 'Test', status: 'success', duration: '30s' },
            { name: 'Security', status: 'success', duration: '25s' },
            { name: 'Build', status: 'success', duration: '60s' },
            { name: 'Deploy', status: 'success', duration: '45s' },
        ]
    },
    {
        id: 2, name: 'Build #1011', repo: 'devsecops/backend-api', branch: 'feature/auth',
        status: 'failed', duration: '2m 10s', time: '25 min ago',
        commit: 'fix: resolve auth middleware bug', author: 'Dev User',
        stages: [
            { name: 'Checkout', status: 'success', duration: '4s' },
            { name: 'Install', status: 'success', duration: '38s' },
            { name: 'Lint', status: 'success', duration: '8s' },
            { name: 'Test', status: 'failed', duration: '42s' },
            { name: 'Security', status: 'skipped', duration: '-' },
            { name: 'Build', status: 'skipped', duration: '-' },
            { name: 'Deploy', status: 'skipped', duration: '-' },
        ]
    },
    {
        id: 3, name: 'Build #1010', repo: 'devsecops/ai-service', branch: 'main',
        status: 'running', duration: '1m 45s', time: '30 min ago',
        commit: 'chore: update anomaly detection', author: 'Admin User',
        stages: [
            { name: 'Checkout', status: 'success', duration: '3s' },
            { name: 'Install', status: 'success', duration: '25s' },
            { name: 'Lint', status: 'success', duration: '6s' },
            { name: 'Test', status: 'success', duration: '28s' },
            { name: 'Security', status: 'running', duration: '...' },
            { name: 'Build', status: 'pending', duration: '-' },
            { name: 'Deploy', status: 'pending', duration: '-' },
        ]
    }
];

const dailyStats = [
    { day: 'Mon', success: 8, failed: 1 },
    { day: 'Tue', success: 12, failed: 2 },
    { day: 'Wed', success: 6, failed: 0 },
    { day: 'Thu', success: 15, failed: 3 },
    { day: 'Fri', success: 10, failed: 1 },
];

const statusIcons = {
    success: <HiOutlineCheck size={14} />,
    failed: <HiOutlineX size={14} />,
    running: <HiOutlinePlay size={14} className="animate-spin" />,
    pending: <HiOutlineClock size={14} />,
    skipped: <span style={{ fontSize: 10 }}>⏭</span>,
};

const statusColors = {
    success: '#10b981',
    failed: '#ef4444',
    running: '#3b82f6',
    pending: '#64748b',
    skipped: '#475569',
};

export default function Pipelines() {
    const [selected, setSelected] = useState(null);

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                    CI/CD <span className="gradient-text">Pipelines</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
                    Live build monitoring and deployment history
                </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                {[
                    { label: 'Total Builds', value: '128', color: 'var(--accent-blue)' },
                    { label: 'Success Rate', value: '94.2%', color: 'var(--accent-green)' },
                    { label: 'Avg Time', value: '2m 45s', color: 'var(--accent-cyan)' },
                    { label: 'Incidents', value: '3', color: 'var(--accent-red)' },
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="glass-card" style={{ padding: '16px 20px', borderLeft: `3px solid ${stat.color}` }}>
                        <p style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{stat.label}</p>
                        <p style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {pipelines.map((pipeline, i) => (
                        <motion.div
                            key={pipeline.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            className="glass-card"
                            style={{
                                padding: 20,
                                cursor: 'pointer',
                                borderLeft: `3px solid ${statusColors[pipeline.status]}`,
                                ...(selected === pipeline.id && { borderColor: 'var(--accent-blue)', boxShadow: '0 0 20px var(--glow-blue)' })
                            }}
                            onClick={() => setSelected(selected === pipeline.id ? null : pipeline.id)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <div>
                                    <h3 style={{ fontSize: 14, fontWeight: 700 }}>{pipeline.name}</h3>
                                    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{pipeline.repo} • {pipeline.branch}</p>
                                </div>
                                <span style={{
                                    padding: '3px 10px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                                    background: `${statusColors[pipeline.status]}15`,
                                    color: statusColors[pipeline.status],
                                    border: `1px solid ${statusColors[pipeline.status]}30`,
                                }}>{pipeline.status.toUpperCase()}</span>
                            </div>

                            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                                {pipeline.stages.map((stage, j) => (
                                    <div key={j} style={{ flex: 1, height: 4, borderRadius: 2, background: statusColors[stage.status], opacity: stage.status === 'pending' ? 0.2 : 1 }} />
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                                <span>{pipeline.time}</span>
                                <span>{pipeline.duration}</span>
                            </div>

                            {selected === pipeline.id && (
                                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {pipeline.stages.map((stage, j) => (
                                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.03)' }}>
                                            <span style={{ color: statusColors[stage.status] }}>{statusIcons[stage.status]}</span>
                                            <span style={{ flex: 1, fontSize: 12 }}>{stage.name}</span>
                                            <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{stage.duration}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                <div className="chart-container" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Build Success Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dailyStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                            <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }} />
                            <Bar dataKey="success" fill="var(--accent-green)" radius={[4, 4, 0, 0]} name="Success" />
                            <Bar dataKey="failed" fill="var(--accent-red)" radius={[4, 4, 0, 0]} name="Failed" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
