// const mongoose = require("mongoose");

// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect(process.env.MONGO_URI);

//         console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
//     } catch (error) {
//         // Print a clear error and stop the server if DB fails
//         console.error(`❌ MongoDB Connection Failed: ${error.message}`);
//         process.exit(1); // Exit with failure code
//     }
// };

// module.exports = connectDB;




// PATH: server/src/config/db.js
const mongoose = require('mongoose')

let isConnected = false

async function connectDB() {
    if (isConnected) return

    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/shieldwaf'

    try {
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        })
        isConnected = true
        console.log(`✅ MongoDB connected: ${conn.connection.host}`)
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message)
        console.error('   Make sure MongoDB is running: mongod')
        process.exit(1)
    }

    mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected')
        isConnected = false
    })

    mongoose.connection.on('error', (err) => {
        console.error('MongoDB error:', err.message)
    })
}

module.exports = { connectDB }