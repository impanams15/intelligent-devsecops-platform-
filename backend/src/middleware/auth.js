// ─────────────────────────────────────────────────
// JWT Authentication Middleware
// Protects routes by verifying JWT tokens
// ─────────────────────────────────────────────────

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes
 * Extracts JWT from Authorization header & verifies it
 */
const protect = async (req, res, next) => {
    let token;

    // Check for Bearer token in Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    // If no token found, deny access
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized - No token provided'
        });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to request object (exclude password)
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized - User not found'
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized - Invalid token'
        });
    }
};

/**
 * Middleware to restrict access by role
 * Usage: authorize('admin', 'developer')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized for this action`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
