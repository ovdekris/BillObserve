require('dotenv').config({ path: './config/.env' });
const express = require('express');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log(`Server is running on port: ${PORT}`);
});