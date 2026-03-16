require('dotenv').config({ path: './config/.env' });
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

connectDB();

// Bezpieczeństwo nagłówków HTTP
app.use(helmet());

// CORS - dostęp z frontendu
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}))

// Parsowanie JSON
app.use(express.json());

// Ochrona przed NoSQL injection
app.use(mongoSanitize());

// Rate limiting dla API
app.use('/api', apiLimiter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log(`Server is running on port: ${PORT}`);
});