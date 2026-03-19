const Category = require('../models/Category');
const asyncHandler = require('../middleware/asyncHandler');

// @route   GET /api/categories
exports.getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ isArchived: false })
        .populate('subcategories')
        .sort({ order: 1 });

    res.status(200).json({
        success: true,
        count: categories.length,
        data: categories
    });
});


// @route   GET /api/categories/:id
exports.getCategory = asyncHandler(async (req, res) => {
    const category = await Category.findOne({
        _id: req.params.id,
        isArchived: false
    }).populate('subcategories');

    if (!category) {
        return res.status(404).json({
            success: false,
            message: 'Kategoria nie znaleziona'
        });
    }

    res.status(200).json({
        success: true,
        data: category
    });
});

// @route   GET /api/categories/type/:type
exports.getCategoriesByType = asyncHandler(async (req, res) => {
    const { type } = req.params;

    if (!['expense', 'income'].includes(type)) {
        return res.status(400).json({
            success: false,
            message: 'Nieprawidłowy typ kategorii'
        });
    }

    const categories = await Category.find({
        type,
        isArchived: false,
        parent: null
    }).populate('subcategories').sort({ order: 1 });

    res.status(200).json({
        success: true,
        count: categories.length,
        data: categories
    });
});
