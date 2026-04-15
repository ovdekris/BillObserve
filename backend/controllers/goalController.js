const Goal = require('../models/Goal');
const Wallet = require('../models/Wallet');
const asyncHandler = require('../middleware/asyncHandler');
const mongoose = require('mongoose');
const { isValidObjectId, filterBody, sanitizeFields } = require('../utils/validators');

const ALLOWED_FIELDS = ['name', 'targetAmount', 'currentAmount', 'deadline', 'wallet', 'priority', 'status', 'description'];
const TEXT_LIMITS = { name: 100, description: 500 };
const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['active', 'completed', 'cancelled'];

// @route   GET /api/goals
exports.getGoals = asyncHandler(async (req, res) => {
    const { status, priority } = req.query;
    const filter = { user: req.user.id };

    if (status && STATUSES.includes(status)) {
        filter.status = status;
    }
    if (priority && PRIORITIES.includes(priority)) {
        filter.priority = priority;
    }

    const goals = await Goal.find(filter)
        .populate('wallet', 'name currency')
        .sort({ priority: -1, deadline: 1 });

    res.status(200).json({
        success: true,
        count: goals.length,
        data: goals
    });
});

// @route   GET /api/goals/:id
exports.getGoal = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator' });
    }

    const goal = await Goal.findOne({
        _id: req.params.id,
        user: req.user.id
    }).populate('wallet', 'name currency balance');

    if (!goal) {
        return res.status(404).json({ success: false, message: 'Cel nie znaleziony' });
    }

    res.status(200).json({ success: true, data: goal });
});

// @route   POST /api/goals
exports.createGoal = asyncHandler(async (req, res) => {
    const data = sanitizeFields(filterBody(req.body, ALLOWED_FIELDS), TEXT_LIMITS);
    data.user = req.user.id;

    if (data.wallet && !isValidObjectId(data.wallet)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator portfela' });
    }

    if (data.wallet) {
        const wallet = await Wallet.findOne({ _id: data.wallet, user: req.user.id, isArchived: false });
        if (!wallet) {
            return res.status(404).json({ success: false, message: 'Portfel nie znaleziony' });
        }
    }

    const goal = await Goal.create(data);
    await goal.populate('wallet', 'name currency');

    res.status(201).json({ success: true, data: goal });
});

// @route   PUT /api/goals/:id
exports.updateGoal = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator' });
    }

    const goal = await Goal.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!goal) {
        return res.status(404).json({ success: false, message: 'Cel nie znaleziony' });
    }

    const data = sanitizeFields(filterBody(req.body, ALLOWED_FIELDS), TEXT_LIMITS);

    if (data.wallet && !isValidObjectId(data.wallet)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator portfela' });
    }

    if (data.wallet) {
        const wallet = await Wallet.findOne({ _id: data.wallet, user: req.user.id, isArchived: false });
        if (!wallet) {
            return res.status(404).json({ success: false, message: 'Portfel nie znaleziony' });
        }
    }

    const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, data, {
        new: true,
        runValidators: true
    }).populate('wallet', 'name currency');

    res.status(200).json({ success: true, data: updatedGoal });
});

// @route   DELETE /api/goals/:id
exports.deleteGoal = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator' });
    }

    const goal = await Goal.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!goal) {
        return res.status(404).json({ success: false, message: 'Cel nie znaleziony' });
    }

    await Goal.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Cel usunięty' });
});

// @route   PATCH /api/goals/:id/progress
exports.updateProgress = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator' });
    }

    const { amount, operation } = req.body;

    if (!['add', 'subtract', 'set'].includes(operation)) {
        return res.status(400).json({ success: false, message: 'Operacja: add, subtract lub set' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 0) {
        return res.status(400).json({ success: false, message: 'Kwota musi być liczbą nieujemną' });
    }

    const goal = await Goal.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!goal) {
        return res.status(404).json({ success: false, message: 'Cel nie znaleziony' });
    }

    if (operation === 'add') goal.currentAmount += numAmount;
    else if (operation === 'subtract') goal.currentAmount = Math.max(0, goal.currentAmount - numAmount);
    else goal.currentAmount = numAmount;

    if (goal.currentAmount >= goal.targetAmount && goal.status === 'active') {
        goal.status = 'completed';
    }

    await goal.save();
    await goal.populate('wallet', 'name currency');

    res.status(200).json({ success: true, data: goal });
});

// @route   PATCH /api/goals/:id/status
exports.updateStatus = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator' });
    }

    const { status } = req.body;

    if (!STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: `Status: ${STATUSES.join(', ')}` });
    }

    const goal = await Goal.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!goal) {
        return res.status(404).json({ success: false, message: 'Cel nie znaleziony' });
    }

    goal.status = status;
    await goal.save();

    res.status(200).json({ success: true, data: goal });
});

// @route   GET /api/goals/stats
exports.getStats = asyncHandler(async (req, res) => {
    const stats = await Goal.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalTarget: { $sum: '$targetAmount' },
                totalCurrent: { $sum: '$currentAmount' }
            }
        }
    ]);

    const activeGoals = await Goal.find({
        user: req.user.id,
        status: 'active'
    }).sort({ deadline: 1 }).limit(5);

    res.status(200).json({
        success: true,
        data: {
            byStatus: stats,
            upcomingDeadlines: activeGoals
        }
    });
});

// @route   GET /api/goals/priority/:priority
exports.getGoalsByPriority = asyncHandler(async (req, res) => {
    const { priority } = req.params;

    if (!PRIORITIES.includes(priority)) {
        return res.status(400).json({ success: false, message: `Priorytet: ${PRIORITIES.join(', ')}` });
    }

    const goals = await Goal.find({
        user: req.user.id,
        priority,
        status: 'active'
    }).populate('wallet', 'name currency').sort({ deadline: 1 });

    res.status(200).json({ success: true, count: goals.length, data: goals });
});
