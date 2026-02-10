require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const { pool } = require('./core/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost',
        'http://localhost:80',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1',
        'http://127.0.0.1:3001',
        'http://192.168.56.1:3000',
        'http://192.168.56.1:3001',
        'http://192.168.1.31:3000',
        'http://192.168.1.31:3001',
        // Add dynamic origin handling if needed in future
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth-Token']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Support PHP-style method spoofing for Multipart forms
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// Static files (Uploads)
// Serving 'public' directory from the root of nodejs_backend
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api', routes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error:`, err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: statusCode === 500 ? 'Server Error' : 'Error',
        detail: process.env.APP_DEBUG === 'true' ? err.message : err.message // Simplified for now
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Start Server
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
    } catch (e) {
        console.error('Database connection failed:', e);
    }
});
