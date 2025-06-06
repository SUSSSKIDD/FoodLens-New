const mongoose = require('mongoose');

const cookedRecipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }, // Full recipe text used in Cooking Mode
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  language: {
    type: String,
    enum: ['en', 'hi'],
    default: 'en'
  },
  cookedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CookedRecipe', cookedRecipeSchema);
