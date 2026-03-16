const { body, param, validationResult } = require('express-validator');

// Funkcja sprawdzająca wyniki walidacji
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Błąd walidacji',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Walidacja rejestracji
const registerRules = [
    body('email')
        .isEmail().withMessage('Nieprawidłowy format email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Hasło musi mieć co najmniej 8 znaków')
        .matches(/[A-Z]/)
        .withMessage('Hasło musi zawierać wielką literę')
        .matches(/[a-z]/)
        .withMessage('Hasło musi zawierać małą literę')
        .matches(/[0-9]/)
        .withMessage('Hasło musi zawierać cyfrę')
        .matches(/[!@#$%^&*]/)
        .withMessage('Hasło musi zawierać znak specjalny'),
    body('name')
        .trim()
        .notEmpty().withMessage('Imię jest wymagane')
];

// Walidacja logowania
const loginRules = [
    body('email')
        .isEmail().withMessage('Nieprawidłowy format email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Hasło jest wymagane')
];

// Walidacja transakcji
const transactionRules = [
    body('amount')
        .isFloat({ min: 0.01 }).withMessage('Kwota musi być większa od 0'),
    body('type')
        .isIn(['expense', 'income', 'transfer']).withMessage('Nieprawidłowy typ transakcji'),
    body('wallet')
        .isMongoId().withMessage('Nieprawidłowy ID portfela'),
    body('category')
        .isMongoId().withMessage('Nieprawidłowy ID kategorii'),
    body('date')
        .optional()
        .isISO8601().withMessage('Nieprawidłowy format daty'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Opis może mieć max 200 znaków')
];

// Walidacja budżetu
const budgetRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Nazwa budżetu jest wymagana'),
    body('amount')
        .isFloat({ min: 0.01 }).withMessage('Kwota musi być większa od 0'),
    body('period')
        .isIn(['weekly', 'monthly', 'yearly']).withMessage('Nieprawidłowy okres'),
    body('notifyAt')
        .optional()
        .isInt({ min: 0, max: 100 }).withMessage('Próg powiadomienia musi być między 0 a 100')
];

// Walidacja kategorii
const categoryRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Nazwa kategorii jest wymagana')
        .isLength({ max: 50 }).withMessage('Nazwa może mieć max 50 znaków'),
    body('type')
        .isIn(['expense', 'income']).withMessage('Nieprawidłowy typ kategorii'),
    body('icon')
        .optional()
        .trim(),
    body('color')
        .optional()
        .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Nieprawidłowy format koloru (np. #FF5733)')
];

// Walidacja portfela
const walletRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Nazwa portfela jest wymagana'),
    body('balance')
        .optional()
        .isFloat().withMessage('Nieprawidłowa kwota'),
    body('currency')
        .optional()
        .isIn(['PLN', 'EUR', 'USD', 'GBP']).withMessage('Nieprawidłowa waluta')
];

// Walidacja MongoDB ObjectId w parametrach
const mongoIdParam = (paramName = 'id') => [
    param(paramName).isMongoId().withMessage('Nieprawidłowy ID')
];

module.exports = {
    validate,
    registerRules,
    loginRules,
    transactionRules,
    budgetRules,
    categoryRules,
    walletRules,
    mongoIdParam
};
