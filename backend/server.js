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

// Health Check Routes
app.get("/", (req, res) => {
  res.send("HARS Backend Server is running");
});

app.get("/api", (req, res) => {
  res.json({
    message: "HARS API is running successfully",
    endpoints: {
      signup: "/api/auth/signup",
      login: "/api/auth/login",
      hazards: "/api/hazards"
    }
  });
});

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
