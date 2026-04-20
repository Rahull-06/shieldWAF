
// const router = require('express').Router();
// const { protect } = require('../middleware/auth');
// const { getLogs, getLogById, exportLogs, clearLogs } = require('../controllers/logs.controller');

// router.get('/export', protect, exportLogs);   // Must be before /:id
// router.get('/', protect, getLogs);
// router.get('/:id', protect, getLogById);
// router.delete('/', protect, clearLogs);

// module.exports = router;



// PATH: server/src/routes/logs.routes.js
const router = require('express').Router()
const { getLogs, getRecentLogs, deleteLog } = require('../controllers/logs.controller')
const { protect } = require('../middleware/auth')

// All log routes require login
router.get    ('/',        protect, getLogs)
router.get    ('/recent',  protect, getRecentLogs)
router.delete ('/:id',     protect, deleteLog)

module.exports = router