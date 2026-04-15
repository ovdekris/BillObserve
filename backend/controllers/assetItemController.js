const AssetItem = require('../models/AssetItem');
const asyncHandler = require('../middleware/asyncHandler');
const mongoose = require('mongoose');
const { isValidObjectId, filterBody, sanitizeFields, CURRENCIES } = require('../utils/validators');

const ALLOWED_FIELDS = ['name', 'type', 'currentValue', 'purchasePrice', 'purchaseDate', 'currency', 'location', 'serialNumber', 'includeInNetWorth', 'description'];
const TEXT_LIMITS = { name: 100, description: 500, location: 200, serialNumber: 100 };
const ASSET_TYPES = ['real_estate', 'vehicle', 'investment', 'electronics', 'jewelry', 'collectibles', 'other'];

// @route   GET /api/assets
exports.getAssets = asyncHandler(async (req, res) => {
    const { type, includeArchived } = req.query;
    const filter = { user: req.user.id };

    if (!includeArchived || includeArchived !== 'true') {
        filter.isArchived = false;
    }

    if (type && ASSET_TYPES.includes(type)) {
        filter.type = type;
    }

    const assets = await AssetItem.find(filter).sort({ currentValue: -1 });

    res.status(200).json({
        success: true,
        count: assets.length,
        data: assets
    });
});

// @route   GET /api/assets/:id
exports.getAsset = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator' });
    }

    const asset = await AssetItem.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!asset) {
        return res.status(404).json({ success: false, message: 'Aktywo nie znalezione' });
    }

    res.status(200).json({ success: true, data: asset });
});

// @route   POST /api/assets
exports.createAsset = asyncHandler(async (req, res) => {
    const data = sanitizeFields(filterBody(req.body, ALLOWED_FIELDS), TEXT_LIMITS);
    data.user = req.user.id;

    if (data.type && !ASSET_TYPES.includes(data.type)) {
        return res.status(400).json({ success: false, message: `Typ: ${ASSET_TYPES.join(', ')}` });
    }

    const asset = await AssetItem.create(data);

    res.status(201).json({ success: true, data: asset });
});

// @route   PUT /api/assets/:id
exports.updateAsset = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator' });
    }

    const asset = await AssetItem.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!asset) {
        return res.status(404).json({ success: false, message: 'Aktywo nie znalezione' });
    }

    const data = sanitizeFields(filterBody(req.body, ALLOWED_FIELDS), TEXT_LIMITS);

    if (data.type && !ASSET_TYPES.includes(data.type)) {
        return res.status(400).json({ success: false, message: `Typ: ${ASSET_TYPES.join(', ')}` });
    }

    const updatedAsset = await AssetItem.findByIdAndUpdate(req.params.id, data, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success: true, data: updatedAsset });
});

// @route   DELETE /api/assets/:id
exports.deleteAsset = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator' });
    }

    const asset = await AssetItem.findOne({
        _id: req.params.id,
        user: req.user.id,
        isArchived: false
    });

    if (!asset) {
        return res.status(404).json({ success: false, message: 'Aktywo nie znalezione' });
    }

    asset.isArchived = true;
    await asset.save();

    res.status(200).json({ success: true, message: 'Aktywo zarchiwizowane' });
});

// @route   PATCH /api/assets/:id/value
exports.updateValue = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator' });
    }

    const { currentValue } = req.body;

    const numValue = Number(currentValue);
    if (isNaN(numValue) || numValue < 0) {
        return res.status(400).json({ success: false, message: 'Wartość musi być liczbą nieujemną' });
    }

    const asset = await AssetItem.findOne({
        _id: req.params.id,
        user: req.user.id,
        isArchived: false
    });

    if (!asset) {
        return res.status(404).json({ success: false, message: 'Aktywo nie znalezione' });
    }

    asset.currentValue = numValue;
    await asset.save();

    res.status(200).json({ success: true, data: asset });
});

// @route   GET /api/assets/net-worth
exports.getNetWorth = asyncHandler(async (req, res) => {
    const result = await AssetItem.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(req.user.id),
                isArchived: false,
                includeInNetWorth: true
            }
        },
        {
            $group: {
                _id: '$currency',
                totalValue: { $sum: '$currentValue' },
                totalPurchasePrice: { $sum: { $ifNull: ['$purchasePrice', 0] } },
                count: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json({ success: true, data: result });
});

// @route   GET /api/assets/type/:type
exports.getAssetsByType = asyncHandler(async (req, res) => {
    const { type } = req.params;

    if (!ASSET_TYPES.includes(type)) {
        return res.status(400).json({ success: false, message: `Typ: ${ASSET_TYPES.join(', ')}` });
    }

    const assets = await AssetItem.find({
        user: req.user.id,
        type,
        isArchived: false
    }).sort({ currentValue: -1 });

    res.status(200).json({ success: true, count: assets.length, data: assets });
});

// @route   GET /api/assets/stats
exports.getStats = asyncHandler(async (req, res) => {
    const byType = await AssetItem.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(req.user.id),
                isArchived: false
            }
        },
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                totalValue: { $sum: '$currentValue' },
                totalPurchasePrice: { $sum: { $ifNull: ['$purchasePrice', 0] } }
            }
        },
        { $sort: { totalValue: -1 } }
    ]);

    const byCurrency = await AssetItem.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(req.user.id),
                isArchived: false
            }
        },
        {
            $group: {
                _id: '$currency',
                count: { $sum: 1 },
                totalValue: { $sum: '$currentValue' }
            }
        }
    ]);

    const topAssets = await AssetItem.find({
        user: req.user.id,
        isArchived: false
    }).sort({ currentValue: -1 }).limit(5);

    res.status(200).json({
        success: true,
        data: {
            byType,
            byCurrency,
            topAssets
        }
    });
});

// @route   DELETE /api/assets/:id/permanent
exports.permanentDelete = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator' });
    }

    const asset = await AssetItem.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!asset) {
        return res.status(404).json({ success: false, message: 'Aktywo nie znalezione' });
    }

    await AssetItem.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Aktywo trwale usunięte' });
});

// @route   PATCH /api/assets/:id/restore
exports.restoreAsset = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy identyfikator' });
    }

    const asset = await AssetItem.findOne({
        _id: req.params.id,
        user: req.user.id,
        isArchived: true
    });

    if (!asset) {
        return res.status(404).json({ success: false, message: 'Zarchiwizowane aktywo nie znalezione' });
    }

    asset.isArchived = false;
    await asset.save();

    res.status(200).json({ success: true, data: asset });
});
