const express = require('express');
const router = express.Router();
const {
    getBudgets,
    getBudget,
    createBudget,
    updateBudget,
    deleteBudget,
    getActiveBudgets,
    toggleBudget
} = require('../controllers/budgetController');
const { budgetRules, mongoIdParam, validate } = require('../middleware/validate');

// Specjalne endpointy (muszą być przed /:id)
router.get('/active', getActiveBudgets);

// CRUD
router.route('/')
    .get(getBudgets)
    .post(budgetRules, validate, createBudget);

router.route('/:id')
    .get(mongoIdParam(), validate, getBudget)
    .put(mongoIdParam(), validate, budgetRules, validate, updateBudget)
    .delete(mongoIdParam(), validate, deleteBudget);

// Toggle aktywności
router.patch('/:id/toggle', mongoIdParam(), validate, toggleBudget);

module.exports = router;
