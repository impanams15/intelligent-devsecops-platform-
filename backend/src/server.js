// ─────────────────────────────────────────────────
// Express Server Entry Point
// Main application setup with middleware and routes
// ─────────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const si = require('systeminformation');
const os = require('os');
const ServerMetric = require('./models/ServerMetric');
const Deployment = require('./models/Deployment'); // To create some starting real data
const SecurityScan = require('./models/SecurityScan');

const http = require('http');
const { Server } = require('socket.io');
const MonitorService = require('./services/monitorService');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Initialize Monitor Service
const monitor = new MonitorService(io);
app.set('monitor', monitor);

// ─── Connect to Database ─────────────────────────
connectDB();

// ─── Security Middleware ─────────────────────────
app.use(helmet()); // Set security HTTP headers

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: { success: false, message: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// ─── General Middleware ──────────────────────────
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging (only in development)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ─── API Routes ──────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/deployments', require('./routes/deployments'));
app.use('/api/pipelines', require('./routes/pipelines'));
app.use('/api/security', require('./routes/security'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/metrics', require('./routes/metrics'));

// ─── Health Check ────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'DevSecOps API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ─── Prometheus Metrics Endpoint ─────────────────
app.get('/metrics', async (req, res) => {
    try {
        const monitor = app.get('monitor');
        res.set('Content-Type', monitor.getRegistry().contentType);
        res.end(await monitor.getRegistry().metrics());
    } catch (err) {
        res.status(500).end(err);
    }
});

// ─── 404 Handler ─────────────────────────────────
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// ─── Global Error Handler ────────────────────────
app.use((err, req, res, next) => {
    console.error('💥 Error:', err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ─── Start Server ────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════╗
║     🚀 DevSecOps API Server (REAL-TIME)         ║
║     Running on port: ${PORT}                        ║
║     WebSockets: Active                           ║
║     Health: http://localhost:${PORT}/api/health      ║
╚══════════════════════════════════════════════════╝
  `);
});

module.exports = app;
