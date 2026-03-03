const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: [true, 'Portfel jest wymagany']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Kategoria jest wymagana']
  },
  type: {
    type: String,
    required: true,
    enum: ['expense', 'income', 'transfer']
  },
  amount: {
    type: Number,
    required: [true, 'Kwota jest wymagana'],
    min: [0.01, 'Kwota musi być większa od 0']
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  walletTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    interval: {
      type: Number,
      default: 1
    },
    endDate: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    url: String
  }]
}, {
  timestamps: true
});

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, wallet: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
