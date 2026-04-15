const Wallet = require('../models/Wallet');
const asyncHandler = require('../middleware/asyncHandler');
const mongoose = require('mongoose');
const { isValidObjectId, filterBody, sanitizeFields, WALLET_TYPES } = require('../utils/validators');

const ALLOWED_FIELDS = ['name', 'type', 'balance', 'currency', 'color', 'icon', 'includeInTotal', 'description'];
const TEXT_LIMITS = { name: 100, description: 500, icon: 50 };

// @route   GET /api/wallets
exports.getWallets = asyncHandler(async (req, res) => {
    const wallets = await Wallet.find({
        user: req.user.id,
        isArchived: false
    }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: wallets.length,
        data: wallets
    });
});

// @route   GET /api/wallets/:id
exports.getWallet = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator' });
    }

    const wallet = await Wallet.findOne({
        _id: req.params.id,
        user: req.user.id,
        isArchived: false
    });

    if (!wallet) {
        return res.status(404).json({ success: false, message: 'Portfel nie znaleziony' });
    }

    res.status(200).json({ success: true, data: wallet });
});

// @route   POST /api/wallets
exports.createWallet = asyncHandler(async (req, res) => {
    const data = sanitizeFields(filterBody(req.body, ALLOWED_FIELDS), TEXT_LIMITS);
    data.user = req.user.id;

    const wallet = await Wallet.create(data);

    res.status(201).json({ success: true, data: wallet });
});

// @route   PUT /api/wallets/:id
exports.updateWallet = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator' });
    }

    const wallet = await Wallet.findOne({
        _id: req.params.id,
        user: req.user.id,
        isArchived: false
    });

    if (!wallet) {
        return res.status(404).json({ success: false, message: 'Portfel nie znaleziony' });
    }

    const data = sanitizeFields(filterBody(req.body, ALLOWED_FIELDS), TEXT_LIMITS);

    const updatedWallet = await Wallet.findByIdAndUpdate(req.params.id, data, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success: true, data: updatedWallet });
});

// @route   DELETE /api/wallets/:id
exports.deleteWallet = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator' });
    }

    const wallet = await Wallet.findOne({
        _id: req.params.id,
        user: req.user.id,
        isArchived: false
    });

    if (!wallet) {
        return res.status(404).json({ success: false, message: 'Portfel nie znaleziony' });
    }

    wallet.isArchived = true;
    await wallet.save();

    res.status(200).json({ success: true, message: 'Portfel zarchiwizowany' });
});

// @route   GET /api/wallets/total-balance
exports.getTotalBalance = asyncHandler(async (req, res) => {
    const result = await Wallet.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(req.user.id),
                isArchived: false,
                includeInTotal: true
            }
        },
        {
            $group: {
                _id: '$currency',
                total: { $sum: '$balance' }
            }
        }
    ]);

    res.status(200).json({ success: true, data: result });
});

// @route   PATCH /api/wallets/:id/balance
exports.updateBalance = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator' });
    }

    const { amount, operation } = req.body;

    if (!['add', 'subtract', 'set'].includes(operation)) {
        return res.status(400).json({ success: false, message: 'Operacja: add, subtract lub set' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
        return res.status(400).json({ success: false, message: 'Kwota musi być liczbą' });
    }

    const wallet = await Wallet.findOne({
        _id: req.params.id,
        user: req.user.id,
        isArchived: false
    });

    if (!wallet) {
        return res.status(404).json({ success: false, message: 'Portfel nie znaleziony' });
    }

    if (operation === 'add') wallet.balance += numAmount;
    else if (operation === 'subtract') wallet.balance -= numAmount;
    else wallet.balance = numAmount;

    await wallet.save();

    res.status(200).json({ success: true, data: wallet });
});

// @route   GET /api/wallets/type/:type
exports.getWalletsByType = asyncHandler(async (req, res) => {
    const { type } = req.params;

    if (!WALLET_TYPES.includes(type)) {
        return res.status(400).json({ success: false, message: `Typ: ${WALLET_TYPES.join(', ')}` });
    }

    const wallets = await Wallet.find({
        user: req.user.id,
        type,
        isArchived: false
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: wallets.length, data: wallets });
});
