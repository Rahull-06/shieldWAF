/**
 * routes/rules.routes.js
 * GET    /api/rules          — list all rules
 * POST   /api/rules/reset    — reset to defaults
 * GET    /api/rules/:id      — single rule
 * POST   /api/rules          — create custom rule
 * PUT    /api/rules/:id      — update rule
 * DELETE /api/rules/:id      — delete rule
 */

const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
    getRules,
    getRuleById,
    createRule,
    updateRule,
    deleteRule,
    resetRules,
} = require('../controllers/rules.controller');

router.post('/reset', protect, resetRules);   // Must be before /:id
router.get('/', protect, getRules);
router.post('/', protect, createRule);
router.get('/:id', protect, getRuleById);
router.put('/:id', protect, updateRule);
router.delete('/:id', protect, deleteRule);

module.exports = router;