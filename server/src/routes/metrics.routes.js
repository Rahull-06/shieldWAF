// /**
//  * routes/metrics.routes.js
//  */

// const router = require('express').Router();
// const { protect } = require('../middleware/auth');
// const {
//     getSummary,
//     getTimeline,
//     getBreakdown,
//     getTopIPs,
//     getAttackOrigins,
//     getLiveFeed,
// } = require('../controllers/metrics.controller');

// router.get('/summary', protect, getSummary);
// router.get('/timeline', protect, getTimeline);
// router.get('/breakdown', protect, getBreakdown);
// router.get('/top-ips', protect, getTopIPs);
// router.get('/attack-origins', protect, getAttackOrigins);
// router.get('/live-feed', protect, getLiveFeed);

// module.exports = router;






// PATH: server/src/routes/metrics.routes.js
const router = require('express').Router()
const { getSummary, getTraffic, getThreatBreakdown, getGeoBreakdown } = require('../controllers/metrics.controller')
const { protect } = require('../middleware/auth')

router.get('/summary',  protect, getSummary)
router.get('/traffic',  protect, getTraffic)
router.get('/threats',  protect, getThreatBreakdown)
router.get('/geo',      protect, getGeoBreakdown)

module.exports = router