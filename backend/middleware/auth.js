const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');

// Weryfikacja tokenu JWT
exports.protect = asyncHandler(async (req, res, next) => {
    let token;
    // Sprawdź nagłówek Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Brak autoryzacji. Zaloguj się, aby uzyskać dostęp'
        });
    }
    try {
        // Weryfikuj token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Sprawdź czy użytkownik nadal istnieje
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Użytkownik nie istnieje'
            });
        }
        // Dodaj użytkownika do request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token wygasł. Zaloguj się ponownie'
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Nieprawidłowy token'
            });
        }
        throw error;
    }
});

// Opcjonalna autoryzacja (nie wymaga tokenu, ale jeśli jest - weryfikuje)
exports.optionalAuth = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
            req.user = user;
        }
    } catch (error) {
        // Ignoruj błędy tokenu - kontynuuj bez użytkownika
    }

    next();
});
