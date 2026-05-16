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

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

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
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
app.get('/metrics', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(`
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} ${Math.floor(Math.random() * 10000)}
http_requests_total{method="POST",status="200"} ${Math.floor(Math.random() * 5000)}
http_requests_total{method="POST",status="401"} ${Math.floor(Math.random() * 100)}

# HELP http_request_duration_seconds HTTP request duration in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.1"} ${Math.floor(Math.random() * 8000)}
http_request_duration_seconds_bucket{le="0.5"} ${Math.floor(Math.random() * 9000)}
http_request_duration_seconds_bucket{le="1.0"} ${Math.floor(Math.random() * 9500)}

# HELP nodejs_heap_size_total_bytes Process heap size from Node.js
# TYPE nodejs_heap_size_total_bytes gauge
nodejs_heap_size_total_bytes ${process.memoryUsage().heapTotal}

# HELP nodejs_heap_size_used_bytes Process heap size used from Node.js
# TYPE nodejs_heap_size_used_bytes gauge
nodejs_heap_size_used_bytes ${process.memoryUsage().heapUsed}
  `.trim());
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
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════╗
║     🚀 DevSecOps API Server                     ║
║     Running on port: ${PORT}                        ║
║     Environment: ${process.env.NODE_ENV || 'development'}                 ║
║     Health: http://localhost:${PORT}/api/health      ║
╚══════════════════════════════════════════════════╝
  `);
});

module.exports = app;
