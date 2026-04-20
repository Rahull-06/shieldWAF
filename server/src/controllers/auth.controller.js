const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET || 'shieldwaf_secret_key', { expiresIn: '7d' })

// ── REGISTER ──────────────────────────────────────────────────────────────────
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

        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(password, salt)

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: passwordHash,
            role: 'user',
        })

        const token = signToken(user._id)
        return res.status(201).json({
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        })
    } catch (err) {
        console.error('[register error]', err)
        if (err.code === 11000)
            return res.status(409).json({ message: 'An account with this email already exists.' })
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map((e) => e.message).join(', ')
            return res.status(400).json({ message: messages })
        }
        return res.status(500).json({ message: 'Server error. Please try again.' })
    }
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password)
            return res.status(400).json({ message: 'Email and password are required.' })

        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')
        if (!user)
            return res.status(401).json({ message: 'Invalid email or password.' })

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch)
            return res.status(401).json({ message: 'Invalid email or password.' })

        const token = signToken(user._id)
        return res.status(200).json({
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        })
    } catch (err) {
        console.error('[login error]', err)
        return res.status(500).json({ message: 'Server error. Please try again.' })
    }
}

// ── GET CURRENT USER ──────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        if (!user) return res.status(404).json({ message: 'User not found.' })
        return res.status(200).json({ user })
    } catch (err) {
        console.error('[getMe error]', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ── UPDATE PROFILE ────────────────────────────────────────────────────────────
exports.updateMe = async (req, res) => {
    try {
        const { name, email, avatar } = req.body

        // Don't allow password change through this route
        const updates = {}
        if (name)   updates.name   = name.trim()
        if (email)  updates.email  = email.toLowerCase().trim()
        if (avatar) updates.avatar = avatar

        // Check email not already taken by another user
        if (updates.email) {
            const existing = await User.findOne({ email: updates.email })
            if (existing && String(existing._id) !== String(req.user.id))
                return res.status(409).json({ message: 'Email already in use.' })
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password')

        if (!user) return res.status(404).json({ message: 'User not found.' })

        return res.status(200).json({ user })
    } catch (err) {
        console.error('[updateMe error]', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ── CHANGE PASSWORD ───────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword)
            return res.status(400).json({ message: 'Current and new password are required.' })

        if (newPassword.length < 6)
            return res.status(400).json({ message: 'New password must be at least 6 characters.' })

        const user = await User.findById(req.user.id).select('+password')
        if (!user) return res.status(404).json({ message: 'User not found.' })

        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch)
            return res.status(401).json({ message: 'Current password is incorrect.' })

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(newPassword, salt)
        await user.save()

        return res.status(200).json({ message: 'Password updated successfully.' })
    } catch (err) {
        console.error('[changePassword error]', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ── LOGOUT ────────────────────────────────────────────────────────────────────
// JWT is stateless — logout is handled client-side by deleting the token.
// This endpoint exists so the frontend can call it cleanly (e.g. clear httpOnly cookies in future).
exports.logout = async (req, res) => {
    return res.status(200).json({ message: 'Logged out successfully.' })
}