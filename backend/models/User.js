const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  googleId: String,
  savedRecipes: [String],
  preferences: Object
});

module.exports = mongoose.model('User', userSchema);
