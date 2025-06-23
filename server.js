const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const providerRoutes = require('./routes/provider');
const guideRoutes = require('./routes/guide');
const adminRoutes = require('./routes/admin');
const customerRoutes= require('./routes/customer')
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const path = require('path');
dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/guide', guideRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer',customerRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
