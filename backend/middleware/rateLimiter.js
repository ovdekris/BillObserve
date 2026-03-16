const rateLimit = require('express-rate-limit');

// Ogólny limiter dla API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Zbyt wiele zapytań, spróbuj ponownie za 15 minut'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Limiter dla rejestracji
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Zbyt wiele prób rejestracji. Spróbuj ponownie za godzinę.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Limiter dla logowania
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: 'Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { apiLimiter, registerLimiter, loginLimiter };
