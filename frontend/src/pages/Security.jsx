// Security Dashboard Page
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HiOutlineShieldCheck, HiOutlineShieldExclamation, HiOutlineExclamation } from 'react-icons/hi';

const vulnSummary = [
    { name: 'Critical', value: 3, color: '#ef4444' },
    { name: 'High', value: 8, color: '#f97316' },
    { name: 'Medium', value: 15, color: '#f59e0b' },
    { name: 'Low', value: 24, color: '#10b981' },
];

const scanHistory = [
    { date: 'Week 1', container: 12, code: 8, dependency: 5 },
    { date: 'Week 2', container: 10, code: 6, dependency: 8 },
    { date: 'Week 3', container: 8, code: 5, dependency: 4 },
    { date: 'Week 4', container: 6, code: 3, dependency: 3 },
];

const vulnerabilities = [
    { id: 'CVE-2024-1234', title: 'SQL Injection in query parser', severity: 'critical', package: 'lodash@4.17.20', fixed: '4.17.21', status: 'open' },
    { id: 'CVE-2024-2345', title: 'XSS via unescaped output', severity: 'critical', package: 'express@4.17.1', fixed: '4.18.0', status: 'open' },
    { id: 'CVE-2024-3456', title: 'Buffer overflow in parser', severity: 'critical', package: 'jsonwebtoken@8.5.1', fixed: '9.0.0', status: 'patching' },
    { id: 'CVE-2024-4567', title: 'Prototype pollution', severity: 'high', package: 'lodash@4.17.20', fixed: '4.17.21', status: 'open' },
    { id: 'CVE-2024-5678', title: 'CSRF token bypass', severity: 'high', package: 'axios@0.21.0', fixed: '0.21.1', status: 'resolved' },
    { id: 'CVE-2024-6789', title: 'Path traversal vulnerability', severity: 'medium', package: 'express@4.17.1', fixed: '4.18.0', status: 'open' },
    { id: 'CVE-2024-7890', title: 'Weak cipher usage', severity: 'medium', package: 'crypto-js@4.0.0', fixed: '4.1.0', status: 'resolved' },
    { id: 'CVE-2024-8901', title: 'Information disclosure', severity: 'low', package: 'helmet@4.6.0', fixed: '5.0.0', status: 'open' },
];

const recommendations = [
    { text: 'Update lodash to v4.17.21 to fix 2 critical vulnerabilities', priority: 'critical' },
    { text: 'Enable Content Security Policy headers', priority: 'high' },
    { text: 'Implement rate limiting on authentication endpoints', priority: 'high' },
    { text: 'Enable audit logging for all admin actions', priority: 'medium' },
    { text: 'Rotate API keys and secrets every 90 days', priority: 'medium' },
];

export default function Security() {
    return (
        <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                    Security <span className="gradient-text">Dashboard</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>Vulnerability reports, risk assessment, and security recommendations</p>
            </motion.div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                {[
                    { label: 'Total Scans', value: '32', color: 'var(--accent-blue)', border: 'stat-card-blue' },
                    { label: 'Critical', value: '3', color: 'var(--accent-red)', border: 'stat-card-red' },
                    { label: 'Open Issues', value: '26', color: 'var(--accent-yellow)', border: 'stat-card-yellow' },
                    { label: 'Resolved', value: '18', color: 'var(--accent-green)', border: 'stat-card-green' },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`glass-card ${s.border}`} style={{ padding: 20 }}>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                        <p style={{ fontSize: 28, fontWeight: 700, marginTop: 4, color: s.color }}>{s.value}</p>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
                {/* Vulnerability Pie */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="chart-container">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Vulnerability Breakdown</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart><Pie data={vulnSummary} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                            {vulnSummary.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie><Tooltip /></PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
                        {vulnSummary.map(v => (
                            <div key={v.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: v.color }} /><span style={{ color: 'var(--text-secondary)' }}>{v.name}: {v.value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Scan Trend */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="chart-container">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Scan Trends</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={scanHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={11} /><YAxis stroke="#64748b" fontSize={11} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }} />
                            <Bar dataKey="container" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Container" />
                            <Bar dataKey="code" fill="#8b5cf6" radius={[3, 3, 0, 0]} name="Code" />
                            <Bar dataKey="dependency" fill="#06b6d4" radius={[3, 3, 0, 0]} name="Dependency" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Vulnerability Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="chart-container" style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Vulnerability Report</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead><tr><th>CVE ID</th><th>Title</th><th>Severity</th><th>Package</th><th>Fix</th><th>Status</th></tr></thead>
                        <tbody>
                            {vulnerabilities.map(v => (
                                <tr key={v.id}>
                                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--accent-blue)' }}>{v.id}</td>
                                    <td>{v.title}</td>
                                    <td><span className={`severity-${v.severity}`} style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{v.severity}</span></td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{v.package}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--accent-green)' }}>{v.fixed}</td>
                                    <td><span style={{ fontSize: 11, fontWeight: 600, color: v.status === 'resolved' ? 'var(--accent-green)' : v.status === 'patching' ? 'var(--accent-yellow)' : 'var(--accent-red)' }}>{v.status.toUpperCase()}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Recommendations */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="chart-container">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🛡️ Security Recommendations</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {recommendations.map((r, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: 'rgba(17,24,39,0.5)', border: '1px solid rgba(42,48,80,0.3)' }}>
                            <span className={`severity-${r.priority}`} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{r.priority}</span>
                            <span style={{ fontSize: 13 }}>{r.text}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
