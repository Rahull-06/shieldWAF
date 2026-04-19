// ============================================================
//  db.js — MongoDB Connection
//
//  Handles connecting to MongoDB using Mongoose.
//  Called once at server startup from server.js
// ============================================================

const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // Print a clear error and stop the server if DB fails
        console.error(`❌ MongoDB Connection Failed: ${error.message}`);
        process.exit(1); // Exit with failure code
    }
};

module.exports = connectDB;