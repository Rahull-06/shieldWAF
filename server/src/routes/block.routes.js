// PATH: server/src/routes/block.routes.js
const router = require('express').Router()
const { getBlockedIPs, blockIP, unblockIP } = require('../controllers/block.controller')
const { protect, adminOnly } = require('../middleware/auth')

router.get    ('/',     protect, adminOnly, getBlockedIPs)
router.post   ('/',     protect, adminOnly, blockIP)
router.delete ('/:ip',  protect, adminOnly, unblockIP)

module.exports = router