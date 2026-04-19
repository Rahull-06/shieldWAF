// ============================================================
//  auth.controller.js — Authentication Controller
//
//  Handles: register, login, getMe, logout
//
//  All functions follow the same pattern:
//    1. Validate input
//    2. Interact with database
//    3. Send clean JSON response
// ============================================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ============================================================
//  HELPER: Generate a JWT token for a given user ID
// ============================================================
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },                  // Payload: store user ID
        process.env.JWT_SECRET,          // Secret key from .env
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
};

// ============================================================
//  HELPER: Send token response
//  Builds the standard success response with token + user info
// ============================================================
const sendTokenResponse = (user, statusCode, res, message) => {
    const token = generateToken(user._id);

    return res.status(statusCode).json({
        success: true,
        message,
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        },
    });
};

// ============================================================
//  POST /api/auth/register
//  Create a new user account
// ============================================================
const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // --- Validation ---
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide username, email, and password.",
            });
        }

        // Check if user already exists (by email or username)
        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            const field = existingUser.email === email ? "Email" : "Username";
            return res.status(409).json({
                success: false,
                message: `${field} is already registered.`,
            });
        }

        // --- Create User ---
        // Password hashing happens automatically in User model (pre-save hook)
        const user = await User.create({
            username,
            email,
            password,
            role: role || "viewer", // Default role is viewer for safety
        });

        console.log(`✅ New user registered: ${user.username} (${user.role})`);

        return sendTokenResponse(user, 201, res, "Account created successfully!");

    } catch (error) {
        // Handle Mongoose validation errors nicely
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({
                success: false,
                message: messages.join(". "),
            });
        }

        console.error("Register error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error. Please try again.",
        });
    }
};

// ============================================================
//  POST /api/auth/login
//  Authenticate user and return JWT token
// ============================================================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // --- Validation ---
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password.",
            });
        }

        // Find user — we need password here so we use .select("+password")
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            // Use generic message to avoid email enumeration attacks
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Your account has been deactivated. Contact an admin.",
            });
        }

        // Compare entered password with stored hash
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // Update last login timestamp
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        console.log(`✅ User logged in: ${user.username}`);

        return sendTokenResponse(user, 200, res, "Login successful!");

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error. Please try again.",
        });
    }
};

// ============================================================
//  GET /api/auth/me
//  Return the currently logged-in user's profile
//  Requires: protect middleware
// ============================================================
const getMe = async (req, res) => {
    try {
        // req.user is set by the protect middleware
        const user = await User.findById(req.user.id);

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
            },
        });

    } catch (error) {
        console.error("GetMe error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
};

// ============================================================
//  POST /api/auth/logout
//  For JWT, logout is handled client-side (delete the token).
//  This endpoint just sends a confirmation.
// ============================================================
const logout = (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Logged out successfully. Please delete your token.",
    });
};

module.exports = { register, login, getMe, logout };