const express = require('express');
const router = express.Router();
const {
    getGoals,
    getGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    updateProgress,
    updateStatus,
    getStats,
    getGoalsByPriority
} = require('../controllers/goalController');
const { mongoIdParam, validate } = require('../middleware/validate');
const { body } = require('express-validator');

// Walidacja celu
const goalRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Nazwa celu jest wymagana')
        .isLength({ max: 100 }).withMessage('Nazwa może mieć max 100 znaków'),
    body('targetAmount')
        .isFloat({ min: 0.01 }).withMessage('Kwota docelowa musi być większa od 0'),
    body('currentAmount')
        .optional()
        .isFloat({ min: 0 }).withMessage('Kwota bieżąca musi być nieujemna'),
    body('deadline')
        .optional()
        .isISO8601().withMessage('Nieprawidłowy format daty'),
    body('wallet')
        .optional()
        .isMongoId().withMessage('Nieprawidłowy ID portfela'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high']).withMessage('Priorytet: low, medium lub high'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Opis może mieć max 500 znaków')
];

// Specjalne endpointy (muszą być przed /:id)
router.get('/stats', getStats);
router.get('/priority/:priority', getGoalsByPriority);

// CRUD
router.route('/')
    .get(getGoals)
    .post(goalRules, validate, createGoal);

router.route('/:id')
    .get(mongoIdParam(), validate, getGoal)
    .put(mongoIdParam(), validate, goalRules, validate, updateGoal)
    .delete(mongoIdParam(), validate, deleteGoal);

// Aktualizacja postępu i statusu
router.patch('/:id/progress', mongoIdParam(), validate, updateProgress);
router.patch('/:id/status', mongoIdParam(), validate, updateStatus);

module.exports = router;
