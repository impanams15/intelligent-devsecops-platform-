// ─────────────────────────────────────────────────
// Sidebar Navigation Component
// Futuristic sidebar with animated links and icons
// ─────────────────────────────────────────────────

import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    HiOutlineViewGrid,
    HiOutlineServer,
    HiOutlineShieldCheck,
    HiOutlineLightningBolt,
    HiOutlineBell,
    HiOutlineCode,
    HiOutlineCog,
    HiOutlineLogout,
    HiOutlineChip,
} from 'react-icons/hi';

const navItems = [
    { path: '/', icon: HiOutlineViewGrid, label: 'Dashboard' },
    { path: '/servers', icon: HiOutlineServer, label: 'Server Health' },
    { path: '/pipelines', icon: HiOutlineCode, label: 'CI/CD Pipelines' },
    { path: '/security', icon: HiOutlineShieldCheck, label: 'Security' },
    { path: '/ai-threats', icon: HiOutlineLightningBolt, label: 'AI Threats' },
    { path: '/alerts', icon: HiOutlineBell, label: 'Notifications' },
    { path: '/containers', icon: HiOutlineChip, label: 'Containers' },
    { path: '/settings', icon: HiOutlineCog, label: 'Settings' },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="sidebar"
            style={{
                width: 260,
                height: '100vh',
                position: 'fixed',
                top: 0,
                left: 0,
                display: 'flex',
                flexDirection: 'column',
                zIndex: 50,
                overflow: 'hidden',
            }}
        >
            {/* Logo */}
            <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                    }}>
                        🛡️
                    </div>
                    <div>
                        <h1 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }} className="gradient-text">
                            DevSecOps
                        </h1>
                        <p style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Intelligence Platform
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
                <p style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    padding: '0 20px',
                    marginBottom: 8,
                }}>
                    Menu
                </p>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User Profile */}
            <div style={{
                padding: '16px 20px',
                borderTop: '1px solid var(--border-color)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 700,
                        color: 'white',
                    }}>
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{user?.name || 'User'}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{user?.role || 'developer'}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 16px',
                        borderRadius: 10,
                        border: '1px solid var(--border-color)',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: 13,
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.borderColor = 'var(--accent-red)';
                        e.target.style.color = 'var(--accent-red)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.borderColor = 'var(--border-color)';
                        e.target.style.color = 'var(--text-secondary)';
                    }}
                >
                    <HiOutlineLogout size={16} />
                    Sign Out
                </button>
            </div>
        </motion.aside>
    );
}
