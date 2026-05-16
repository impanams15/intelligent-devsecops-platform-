// ─────────────────────────────────────────────────
// Layout Component
// Main app layout with sidebar and content area
// ─────────────────────────────────────────────────

import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

export default function Layout() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)',
            }}>
                <div className="spinner" />
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="bg-grid" style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{
                marginLeft: 260,
                flex: 1,
                padding: '24px 32px',
                maxWidth: 'calc(100vw - 260px)',
                overflow: 'auto',
            }}>
                <Outlet />
            </main>
        </div>
    );
}
