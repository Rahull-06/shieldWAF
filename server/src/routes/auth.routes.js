// PATH: server/src/routes/auth.routes.js
const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const {
    register,
    login,
    getMe,
    updateMe,
    changePassword,
    logout,
} = require('../controllers/auth.controller')

router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, getMe)
router.patch('/me', protect, updateMe)
router.patch('/change-password', protect, changePassword)
router.post('/logout', protect, logout)

module.exports = router