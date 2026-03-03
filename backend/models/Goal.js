const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Nazwa celu jest wymagana'],
    trim: true
  },
  targetAmount: {
    type: Number,
    required: [true, 'Kwota docelowa jest wymagana'],
    min: [0.01, 'Kwota musi być większa od 0']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  deadline: {
    type: Date
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

goalSchema.index({ user: 1, status: 1 });

goalSchema.virtual('progress').get(function() {
  return Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100));
});

goalSchema.set('toJSON', { virtuals: true });
goalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Goal', goalSchema);
