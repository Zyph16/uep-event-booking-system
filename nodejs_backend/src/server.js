require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const methodOverride = require('method-override');

const routes = require('./routes');
const { pool } = require('./core/database');

const app = express();
const PORT = process.env.PORT || 3000;

const isProduction = process.env.NODE_ENV === 'production';


// =============================
// Security Middleware
// =============================
app.use(
    helmet({
        crossOriginResourcePolicy: false, // allow static images cross-origin
    })
);


// =============================
// CORS CONFIGURATION
// =============================

if (!isProduction) {
    // 🔥 DEVELOPMENT MODE (Allow everything locally)
    app.use(
        cors({
            origin: true, // reflect request origin
            credentials: true,
        })
    );
    console.log('CORS: Development mode enabled (all origins allowed)');
} else {
    // 🔒 PRODUCTION MODE (Strict)
    const allowedOrigins = [
        process.env.FRONTEND_URL, // set this in Vercel env
    ];

    app.use(
        cors({
            origin: function (origin, callback) {
                if (!origin) return callback(null, true);

                if (
                    allowedOrigins.includes(origin) ||
                    origin.endsWith('.vercel.app')
                ) {
                    return callback(null, origin);
                }

                return callback(
                    new Error(`CORS blocked for origin: ${origin}`)
                );
            },
            credentials: true,
        })
    );

    console.log('CORS: Production mode enabled');
}




// =============================
// Body Parsers
// =============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


// =============================
// Static Files
// =============================
app.use(express.static(path.join(__dirname, '../public')));


// =============================
// Rate Limiting
// =============================
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', apiLimiter);


// =============================
// Health Routes
// =============================
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'UEP Event Organizer Backend is successfully running!',
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'up',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});


// =============================
// API Routes
// =============================
app.use('/api', routes);


// =============================
// Global Error Handler
// =============================
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error:`, err);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        error: statusCode === 500 ? 'Server Error' : 'Error',
        detail:
            process.env.APP_DEBUG === 'true'
                ? err.message
                : err.message,
    });
});


// =============================
// 404 Handler
// =============================
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});


// =============================
// Export for Vercel
// =============================
module.exports = app;


// =============================
// Local Server Start
// =============================
if (!isProduction) {
    app.listen(PORT, '0.0.0.0', async () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Network access enabled: http://<YOUR-IP-ADDRESS>:${PORT}`);

        try {
            const connection = await pool.getConnection();
            console.log('Database connected successfully');
            connection.release();

            // Start Cron Jobs
            const autoRejectJob = require('./jobs/autoRejectJob');
            autoRejectJob.start();
            console.log('Auto-Reject Job scheduled.');
        } catch (e) {
            console.error('Database connection failed:', e);
        }
    });
} else {
    // Vercel serverless DB warmup
    pool.getConnection()
        .then((connection) => {
            console.log('Database connected successfully (Serverless)');
            connection.release();
        })
        .catch((e) => {
            console.error('Database connection failed (Serverless):', e);
        });
}