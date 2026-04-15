const express = require('express');
const router = express.Router();
const {
    getAssets,
    getAsset,
    createAsset,
    updateAsset,
    deleteAsset,
    updateValue,
    getNetWorth,
    getAssetsByType,
    getStats,
    permanentDelete,
    restoreAsset
} = require('../controllers/assetItemController');
const { mongoIdParam, validate } = require('../middleware/validate');
const { body } = require('express-validator');

// Walidacja aktywa
const assetRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Nazwa aktywa jest wymagana')
        .isLength({ max: 100 }).withMessage('Nazwa może mieć max 100 znaków'),
    body('type')
        .optional()
        .isIn(['real_estate', 'vehicle', 'investment', 'electronics', 'jewelry', 'collectibles', 'other'])
        .withMessage('Nieprawidłowy typ aktywa'),
    body('currentValue')
        .isFloat({ min: 0 }).withMessage('Wartość musi być nieujemna'),
    body('purchasePrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Cena zakupu musi być nieujemna'),
    body('purchaseDate')
        .optional()
        .isISO8601().withMessage('Nieprawidłowy format daty'),
    body('currency')
        .optional()
        .isIn(['PLN', 'EUR', 'USD', 'GBP']).withMessage('Nieprawidłowa waluta'),
    body('location')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Lokalizacja może mieć max 200 znaków'),
    body('serialNumber')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Numer seryjny może mieć max 100 znaków'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Opis może mieć max 500 znaków')
];

// Specjalne endpointy (muszą być przed /:id)
router.get('/net-worth', getNetWorth);
router.get('/stats', getStats);
router.get('/type/:type', getAssetsByType);

// CRUD
router.route('/')
    .get(getAssets)
    .post(assetRules, validate, createAsset);

router.route('/:id')
    .get(mongoIdParam(), validate, getAsset)
    .put(mongoIdParam(), validate, assetRules, validate, updateAsset)
    .delete(mongoIdParam(), validate, deleteAsset);

// Dodatkowe operacje
router.patch('/:id/value', mongoIdParam(), validate, updateValue);
router.patch('/:id/restore', mongoIdParam(), validate, restoreAsset);
router.delete('/:id/permanent', mongoIdParam(), validate, permanentDelete);

module.exports = router;
