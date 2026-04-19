// ============================================================
//  middleware/auth.js — JWT Authentication Middleware
//
//  Protects private routes. Checks the Authorization header
//  for a valid JWT token. Attaches the user to req.user.
//
//  Usage: Add "protect" to any route that needs login.
//  Usage: Add "authorize('admin')" to restrict by role.
// ============================================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ============================================================
//  protect — Verify JWT token
//  Attach decoded user to req.user for downstream use
// ============================================================
const protect = async (req, res, next) => {
    let token;

    // Token should come in the Authorization header as:
    // "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    // No token found → reject
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authorized. Please log in first.",
        });
    }

    try {
        // Verify token with our secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by ID stored inside the token
        // We use select("+password") only when we need it — not here
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists.",
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Your account has been deactivated.",
            });
        }

        // Attach user info to the request object
        req.user = user;
        next();

    } catch (error) {
        // Token is invalid or expired
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token. Please log in again.",
        });
    }
};

// ============================================================
//  authorize — Role-based access control
//  Usage: authorize("admin", "analyst")
//  Place AFTER protect middleware in route definitions
// ============================================================
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Requires one of: [${roles.join(", ")}] role.`,
            });
        }
        next();
    };
};

module.exports = { protect, authorize };