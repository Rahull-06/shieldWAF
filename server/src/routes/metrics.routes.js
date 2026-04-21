// PATH: server/src/routes/metrics.routes.js
const router = require('express').Router()
const { getSummary, getTraffic, getThreatBreakdown, getGeoBreakdown } = require('../controllers/metrics.controller')
const { protect } = require('../middleware/auth')

router.get('/summary',  protect, getSummary)
router.get('/traffic',  protect, getTraffic)
router.get('/threats',  protect, getThreatBreakdown)
router.get('/geo',      protect, getGeoBreakdown)

module.exports = router