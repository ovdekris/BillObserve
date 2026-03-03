const mongoose = require('mongoose');

const assetItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Nazwa aktywa jest wymagana'],
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['real_estate', 'vehicle', 'investment', 'electronics', 'jewelry', 'collectibles', 'other'],
    default: 'other'
  },
  currentValue: {
    type: Number,
    required: [true, 'Wartość aktywa jest wymagana'],
    min: 0
  },
  purchasePrice: {
    type: Number,
    min: 0
  },
  purchaseDate: {
    type: Date
  },
  currency: {
    type: String,
    default: 'PLN',
    enum: ['PLN', 'EUR', 'USD', 'GBP']
  },
  location: {
    type: String,
    trim: true
  },
  serialNumber: {
    type: String,
    trim: true
  },
  includeInNetWorth: {
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

assetItemSchema.index({ user: 1, type: 1, isArchived: 1 });

assetItemSchema.virtual('valueChange').get(function() {
  if (!this.purchasePrice) return null;
  return this.currentValue - this.purchasePrice;
});

assetItemSchema.set('toJSON', { virtuals: true });
assetItemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('AssetItem', assetItemSchema);
