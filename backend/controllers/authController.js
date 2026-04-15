const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const jwt = require('jsonwebtoken');
const { filterBody, sanitizeFields } = require('../utils/validators');

const ALLOWED_REGISTER_FIELDS = ['email', 'password', 'name', 'currency'];
const ALLOWED_UPDATE_FIELDS = ['name', 'currency', 'settings'];
const TEXT_LIMITS = { name: 100, email: 100 };

// Generuj token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// Wyślij odpowiedź z tokenem
const sendTokenResponse = (user, statusCode, res, message) => {
    const token = generateToken(user._id);

    // Usuń hasło z odpowiedzi
    const userData = user.toObject();
    delete userData.password;

    res.status(statusCode).json({
        success: true,
        message,
        token,
        data: userData
    });
};

// @route   POST /api/auth/register
// @desc    Rejestracja nowego użytkownika
exports.register = asyncHandler(async (req, res) => {
    const data = sanitizeFields(filterBody(req.body, ALLOWED_REGISTER_FIELDS), TEXT_LIMITS);

    // Sprawdź czy email jest już zajęty
    const existingUser = await User.findOne({ email: data.email?.toLowerCase() });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'Użytkownik z tym adresem email już istnieje'
        });
    }

    const user = await User.create(data);

    sendTokenResponse(user, 201, res, 'Konto zostało utworzone');
});

// @route   POST /api/auth/login
// @desc    Logowanie użytkownika
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Podaj email i hasło'
        });
    }

    // Znajdź użytkownika (z hasłem)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Nieprawidłowy email lub hasło'
        });
    }

    // Sprawdź hasło
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: 'Nieprawidłowy email lub hasło'
        });
    }

    sendTokenResponse(user, 200, res, 'Zalogowano pomyślnie');
});

// @route   GET /api/auth/me
// @desc    Pobierz dane zalogowanego użytkownika
exports.getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
});

// @route   PUT /api/auth/me
// @desc    Aktualizuj dane użytkownika
exports.updateMe = asyncHandler(async (req, res) => {
    const data = sanitizeFields(filterBody(req.body, ALLOWED_UPDATE_FIELDS), TEXT_LIMITS);

    const user = await User.findByIdAndUpdate(req.user.id, data, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        message: 'Dane zostały zaktualizowane',
        data: user
    });
});

// @route   PUT /api/auth/password
// @desc    Zmień hasło
exports.changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Podaj aktualne i nowe hasło'
        });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'Nowe hasło musi mieć co najmniej 8 znaków'
        });
    }

    // Pobierz użytkownika z hasłem
    const user = await User.findById(req.user.id).select('+password');

    // Sprawdź aktualne hasło
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: 'Aktualne hasło jest nieprawidłowe'
        });
    }

    // Ustaw nowe hasło
    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, 'Hasło zostało zmienione');
});

// @route   DELETE /api/auth/me
// @desc    Usuń konto użytkownika
exports.deleteAccount = asyncHandler(async (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({
            success: false,
            message: 'Podaj hasło, aby potwierdzić usunięcie konta'
        });
    }

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: 'Nieprawidłowe hasło'
        });
    }

    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
        success: true,
        message: 'Konto zostało usunięte'
    });
});

// @route   PUT /api/auth/settings
// @desc    Aktualizuj ustawienia użytkownika
exports.updateSettings = asyncHandler(async (req, res) => {
    const { notifications, darkMode, language } = req.body;

    const settings = {};
    if (typeof notifications === 'boolean') settings['settings.notifications'] = notifications;
    if (typeof darkMode === 'boolean') settings['settings.darkMode'] = darkMode;
    if (language && ['pl', 'en'].includes(language)) settings['settings.language'] = language;

    if (Object.keys(settings).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Brak ustawień do aktualizacji'
        });
    }

    const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: settings },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: 'Ustawienia zostały zaktualizowane',
        data: user
    });
});
