// const router = require('express').Router();
// const { protect } = require('../middleware/auth');
// const {
//     getRules,
//     getRuleById,
//     createRule,
//     updateRule,
//     deleteRule,
//     resetRules,
// } = require('../controllers/rules.controller');

// router.post('/reset', protect, resetRules);   // Must be before /:id
// router.get('/', protect, getRules);
// router.post('/', protect, createRule);
// router.get('/:id', protect, getRuleById);
// router.put('/:id', protect, updateRule);
// router.delete('/:id', protect, deleteRule);

// module.exports = router;





// PATH: server/src/routes/rules.routes.js
const router = require('express').Router()
const { getRules, createRule, updateRule, deleteRule, toggleRule } = require('../controllers/rules.controller')
const { protect, adminOnly } = require('../middleware/auth')

router.get    ('/',           protect,             getRules)
router.post   ('/',           protect, adminOnly,  createRule)
router.patch  ('/:id',        protect, adminOnly,  updateRule)
router.patch  ('/:id/toggle', protect, adminOnly,  toggleRule)
router.delete ('/:id',        protect, adminOnly,  deleteRule)

module.exports = router