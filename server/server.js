// PATH: server/server.js
require('dotenv').config()
const app = require('./src/app')
const { connectDB } = require('./src/config/db')
const { initSocket } = require('./src/services/socket')
const http = require('http')

const PORT = process.env.PORT || 5000

async function start() {
    await connectDB()

    const server = http.createServer(app)
    initSocket(server)

    server.listen(PORT, () => {
        console.log(`\n🛡  ShieldWAF API running on http://localhost:${PORT}`)
        console.log(`📊  Environment: ${process.env.NODE_ENV || 'development'}`)
        console.log(`🗄   MongoDB: connected\n`)
    })
}

start().catch(err => {
    console.error('❌ Failed to start server:', err)
    process.exit(1)
})