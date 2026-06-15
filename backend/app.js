const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('./middleware/sanitize');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// Bezpieczeństwo nagłówków HTTP
app.use(helmet());

// CORS - dostęp z frontendu
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parsowanie JSON
app.use(express.json({ limit: '10kb' }));

// Parsowanie URL-encoded
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Ochrona przed NoSQL injection
app.use(mongoSanitize);

// Rate limiting dla API
app.use('/api', apiLimiter);

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint nie znaleziony' });
});

// Error handler (musi być na końcu)
app.use(errorHandler);

module.exports = app;
