const Category = require('../models/Category');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Pobierz wszystkie kategorie użytkownika
// @route   GET /api/categories
exports.getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ user: req.userId, isArchived: false })
        .populate('subcategories')
        .sort({ order: 1 });

    res.status(200).json({
        success: true,
        count: categories.length,
        data: categories
    });
});

// @desc    Pobierz pojedynczą kategorię
// @route   GET /api/categories/:id
exports.getCategory = asyncHandler(async (req, res) => {
    const category = await Category.findOne({
        _id: req.params.id,
        user: req.userId
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

// @desc    Utwórz nową kategorię
// @route   POST /api/categories
exports.createCategory = asyncHandler(async (req, res) => {
    const { name, type, parent, color, icon } = req.body;

    const category = await Category.create({
        user: req.userId,
        name,
        type,
        parent: parent || null,
        color,
        icon
    });

    res.status(201).json({
        success: true,
        data: category
    });
});

// @desc    Aktualizuj kategorię
// @route   PUT /api/categories/:id
exports.updateCategory = asyncHandler(async (req, res) => {
    const { name, type, parent, color, icon, order } = req.body;

    let category = await Category.findOne({
        _id: req.params.id,
        user: req.userId
    });

    if (!category) {
        return res.status(404).json({
            success: false,
            message: 'Kategoria nie znaleziona'
        });
    }

    category = await Category.findByIdAndUpdate(
        req.params.id,
        { name, type, parent, color, icon, order },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        data: category
    });
});

// @desc    Usuń kategorię (archiwizuj)
// @route   DELETE /api/categories/:id
exports.deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findOne({
        _id: req.params.id,
        user: req.userId
    });

    if (!category) {
        return res.status(404).json({
            success: false,
            message: 'Kategoria nie znaleziona'
        });
    }

    category.isArchived = true;
    await category.save();

    res.status(200).json({
        success: true,
        message: 'Kategoria została usunięta'
    });
});

// @desc    Pobierz kategorie według typu (expense/income)
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
        user: req.userId,
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
