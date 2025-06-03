const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false);

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false);

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);
