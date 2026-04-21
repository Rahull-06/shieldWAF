// PATH: server/src/routes/simulate.routes.js
const router = require('express').Router()
const { runSimulation } = require('../controllers/simulate.controller')
const { optionalAuth }  = require('../middleware/auth')
const { simulateLimiter } = require('../middleware/rateLimit')

// optionalAuth: logged-in users get full results, guests get limited results
router.post('/', simulateLimiter, optionalAuth, runSimulation)

module.exports = router