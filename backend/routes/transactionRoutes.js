const express = require('express');
const router = express.Router();
const {
    getTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getStats,
    getByCategory
} = require('../controllers/transactionController');
const { transactionRules, mongoIdParam, validate } = require('../middleware/validate');

// Specjalne endpointy (muszą być przed /:id)
router.get('/stats', getStats);
router.get('/by-category', getByCategory);

// CRUD
router.route('/')
    .get(getTransactions)
    .post(transactionRules, validate, createTransaction);

router.route('/:id')
    .get(mongoIdParam(), validate, getTransaction)
    .put(mongoIdParam(), validate, updateTransaction)
    .delete(mongoIdParam(), validate, deleteTransaction);

module.exports = router;
