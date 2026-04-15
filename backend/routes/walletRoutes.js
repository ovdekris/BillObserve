const express = require('express');
const router = express.Router();
const {
    getWallets,
    getWallet,
    createWallet,
    updateWallet,
    deleteWallet,
    getTotalBalance,
    updateBalance,
    getWalletsByType
} = require('../controllers/walletController');
const { walletRules, mongoIdParam, validate } = require('../middleware/validate');

// Specjalne endpointy (muszą być przed /:id)
router.get('/total-balance', getTotalBalance);
router.get('/type/:type', getWalletsByType);

// CRUD
router.route('/')
    .get(getWallets)
    .post(walletRules, validate, createWallet);

router.route('/:id')
    .get(mongoIdParam(), validate, getWallet)
    .put(mongoIdParam(), validate, walletRules, validate, updateWallet)
    .delete(mongoIdParam(), validate, deleteWallet);

// Aktualizacja salda
router.patch('/:id/balance', mongoIdParam(), validate, updateBalance);

module.exports = router;
