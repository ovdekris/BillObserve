const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const authRoutes = require('./authRoutes');
const walletRoutes = require('./walletRoutes');
const transactionRoutes = require('./transactionRoutes');
const budgetRoutes = require('./budgetRoutes');
const categoryRoutes = require('./categoryRoutes');
const goalRoutes = require('./goalRoutes');
const assetRoutes = require('./assetRoutes');

// Publiczne routes
router.use('/auth', authRoutes);

// Chronione routes (wymagają autoryzacji)
router.use('/wallets', protect, walletRoutes);
router.use('/transactions', protect, transactionRoutes);
router.use('/budgets', protect, budgetRoutes);
router.use('/categories', protect, categoryRoutes);
router.use('/goals', protect, goalRoutes);
router.use('/assets', protect, assetRoutes);

module.exports = router;
