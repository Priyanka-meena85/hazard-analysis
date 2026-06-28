require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const hazardRoutes = require('./routes/hazardRoutes');

const app = express();

const path = require('path');

// Middleware
app.use(express.json());
app.use(cors());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../')));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hazards', hazardRoutes);

// Connect to DB and Start Server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
