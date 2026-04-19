/**
 * routes/block.routes.js
 * GET    /api/block              — list blocked IPs
 * POST   /api/block              — block an IP
 * GET    /api/block/check/:ip    — check if IP is blocked
 * DELETE /api/block/:ip          — unblock an IP
 */

const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getBlockedIPs, blockIP, unblockIP, checkIP } = require('../controllers/block.controller');

router.get('/check/:ip', protect, checkIP);   // Must be before /:ip
router.get('/', protect, getBlockedIPs);
router.post('/', protect, blockIP);
router.delete('/:ip', protect, unblockIP);

module.exports = router;