// PATH: server/src/controllers/auth.controller.js
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'shieldwaf_dev_secret'
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d'

function signToken(userId, role) {
    return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
}

// POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password)
            return res.status(400).json({ message: 'Name, email and password are required.' })
        if (password.length < 6)
            return res.status(400).json({ message: 'Password must be at least 6 characters.' })
        const existing = await User.findOne({ email: email.toLowerCase().trim() })
        if (existing)
            return res.status(409).json({ message: 'An account with this email already exists.' })

        // password is plain text here — User model pre('save') hashes it automatically
        const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password, role: 'user' })
        const token = signToken(user._id, user.role)
        return res.status(201).json({ token, user })
    } catch (err) {
        if (err.code === 11000)
            return res.status(409).json({ message: 'An account with this email already exists.' })
        if (err.name === 'ValidationError')
            return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(', ') })
        console.error('[register]', err)
        return res.status(500).json({ message: 'Server error. Please try again.' })
    }
}

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password are required.' })

        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')
        if (!user)
            return res.status(401).json({ message: 'Invalid email or password.' })
        if (!user.isActive)
            return res.status(403).json({ message: 'Account deactivated. Contact admin.' })

        const isMatch = await user.comparePassword(password)
        if (!isMatch)
            return res.status(401).json({ message: 'Invalid email or password.' })

        const token = signToken(user._id, user.role)
        return res.status(200).json({ token, user })
    } catch (err) {
        console.error('[login]', err)
        return res.status(500).json({ message: 'Server error. Please try again.' })
    }
}

// GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id || req.user.id).select('-password')
        if (!user) return res.status(404).json({ message: 'User not found.' })
        return res.status(200).json({ user })
    } catch (err) {
        console.error('[getMe]', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// PATCH /api/auth/me
exports.updateMe = async (req, res) => {
    try {
        const { name, email, avatar } = req.body
        const updates = {}
        if (name) updates.name = name.trim()
        if (email) updates.email = email.toLowerCase().trim()
        if (avatar) updates.avatar = avatar

        if (updates.email) {
            const existing = await User.findOne({ email: updates.email })
            if (existing && String(existing._id) !== String(req.user._id))
                return res.status(409).json({ message: 'Email already in use.' })
        }

        const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true }).select('-password')
        if (!user) return res.status(404).json({ message: 'User not found.' })
        return res.status(200).json({ user })
    } catch (err) {
        console.error('[updateMe]', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// PATCH /api/auth/change-password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body
        if (!currentPassword || !newPassword)
            return res.status(400).json({ message: 'Both current and new password required.' })
        if (newPassword.length < 6)
            return res.status(400).json({ message: 'New password must be at least 6 characters.' })

        const user = await User.findById(req.user._id).select('+password')
        const ok = await user.comparePassword(currentPassword)
        if (!ok) return res.status(401).json({ message: 'Current password is incorrect.' })

        user.password = newPassword  // pre('save') will re-hash
        await user.save()
        return res.status(200).json({ message: 'Password updated successfully.' })
    } catch (err) {
        console.error('[changePassword]', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// POST /api/auth/logout
exports.logout = async (_req, res) => {
    return res.status(200).json({ message: 'Logged out successfully.' })
}