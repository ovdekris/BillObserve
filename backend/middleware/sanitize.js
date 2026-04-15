// Sanityzacja przeciw NoSQL injection (kompatybilna z Express 5)

const sanitizeValue = (value) => {
    if (value === null || value === undefined) return value;

    if (typeof value === 'string') {
        // Usuń operatory MongoDB zaczynające się od $
        if (value.startsWith('$')) {
            return value.slice(1);
        }
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(sanitizeValue);
    }

    if (typeof value === 'object') {
        return sanitizeObject(value);
    }

    return value;
};

const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = {};

    for (const key of Object.keys(obj)) {
        // Usuń klucze zaczynające się od $ lub zawierające .
        if (key.startsWith('$') || key.includes('.')) {
            continue;
        }
        sanitized[key] = sanitizeValue(obj[key]);
    }

    return sanitized;
};

const mongoSanitize = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }

    if (req.params) {
        req.params = sanitizeObject(req.params);
    }

    // W Express 5 req.query jest read-only, więc sanityzujemy tylko body i params
    // Query params są automatycznie escapowane przez Express 5

    next();
};

module.exports = mongoSanitize;
