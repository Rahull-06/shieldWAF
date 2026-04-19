/**
 * routes/logs.routes.js
 * GET  /api/logs           — paginated log list
 * GET  /api/logs/export    — download logs as JSON
 * GET  /api/logs/:id       — single log
 * DELETE /api/logs         — clear all logs (admin)
 */

const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getLogs, getLogById, exportLogs, clearLogs } = require('../controllers/logs.controller');

router.get('/export', protect, exportLogs);   // Must be before /:id
router.get('/', protect, getLogs);
router.get('/:id', protect, getLogById);
router.delete('/', protect, clearLogs);

module.exports = router;