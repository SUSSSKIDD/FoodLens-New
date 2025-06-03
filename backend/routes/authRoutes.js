const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const admin = require('../config/firebase');

const router = express.Router();

// Email/password login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user) => {
    if (err || !user) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET);
    res.json({ token });
  })(req, res, next);
});

// Email/password signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });

  const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET);
  res.json({ token });
});

// Google Login with Firebase token
router.post('/google-login', async (req, res) => {
  const { idToken } = req.body;

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { name, email, uid } = decoded;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, googleId: uid });
    }

    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(401).json({ message: 'Invalid Firebase token' });
  }
});

module.exports = router;
