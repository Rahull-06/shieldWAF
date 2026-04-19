const express = require('express');
const router = express.Router();
const wafController = require('../controllers/waf.controller');

// ✅ FIXED IMPORT
const { protect, authorize } = require('../middleware/auth');

// ✅ FIXED
router.use(protect);

// ─── Rules ─────────────────────────────────────────────────
router.get('/rules', wafController.getRules);
router.patch('/rules/:id', authorize('admin'), wafController.updateRule);
router.post('/rules/reset', authorize('admin'), wafController.resetRules);

// ─── IP Blocking ───────────────────────────────────────────
router.get('/blocked-ips', wafController.getBlockedIPs);
router.post('/blocked-ips', authorize('admin'), wafController.blockIP);
router.delete('/blocked-ips/:id', authorize('admin'), wafController.unblockIP);

// ─── Logs ──────────────────────────────────────────────────
router.get('/logs', wafController.getLogs);
router.delete('/logs', authorize('admin'), wafController.clearLogs);

// ─── AI Analysis ───────────────────────────────────────────
router.post('/analyze/:logId', wafController.analyzeLog);

// ─── Stats ─────────────────────────────────────────────────
router.get('/stats', wafController.getStats);

module.exports = router;