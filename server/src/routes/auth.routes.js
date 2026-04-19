// ============================================================
//  auth.routes.js — Authentication Routes
//
//  All routes here are prefixed with /api/auth (set in app.js)
//
//  Public routes  → No token needed
//  Private routes → Requires protect middleware
// ============================================================

const express    = require("express");
const router     = express.Router();

const { register, login, getMe, logout } = require("../controllers/auth.controller");
const { protect }     = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimit");

// ---- Public Routes ----
// authLimiter → max 10 attempts per 15 minutes (prevents brute force)

// POST /api/auth/register
router.post("/register", authLimiter, register);

// POST /api/auth/login
router.post("/login", authLimiter, login);

// ---- Private Routes ----
// protect → must send valid JWT token in Authorization header

// GET /api/auth/me   → Get my profile
router.get("/me", protect, getMe);

// POST /api/auth/logout
router.post("/logout", protect, logout);

module.exports = router;