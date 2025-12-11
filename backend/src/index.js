require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const { connectDB } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const planRoutes = require('./routes/planRoutes');
const depositRoutes = require('./routes/depositRoutes');
const blogRoutes = require('./routes/blogRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

const PORT = process.env.PORT || 5000;

// CORS: during development, allow requests from any origin
// We are not using cookies, so credentials are not required.
app.use(cors());

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Investment backend running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });
