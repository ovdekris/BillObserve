const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Nazwa budżetu jest wymagana'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Kwota budżetu jest wymagana'],
    min: [0.01, 'Kwota musi być większa od 0']
  },
  period: {
    type: String,
    required: true,
    enum: ['weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  wallets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet'
  }],
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  notifyAt: {
    type: Number,
    min: 0,
    max: 100,
    default: 80
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

budgetSchema.index({ user: 1, isActive: 1 });
budgetSchema.index({ user: 1, categories: 1 });

module.exports = mongoose.model('Budget', budgetSchema);
