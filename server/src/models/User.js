// ============================================================
//  User.js — User Model
//
//  Stores admin/operator accounts who can log into ShieldWAF.
//  Passwords are hashed using bcrypt before saving.
// ============================================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
    {
        // ---- Identity ----
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            minlength: [3, "Username must be at least 3 characters"],
            maxlength: [30, "Username cannot exceed 30 characters"],
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false, // Never return password in queries by default
        },

        // ---- Role-based access ----
        role: {
            type: String,
            enum: ["admin", "analyst", "viewer"],
            default: "viewer",
            // admin   → full access (manage rules, block IPs, view all)
            // analyst → view logs, run simulator
            // viewer  → read-only dashboard
        },

        // ---- Status ----
        isActive: {
            type: Boolean,
            default: true,
        },

        lastLogin: {
            type: Date,
        },
    },
    {
        // Automatically adds createdAt and updatedAt fields
        timestamps: true,
    }
);

// ============================================================
//  MIDDLEWARE: Hash password before saving
//  Only runs if the password field was actually changed
// ============================================================
UserSchema.pre("save", async function (next) {
    // Skip hashing if password wasn't modified (e.g. role update)
    if (!this.isModified("password")) return next();

    // Salt rounds: 12 is a good balance of security vs speed
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ============================================================
//  METHOD: Compare entered password with stored hash
//  Usage: const isMatch = await user.comparePassword("myPass123")
// ============================================================
UserSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);