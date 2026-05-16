// ─────────────────────────────────────────────────
// Login Page
// Futuristic authentication page with animated form
// ─────────────────────────────────────────────────

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineShieldCheck } from 'react-icons/hi';

export default function Login() {
    const [email, setEmail] = useState('admin@devsecops.io');
    const [password, setPassword] = useState('admin123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="login-bg">
            {/* Background decorations */}
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '10%',
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
                filter: 'blur(40px)',
            }} />
            <div style={{
                position: 'absolute',
                bottom: '15%',
                right: '10%',
                width: 400,
                height: 400,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
                filter: 'blur(60px)',
            }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                    width: '100%',
                    maxWidth: 440,
                    padding: '0 20px',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {/* Logo */}
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{ textAlign: 'center', marginBottom: 32 }}
                >
                    <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: 28,
                        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                    }}>
                        🛡️
                    </div>
                    <h1 className="gradient-text" style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                        DevSecOps Platform
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                        Intelligent Deployment, Monitoring & Threat Detection
                    </p>
                </motion.div>

                {/* Login Form */}
                <div className="glass-card" style={{ padding: '36px 32px' }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Welcome back</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 28 }}>
                        Sign in to your account to continue
                    </p>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: 10,
                                padding: '12px 16px',
                                marginBottom: 20,
                                fontSize: 13,
                                color: '#fca5a5',
                            }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <HiOutlineMail size={18} style={{
                                    position: 'absolute',
                                    left: 14,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-secondary)',
                                }} />
                                <input
                                    type="email"
                                    className="input-field"
                                    style={{ paddingLeft: 42 }}
                                    placeholder="admin@devsecops.io"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 28 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <HiOutlineLockClosed size={18} style={{
                                    position: 'absolute',
                                    left: 14,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-secondary)',
                                }} />
                                <input
                                    type="password"
                                    className="input-field"
                                    style={{ paddingLeft: 42 }}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                opacity: loading ? 0.7 : 1,
                            }}
                        >
                            {loading ? (
                                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                            ) : (
                                <>
                                    <HiOutlineShieldCheck size={18} />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>
                            Create one
                        </Link>
                    </p>
                </div>

                {/* Demo credentials */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        marginTop: 20,
                        padding: '14px 20px',
                        borderRadius: 12,
                        background: 'rgba(59, 130, 246, 0.08)',
                        border: '1px solid rgba(59, 130, 246, 0.15)',
                        fontSize: 12,
                        color: 'var(--text-secondary)',
                        textAlign: 'center',
                    }}
                >
                    <strong style={{ color: 'var(--accent-blue)' }}>Demo:</strong> admin@devsecops.io / admin123
                </motion.div>
            </motion.div>
        </div>
    );
}
