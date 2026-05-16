// ─────────────────────────────────────────────────
// StatCard Component
// Animated metric card for dashboard overview
// ─────────────────────────────────────────────────

import { motion } from 'framer-motion';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend, delay = 0 }) {
    const colorMap = {
        blue: 'stat-card-blue',
        cyan: 'stat-card-cyan',
        purple: 'stat-card-purple',
        green: 'stat-card-green',
        red: 'stat-card-red',
        yellow: 'stat-card-yellow',
        orange: 'stat-card-orange',
    };

    const iconBgMap = {
        blue: 'rgba(59,130,246,0.15)',
        cyan: 'rgba(6,182,212,0.15)',
        purple: 'rgba(139,92,246,0.15)',
        green: 'rgba(16,185,129,0.15)',
        red: 'rgba(239,68,68,0.15)',
        yellow: 'rgba(245,158,11,0.15)',
        orange: 'rgba(249,115,22,0.15)',
    };

    const iconColorMap = {
        blue: 'var(--accent-blue)',
        cyan: 'var(--accent-cyan)',
        purple: 'var(--accent-purple)',
        green: 'var(--accent-green)',
        red: 'var(--accent-red)',
        yellow: 'var(--accent-yellow)',
        orange: 'var(--accent-orange)',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={`glass-card ${colorMap[color]}`}
            style={{ padding: '24px' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                        {title}
                    </p>
                    <h3 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, letterSpacing: '-0.02em' }}>
                        {value}
                    </h3>
                    {subtitle && (
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            {trend && (
                                <span style={{ color: trend > 0 ? 'var(--accent-green)' : 'var(--accent-red)', marginRight: 4 }}>
                                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                                </span>
                            )}
                            {subtitle}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: iconBgMap[color],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Icon size={24} color={iconColorMap[color]} />
                    </div>
                )}
            </div>
        </motion.div>
    );
}
