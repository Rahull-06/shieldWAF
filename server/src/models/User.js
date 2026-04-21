// PATH: server/src/models/User.js
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String, required: [true, 'Name is required'],
            trim: true, maxlength: [80, 'Name cannot exceed 80 characters'],
        },
        email: {
            type: String, required: [true, 'Email is required'],
            unique: true, lowercase: true, trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        password: {
            type: String, required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        avatar: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
)

// Auto-hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

// Compare plain password against stored hash
userSchema.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password)
}

// Strip password from JSON output
userSchema.set('toJSON', {
    transform: (_doc, ret) => { delete ret.password; return ret }
})

module.exports = mongoose.model('User', userSchema)