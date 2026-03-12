const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
    } catch (e) {
        console.error(`Error: ${e.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;