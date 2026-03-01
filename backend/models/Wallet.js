const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Nazwa portfela jest wymagana'],
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['cash', 'bank', 'credit_card', 'savings', 'investment', 'other'],
    default: 'bank'
  },
  balance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'PLN',
    enum: ['PLN', 'EUR', 'USD', 'GBP']
  },
  color: {
    type: String,
    default: '#4CAF50'
  },
  icon: {
    type: String,
    default: 'wallet'
  },
  includeInTotal: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

walletSchema.index({ user: 1, isArchived: 1 });

module.exports = mongoose.model('Wallet', walletSchema);
