const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const asyncHandler = require('../middleware/asyncHandler');
const mongoose = require('mongoose');
const { isValidObjectId, filterBody, sanitizeFields } = require('../utils/validators');

const ALLOWED_FIELDS = ['name', 'amount', 'period', 'categories', 'wallets', 'startDate', 'endDate', 'notifyAt', 'isActive'];
const TEXT_LIMITS = { name: 100 };

// Oblicz daty okresu budżetowego
const getPeriodDates = (period) => {
    const now = new Date();
    let periodStart, periodEnd;

    if (period === 'weekly') {
        const dayOfWeek = now.getDay();
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - dayOfWeek);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodStart.getDate() + 6);
        periodEnd.setHours(23, 59, 59, 999);
    } else if (period === 'monthly') {
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (period === 'yearly') {
        periodStart = new Date(now.getFullYear(), 0, 1);
        periodEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    }

    return { periodStart, periodEnd };
};

// @route   GET /api/budgets
exports.getBudgets = asyncHandler(async (req, res) => {
    const budgets = await Budget.find({ user: req.user.id })
        .populate('categories', 'name icon color')
        .populate('wallets', 'name')
        .sort({ createdAt: -1 });

    // Dodaj wydatki dla każdego budżetu
    const budgetsWithSpent = await Promise.all(budgets.map(async (budget) => {
        const { periodStart, periodEnd } = getPeriodDates(budget.period, budget.startDate);

        const matchQuery = {
            user: new mongoose.Types.ObjectId(req.user.id),
            type: 'expense',
            date: { $gte: periodStart, $lte: periodEnd }
        };

        if (budget.categories.length > 0) {
            matchQuery.category = { $in: budget.categories.map(c => c._id) };
        }
        if (budget.wallets.length > 0) {
            matchQuery.wallet = { $in: budget.wallets.map(w => w._id) };
        }

        const [result] = await Transaction.aggregate([
            { $match: matchQuery },
            { $group: { _id: null, spent: { $sum: '$amount' } } }
        ]);

        const spent = result?.spent || 0;
        const percentage = Math.round((spent / budget.amount) * 100);

        return {
            ...budget.toObject(),
            spent,
            remaining: budget.amount - spent,
            percentage,
            periodStart,
            periodEnd
        };
    }));

    res.status(200).json({
        success: true,
        count: budgetsWithSpent.length,
        data: budgetsWithSpent
    });
});

// @route   GET /api/budgets/:id
exports.getBudget = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator' });
    }

    const budget = await Budget.findOne({
        _id: req.params.id,
        user: req.user.id
    })
        .populate('categories', 'name icon color')
        .populate('wallets', 'name');

    if (!budget) {
        return res.status(404).json({ success: false, message: 'Budżet nie znaleziony' });
    }

    const { periodStart, periodEnd } = getPeriodDates(budget.period, budget.startDate);

    const matchQuery = {
        user: new mongoose.Types.ObjectId(req.user.id),
        type: 'expense',
        date: { $gte: periodStart, $lte: periodEnd }
    };

    if (budget.categories.length > 0) {
        matchQuery.category = { $in: budget.categories.map(c => c._id) };
    }
    if (budget.wallets.length > 0) {
        matchQuery.wallet = { $in: budget.wallets.map(w => w._id) };
    }

    const [result] = await Transaction.aggregate([
        { $match: matchQuery },
        { $group: { _id: null, spent: { $sum: '$amount' } } }
    ]);

    const spent = result?.spent || 0;

    res.status(200).json({
        success: true,
        data: {
            ...budget.toObject(),
            spent,
            remaining: budget.amount - spent,
            percentage: Math.round((spent / budget.amount) * 100),
            periodStart,
            periodEnd
        }
    });
});

// @route   POST /api/budgets
exports.createBudget = asyncHandler(async (req, res) => {
    const data = sanitizeFields(filterBody(req.body, ALLOWED_FIELDS), TEXT_LIMITS);
    data.user = req.user.id;

    const budget = await Budget.create(data);

    const populated = await Budget.findById(budget._id)
        .populate('categories', 'name icon color')
        .populate('wallets', 'name');

    res.status(201).json({ success: true, data: populated });
});

// @route   PUT /api/budgets/:id
exports.updateBudget = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator' });
    }

    const budget = await Budget.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!budget) {
        return res.status(404).json({ success: false, message: 'Budżet nie znaleziony' });
    }

    const data = sanitizeFields(filterBody(req.body, ALLOWED_FIELDS), TEXT_LIMITS);

    const updatedBudget = await Budget.findByIdAndUpdate(req.params.id, data, {
        new: true,
        runValidators: true
    })
        .populate('categories', 'name icon color')
        .populate('wallets', 'name');

    res.status(200).json({ success: true, data: updatedBudget });
});

// @route   DELETE /api/budgets/:id
exports.deleteBudget = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator' });
    }

    const budget = await Budget.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!budget) {
        return res.status(404).json({ success: false, message: 'Budżet nie znaleziony' });
    }

    await Budget.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Budżet usunięty' });
});

// @route   GET /api/budgets/active
exports.getActiveBudgets = asyncHandler(async (req, res) => {
    const budgets = await Budget.find({
        user: req.user.id,
        isActive: true
    })
        .populate('categories', 'name icon color')
        .populate('wallets', 'name')
        .sort({ createdAt: -1 });

    const budgetsWithSpent = await Promise.all(budgets.map(async (budget) => {
        const { periodStart, periodEnd } = getPeriodDates(budget.period, budget.startDate);

        const matchQuery = {
            user: new mongoose.Types.ObjectId(req.user.id),
            type: 'expense',
            date: { $gte: periodStart, $lte: periodEnd }
        };

        if (budget.categories.length > 0) {
            matchQuery.category = { $in: budget.categories.map(c => c._id) };
        }
        if (budget.wallets.length > 0) {
            matchQuery.wallet = { $in: budget.wallets.map(w => w._id) };
        }

        const [result] = await Transaction.aggregate([
            { $match: matchQuery },
            { $group: { _id: null, spent: { $sum: '$amount' } } }
        ]);

        const spent = result?.spent || 0;
        const percentage = Math.round((spent / budget.amount) * 100);

        return {
            ...budget.toObject(),
            spent,
            remaining: budget.amount - spent,
            percentage,
            periodStart,
            periodEnd
        };
    }));

    res.status(200).json({
        success: true,
        count: budgetsWithSpent.length,
        data: budgetsWithSpent
    });
});

// @route   PATCH /api/budgets/:id/toggle
exports.toggleBudget = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator' });
    }

    const budget = await Budget.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!budget) {
        return res.status(404).json({ success: false, message: 'Budżet nie znaleziony' });
    }

    budget.isActive = !budget.isActive;
    await budget.save();

    res.status(200).json({ success: true, data: budget });
});
