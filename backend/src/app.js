// backend/src/app.js

const express = require('express');
const cors = require('cors');

// Import routes
const healthRouter   = require('./routes/health');
const researchRouter = require('./routes/researchRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', healthRouter);    // GET  /api/health
app.use('/api', researchRouter);  // POST /api/research

module.exports = app;
