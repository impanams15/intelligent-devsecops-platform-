// ─────────────────────────────────────────────────
// API Service
// Centralized Axios instance with interceptors
// ─────────────────────────────────────────────────

import axios from 'axios';

// Create Axios instance with default config
const API = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor — attach JWT token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('devsecops_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('devsecops_token');
            localStorage.removeItem('devsecops_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ─── Auth API ────────────────────────────────────
export const authAPI = {
    login: (data) => API.post('/auth/login', data),
    register: (data) => API.post('/auth/register', data),
    getMe: () => API.get('/auth/me'),
};

// ─── Deployments API ─────────────────────────────
export const deploymentsAPI = {
    getAll: (params) => API.get('/deployments', { params }),
    create: (data) => API.post('/deployments', data),
    getStats: () => API.get('/deployments/stats'),
    updateStatus: (id, status) => API.put(`/deployments/${id}/status`, { status }),
};

// ─── Pipelines API ───────────────────────────────
export const pipelinesAPI = {
    getAll: (params) => API.get('/pipelines', { params }),
    create: (data) => API.post('/pipelines', data),
    getStats: () => API.get('/pipelines/stats'),
    update: (id, data) => API.put(`/pipelines/${id}`, data),
};

// ─── Security API ────────────────────────────────
export const securityAPI = {
    getScans: () => API.get('/security/scans'),
    createScan: (data) => API.post('/security/scans', data),
    getStats: () => API.get('/security/stats'),
};

// ─── Alerts API ──────────────────────────────────
export const alertsAPI = {
    getAll: (params) => API.get('/alerts', { params }),
    create: (data) => API.post('/alerts', data),
    acknowledge: (id) => API.put(`/alerts/${id}/acknowledge`),
    resolve: (id) => API.put(`/alerts/${id}/resolve`),
    getStats: () => API.get('/alerts/stats'),
};

// ─── Metrics API ─────────────────────────────────
export const metricsAPI = {
    getServer: () => API.get('/metrics/server'),
    getHistory: () => API.get('/metrics/history'),
    getContainers: () => API.get('/metrics/containers'),
};

// ─── Health API ──────────────────────────────────
export const healthAPI = {
    check: () => API.get('/health'),
};

export default API;
