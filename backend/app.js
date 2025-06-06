const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
require('./config/passport');
const detectRoutes = require('./routes/detectRoutes');
const authRoutes = require('./routes/authRoutes');
const app = express();
const recipeRoutes = require('./routes/recipeRoutes');
const path = require('path');
const geminiRoutes = require('./routes/geminiRoutes');

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));

app.use(helmet());
app.use(express.json());
app.use(passport.initialize());

// API Routes
app.use('/api/recipe', recipeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/detect', detectRoutes);
app.use('/api/gemini', geminiRoutes);

// Serve static files
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Catch-all route for SPA
// app.get('*', (req, res) => {
//   res.sendFile(path.join(publicPath, 'index.html'));
// });

module.exports = app;