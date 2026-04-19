/**
 * routes/simulate.routes.js
 * GET  /api/simulate/presets        — list built-in presets
 * POST /api/simulate/preset/:preset — run a named preset
 * POST /api/simulate/attack         — test a single payload
 * POST /api/simulate/batch          — test all presets at once
 */

const router  = require('express').Router();
const { protect } = require('../middleware/auth');
const {
    simulateSingle,
    simulatePreset,
    simulateBatch,
    getPresets,
} = require('../controllers/simulate.controller');

router.get ('/presets',          protect, getPresets);
router.post('/preset/:preset',   protect, simulatePreset);
router.post('/attack',           protect, simulateSingle);
router.post('/batch',            protect, simulateBatch);

module.exports = router;