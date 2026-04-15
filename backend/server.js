require('dotenv').config({ path: './config/.env' });
const app = require('./app');
const connectDB = require('./config/db');

// Połącz z bazą danych
connectDB();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});

// Obsługa nieobsłużonych odrzuceń promise
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
    server.close(() => process.exit(1));
});

// Obsługa SIGTERM
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => process.exit(0));
});
