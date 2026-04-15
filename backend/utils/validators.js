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

// Sanityzacja pól tekstowych w obiekcie
exports.sanitizeFields = (data, fieldLimits) => {
    const sanitized = { ...data };
    Object.entries(fieldLimits).forEach(([field, maxLength]) => {
        if (sanitized[field]) {
            sanitized[field] = exports.sanitizeString(sanitized[field], maxLength);
        }
    });
    return sanitized;
};
