const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    updateMe,
    changePassword,
    deleteAccount,
    updateSettings,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerRules, loginRules, forgotPasswordRules, resetPasswordRules, validate } = require('../middleware/validate');
const { registerLimiter, loginLimiter, forgotPasswordLimiter } = require('../middleware/rateLimiter');

// Publiczne endpointy
router.post('/register', registerLimiter, registerRules, validate, register);
router.post('/login', loginLimiter, loginRules, validate, login);
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password/:token', resetPasswordRules, validate, resetPassword);

// Chronione endpointy (wymagają autoryzacji)
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/password', protect, changePassword);
router.put('/settings', protect, updateSettings);
router.delete('/me', protect, deleteAccount);

module.exports = router;
