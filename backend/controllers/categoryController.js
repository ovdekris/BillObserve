const Category = require('../models/Category');

// @desc    Pobierz wszystkie kategorie użytkownika
// @route   GET /api/categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ user: req.userId, isArchived: false })
            .populate('subcategories')
            .sort({ order: 1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Błąd serwera',
            error: error.message
        });
    }
};

// @desc    Pobierz pojedynczą kategorię
// @route   GET /api/categories/:id
exports.getCategory = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Błąd serwera',
            error: error.message
        });
    }
};

// @desc    Utwórz nową kategorię
// @route   POST /api/categories
exports.createCategory = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Nie udało się utworzyć kategorii',
            error: error.message
        });
    }
};

// @desc    Aktualizuj kategorię
// @route   PUT /api/categories/:id
exports.updateCategory = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Nie udało się zaktualizować kategorii',
            error: error.message
        });
    }
};

// @desc    Usuń kategorię (archiwizuj)
// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
    try {
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

        // Archiwizuj zamiast usuwać
        category.isArchived = true;
        await category.save();

        res.status(200).json({
            success: true,
            message: 'Kategoria została usunięta'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Błąd serwera',
            error: error.message
        });
    }
};

// @desc    Pobierz kategorie według typu (expense/income)
// @route   GET /api/categories/type/:type
exports.getCategoriesByType = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Błąd serwera',
            error: error.message
        });
    }
};
