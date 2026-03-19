const mongoose = require('mongoose');

// Stałe walidacyjne
exports.WALLET_TYPES = ['cash', 'bank', 'credit_card', 'savings', 'investment', 'other'];
exports.CURRENCIES = ['PLN', 'EUR', 'USD', 'GBP'];
exports.TRANSACTION_TYPES = ['expense', 'income', 'transfer'];

// Walidacja MongoDB ObjectId
exports.isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Sanityzacja stringa
exports.sanitizeString = (str, maxLength = 200) => {
    if (typeof str !== 'string') return '';
    return str.trim().slice(0, maxLength);
};

// Filtruj tylko dozwolone pola
exports.filterBody = (body, allowedFields) => {
    const filtered = {};
    Object.keys(body).forEach(key => {
        if (allowedFields.includes(key)) {
            filtered[key] = body[key];
        }
    });
    return filtered;
};

// Walidacja hex color
exports.isValidHexColor = (color) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// Walidacja liczby
exports.isValidNumber = (value) => {
    return !isNaN(Number(value));
};

// Walidacja danych portfela
exports.validateWallet = (data) => {
    const errors = [];

    if (data.name !== undefined) {
        if (typeof data.name !== 'string' || data.name.trim().length === 0) {
            errors.push('Nazwa portfela jest wymagana');
        } else if (data.name.length > 100) {
            errors.push('Nazwa portfela nie może przekraczać 100 znaków');
        }
    }

    if (data.type !== undefined && !exports.WALLET_TYPES.includes(data.type)) {
        errors.push(`Nieprawidłowy typ portfela. Dozwolone: ${exports.WALLET_TYPES.join(', ')}`);
    }

    if (data.currency !== undefined && !exports.CURRENCIES.includes(data.currency)) {
        errors.push(`Nieprawidłowa waluta. Dozwolone: ${exports.CURRENCIES.join(', ')}`);
    }

    if (data.balance !== undefined && !exports.isValidNumber(data.balance)) {
        errors.push('Saldo musi być liczbą');
    }

    if (data.color !== undefined && !exports.isValidHexColor(data.color)) {
        errors.push('Nieprawidłowy format koloru (wymagany hex, np. #4CAF50)');
    }

    if (data.includeInTotal !== undefined && typeof data.includeInTotal !== 'boolean') {
        errors.push('includeInTotal musi być wartością boolean');
    }

    if (data.description !== undefined && typeof data.description !== 'string') {
        errors.push('Opis musi być tekstem');
    }

    return errors;
};

// Sanityzacja danych portfela
exports.sanitizeWallet = (data) => {
    const sanitized = { ...data };

    if (sanitized.name) sanitized.name = exports.sanitizeString(sanitized.name, 100);
    if (sanitized.description) sanitized.description = exports.sanitizeString(sanitized.description, 500);
    if (sanitized.icon) sanitized.icon = exports.sanitizeString(sanitized.icon, 50);
    if (sanitized.balance !== undefined) sanitized.balance = Number(sanitized.balance);

    return sanitized;
};
