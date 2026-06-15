const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email jest wymagany'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Hasło jest wymagane'],
    minlength: 6,
    select: false
  },
  name: {
    type: String,
    required: [true, 'Imię jest wymagane'],
    trim: true
  },
  currency: {
    type: String,
    default: 'PLN',
    enum: ['PLN', 'EUR', 'USD', 'GBP']
  },
  settings: {
    notifications: {
      type: Boolean,
      default: true
    },
    darkMode: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'pl'
    }
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
