// src/app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import countriesRouter from './controllers/countries.controller';

dotenv.config(); // Load env vars from .env

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/countries', countriesRouter);

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

export default app;
