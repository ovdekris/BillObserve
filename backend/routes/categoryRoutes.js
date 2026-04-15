const express = require('express');
const router = express.Router();
const {
    getCategories,
    getCategory,
    getCategoriesByType
} = require('../controllers/categoryController');
const { mongoIdParam, validate } = require('../middleware/validate');

// Specjalne endpointy (muszą być przed /:id)
router.get('/type/:type', getCategoriesByType);

// CRUD (tylko GET - kategorie są read-only lub zarządzane przez admina)
router.get('/', getCategories);
router.get('/:id', mongoIdParam(), validate, getCategory);

module.exports = router;
