const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const asyncHandler = require('../middleware/asyncHandler');
const mongoose = require('mongoose');
const { isValidObjectId, filterBody, sanitizeFields, TRANSACTION_TYPES } = require('../utils/validators');

const ALLOWED_FIELDS = ['wallet', 'category', 'type', 'amount', 'date', 'description', 'notes', 'walletTo', 'isRecurring', 'recurringPattern', 'tags'];
const TEXT_LIMITS = { description: 200, notes: 500 };

// @route   GET /api/transactions
exports.getTransactions = asyncHandler(async (req, res) => {
    const { wallet, category, type, startDate, endDate, limit = 50, page = 1 } = req.query;

    const query = { user: req.user.id };

    if (wallet && isValidObjectId(wallet)) query.wallet = wallet;
    if (category && isValidObjectId(category)) query.category = category;
    if (type && TRANSACTION_TYPES.includes(type)) query.type = type;

    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
        Transaction.find(query)
            .populate('wallet', 'name')
            .populate('category', 'name icon color')
            .populate('walletTo', 'name')
            .sort({ date: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Transaction.countDocuments(query)
    ]);

    res.status(200).json({
        success: true,
        count: transactions.length,
        total,
        pages: Math.ceil(total / Number(limit)),
        data: transactions
    });
});

// @route   GET /api/transactions/:id
exports.getTransaction = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator' });
    }

    const transaction = await Transaction.findOne({
        _id: req.params.id,
        user: req.user.id
    })
        .populate('wallet', 'name')
        .populate('category', 'name icon color')
        .populate('walletTo', 'name');

    if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transakcja nie znaleziona' });
    }

    res.status(200).json({ success: true, data: transaction });
});

// @route   POST /api/transactions
exports.createTransaction = asyncHandler(async (req, res) => {
    const data = sanitizeFields(filterBody(req.body, ALLOWED_FIELDS), TEXT_LIMITS);
    data.user = req.user.id;

    // Sprawdź czy portfel należy do użytkownika
    const wallet = await Wallet.findOne({ _id: data.wallet, user: req.user.id, isArchived: false });
    if (!wallet) {
        return res.status(404).json({ success: false, message: 'Portfel nie znaleziony' });
    }

    // Dla transferu sprawdź portfel docelowy
    if (data.type === 'transfer' && data.walletTo) {
        const walletTo = await Wallet.findOne({ _id: data.walletTo, user: req.user.id, isArchived: false });
        if (!walletTo) {
            return res.status(404).json({ success: false, message: 'Portfel docelowy nie znaleziony' });
        }
    }

    const transaction = await Transaction.create(data);

    // Aktualizuj saldo portfela
    if (data.type === 'expense') {
        wallet.balance -= data.amount;
    } else if (data.type === 'income') {
        wallet.balance += data.amount;
    } else if (data.type === 'transfer' && data.walletTo) {
        wallet.balance -= data.amount;
        await Wallet.findByIdAndUpdate(data.walletTo, { $inc: { balance: data.amount } });
    }
    await wallet.save();

    const populated = await Transaction.findById(transaction._id)
        .populate('wallet', 'name')
        .populate('category', 'name icon color')
        .populate('walletTo', 'name');

    res.status(201).json({ success: true, data: populated });
});

// @route   PUT /api/transactions/:id
exports.updateTransaction = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator' });
    }

    const transaction = await Transaction.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transakcja nie znaleziona' });
    }

    const data = sanitizeFields(filterBody(req.body, ALLOWED_FIELDS), TEXT_LIMITS);

    // Przywróć stare saldo przed aktualizacją
    const oldWallet = await Wallet.findById(transaction.wallet);
    if (oldWallet) {
        if (transaction.type === 'expense') oldWallet.balance += transaction.amount;
        else if (transaction.type === 'income') oldWallet.balance -= transaction.amount;
        else if (transaction.type === 'transfer') {
            oldWallet.balance += transaction.amount;
            if (transaction.walletTo) {
                await Wallet.findByIdAndUpdate(transaction.walletTo, { $inc: { balance: -transaction.amount } });
            }
        }
        await oldWallet.save();
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, data, {
        new: true,
        runValidators: true
    });

    // Zastosuj nowe saldo
    const newWallet = await Wallet.findById(updatedTransaction.wallet);
    if (newWallet) {
        if (updatedTransaction.type === 'expense') newWallet.balance -= updatedTransaction.amount;
        else if (updatedTransaction.type === 'income') newWallet.balance += updatedTransaction.amount;
        else if (updatedTransaction.type === 'transfer' && updatedTransaction.walletTo) {
            newWallet.balance -= updatedTransaction.amount;
            await Wallet.findByIdAndUpdate(updatedTransaction.walletTo, { $inc: { balance: updatedTransaction.amount } });
        }
        await newWallet.save();
    }

    const populated = await Transaction.findById(updatedTransaction._id)
        .populate('wallet', 'name')
        .populate('category', 'name icon color')
        .populate('walletTo', 'name');

    res.status(200).json({ success: true, data: populated });
});

// @route   DELETE /api/transactions/:id
exports.deleteTransaction = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator' });
    }

    const transaction = await Transaction.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transakcja nie znaleziona' });
    }

    // Przywróć saldo portfela
    const wallet = await Wallet.findById(transaction.wallet);
    if (wallet) {
        if (transaction.type === 'expense') wallet.balance += transaction.amount;
        else if (transaction.type === 'income') wallet.balance -= transaction.amount;
        else if (transaction.type === 'transfer') {
            wallet.balance += transaction.amount;
            if (transaction.walletTo) {
                await Wallet.findByIdAndUpdate(transaction.walletTo, { $inc: { balance: -transaction.amount } });
            }
        }
        await wallet.save();
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Transakcja usunięta' });
});

// @route   GET /api/transactions/stats
exports.getStats = asyncHandler(async (req, res) => {
    const { startDate, endDate, wallet } = req.query;

    const matchStage = { user: new mongoose.Types.ObjectId(req.user.id) };

    if (wallet && isValidObjectId(wallet)) {
        matchStage.wallet = new mongoose.Types.ObjectId(wallet);
    }

    if (startDate || endDate) {
        matchStage.date = {};
        if (startDate) matchStage.date.$gte = new Date(startDate);
        if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const stats = await Transaction.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$type',
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        }
    ]);

    const result = { income: 0, expense: 0, transfer: 0 };
    stats.forEach(s => {
        result[s._id] = s.total;
    });
    result.balance = result.income - result.expense;

    res.status(200).json({ success: true, data: result });
});

// @route   GET /api/transactions/by-category
exports.getByCategory = asyncHandler(async (req, res) => {
    const { startDate, endDate, type = 'expense' } = req.query;

    const matchStage = {
        user: new mongoose.Types.ObjectId(req.user.id),
        type
    };

    if (startDate || endDate) {
        matchStage.date = {};
        if (startDate) matchStage.date.$gte = new Date(startDate);
        if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const result = await Transaction.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$category',
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'category'
            }
        },
        { $unwind: '$category' },
        {
            $project: {
                _id: 1,
                total: 1,
                count: 1,
                name: '$category.name',
                icon: '$category.icon',
                color: '$category.color'
            }
        },
        { $sort: { total: -1 } }
    ]);

    res.status(200).json({ success: true, data: result });
});
