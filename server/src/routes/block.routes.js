// const router = require('express').Router();
// const { protect } = require('../middleware/auth');
// const { getBlockedIPs, blockIP, unblockIP, checkIP } = require('../controllers/block.controller');

// router.get('/check/:ip', protect, checkIP);   // Must be before /:ip
// router.get('/', protect, getBlockedIPs);
// router.post('/', protect, blockIP);
// router.delete('/:ip', protect, unblockIP);

// module.exports = router;




// PATH: server/src/routes/block.routes.js
const router = require('express').Router()
const { getBlockedIPs, blockIP, unblockIP } = require('../controllers/block.controller')
const { protect, adminOnly } = require('../middleware/auth')

router.get    ('/',     protect, adminOnly, getBlockedIPs)
router.post   ('/',     protect, adminOnly, blockIP)
router.delete ('/:ip',  protect, adminOnly, unblockIP)

module.exports = router