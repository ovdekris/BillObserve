const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    updateMe,
    changePassword,
    deleteAccount,
    updateSettings
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerRules, loginRules, validate } = require('../middleware/validate');
const { registerLimiter, loginLimiter } = require('../middleware/rateLimiter');

// Publiczne endpointy
router.post('/register', registerLimiter, registerRules, validate, register);
router.post('/login', loginLimiter, loginRules, validate, login);

// Chronione endpointy (wymagają autoryzacji)
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/password', protect, changePassword);
router.put('/settings', protect, updateSettings);
router.delete('/me', protect, deleteAccount);

module.exports = router;
