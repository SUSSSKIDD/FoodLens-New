const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = require('./app');
const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected');

  // Start Express Server
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  process.exit(1); // Exit the app if DB fails
});         