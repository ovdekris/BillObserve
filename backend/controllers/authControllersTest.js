const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const jwt = require('jsonwebtoken');
const { filterBody, sanitizeFields } = require('../utils/validators');

const ALLOWED_REGISTER_FIELDS = ['email', 'password', 'name', 'currency'];
const ALLOWED_UPDATE_FIELDS = ['name', 'currency', 'settings'];
const TEXT_LIMITS = { name: 100, email: 100 };

