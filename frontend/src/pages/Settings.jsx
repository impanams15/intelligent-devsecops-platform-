// ─────────────────────────────────────────────────
// Settings Page
// User preferences, account management, and API keys
// ─────────────────────────────────────────────────

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineBell, HiOutlineKey, HiOutlineDesktopComputer } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Profile', icon: HiOutlineUser },
        { id: 'security', label: 'Security', icon: HiOutlineLockClosed },
        { id: 'notifications', label: 'Notifications', icon: HiOutlineBell },
        { id: 'api', label: 'API Keys', icon: HiOutlineKey },
        { id: 'appearance', label: 'Appearance', icon: HiOutlineDesktopComputer },
    ];

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                    Platform <span className="gradient-text">Settings</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
                    Manage your account preferences and security configurations
                </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32 }}>
                {/* Tabs Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 16px',
                                borderRadius: 10,
                                background: activeTab === tab.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                border: '1px solid',
                                borderColor: activeTab === tab.id ? 'var(--accent-blue)' : 'transparent',
                                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 500,
                                textAlign: 'left',
                                transition: 'all 0.2s',
                            }}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="glass-card" style={{ padding: 32 }}>
                    {activeTab === 'profile' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Profile Information</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 500 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Full Name</label>
                                    <input type="text" className="input-field" defaultValue={user?.name || ''} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Email Address</label>
                                    <input type="email" className="input-field" defaultValue={user?.email || ''} disabled />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Role</label>
                                    <input type="text" className="input-field" defaultValue={user?.role || 'Developer'} disabled />
                                </div>
                                <button className="btn-primary" style={{ width: 'fit-content', marginTop: 8 }}>
                                    Update Profile
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Security Settings</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 500 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Current Password</label>
                                    <input type="password" className="input-field" placeholder="••••••••" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>New Password</label>
                                    <input type="password" className="input-field" placeholder="Enter new password" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Confirm New Password</label>
                                    <input type="password" className="input-field" placeholder="Confirm new password" />
                                </div>
                                <div style={{
                                    padding: 16,
                                    borderRadius: 10,
                                    background: 'rgba(245, 158, 11, 0.05)',
                                    border: '1px solid rgba(245, 158, 11, 0.2)',
                                    marginBottom: 8
                                }}>
                                    <p style={{ fontSize: 13, color: '#fcd34d', lineHeight: 1.5 }}>
                                        <strong>Two-Factor Authentication:</strong> Recommended for enhanced account security.
                                    </p>
                                </div>
                                <button className="btn-primary" style={{ width: 'fit-content' }}>
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'api' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Personal Access Tokens</h3>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
                                Use these tokens to authenticate with the DevSecOps Platform CLI and REST API.
                            </p>
                            <div className="glass-card" style={{ background: 'rgba(10, 14, 26, 0.4)', padding: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 600 }}>Default API Token</p>
                                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Created 12 days ago • Expires in 180 days</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12 }}>Revoke</button>
                                        <button style={{ padding: '6px 12px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid var(--accent-blue)', borderRadius: 6, color: 'var(--accent-blue)', cursor: 'pointer', fontSize: 12 }}>Copy ID</button>
                                    </div>
                                </div>
                            </div>
                            <button className="btn-primary" style={{ marginTop: 24 }}>
                                Generate New Token
                            </button>
                        </motion.div>
                    )}

                    {(activeTab === 'notifications' || activeTab === 'appearance') && (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <p style={{ color: 'var(--text-secondary)' }}>This section is coming soon in the next update.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
