const rateLimit = require('express-rate-limit');

// Ogólny limiter dla API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minut
    max: 100, // max 100 zapytań na IP
    message: {
        success: false,
        message: 'Zbyt wiele zapytań, spróbuj ponownie za 15 minut'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Restrykcyjny limiter dla logowania/rejestracji
/ Limiter dla rejestracji
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 godzina
    max: 10, // max 10 prób rejestracji na godzinę
    message: {
        success: false,
        message: 'Zbyt wiele prób rejestracji. Spróbuj ponownie za godzinę.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Limiter dla logowania
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minut
    max: 10, // max 10 nieudanych prób logowania
    skipSuccessfulRequests: true, // tylko nieudane próby liczą się do limitu
    message: {
        success: false,
        message: 'Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { apiLimiter, registerLimiter, loginLimiter };
