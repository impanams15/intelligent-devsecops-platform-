// Main App Component with React Router
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ServerHealth from './pages/ServerHealth';
import Pipelines from './pages/Pipelines';
import Security from './pages/Security';
import AIThreats from './pages/AIThreats';
import Alerts from './pages/Alerts';
import Containers from './pages/Containers';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="servers" element={<ServerHealth />} />
            <Route path="pipelines" element={<Pipelines />} />
            <Route path="security" element={<Security />} />
            <Route path="ai-threats" element={<AIThreats />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="containers" element={<Containers />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
