require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const routes = require('./routes');
const { pool } = require('./core/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: false })); // allows serving static images cross-origin

// Middleware
const allowedOrigins = [
    "https://uepbooking-git-main-zyph16s-projects.vercel.app",
    "https://uepbooking.vercel.app",
    "http://localhost:3000"
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, origin); // MUST return the exact origin when credentials: true
        }

        // Allow localhost and standard local network IPs
        if (origin.startsWith('http://localhost') ||
            origin.startsWith('http://127.0.0.1') ||
            origin.match(/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/) ||
            origin.match(/^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/) ||
            origin.match(/^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}(:\d+)?$/)) {
            return callback(null, origin); // MUST return the exact origin when credentials: true
        }

        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Auth-Token']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // explicitly apply to OPTIONS preflights

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Support PHP-style method spoofing for Multipart forms
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// Handle pre-flight explicitly (moved up)

// Static files (Uploads)
// Serving 'public' directory from the root of nodejs_backend
app.use(express.static(path.join(__dirname, '../public')));

// Rate Limiting (Basic Protection against DDoS)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api', apiLimiter);

// Testing / Health Check Routes
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'UEP Event Organizer Backend is successfully running!'
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'up',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

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

// Export the app for Vercel Serverless Functions
module.exports = app;

// Only bind to a specific port if running locally (not Vercel)
// Vercel Serverless functions do not support persistent app.listen()
if (process.env.NODE_ENV !== 'production') {
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
    // If in production (Vercel), we still want to initialize the database connection pool eagerly
    pool.getConnection().then(connection => {
        console.log('Database connected successfully (Serverless)');
        connection.release();
    }).catch(e => {
        console.error('Database connection failed (Serverless):', e);
    });
}
