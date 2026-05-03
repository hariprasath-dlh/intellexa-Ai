// backend/src/routes/health.js

const express = require('express');
const { healthCheck } = require('../controllers/healthController');

const router = express.Router();

// GET /health
router.get('/health', healthCheck);

module.exports = router;
