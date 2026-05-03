// src/routes/researchRoutes.js

const express = require('express');
const { handleResearchRequest } = require('../controllers/researchController');

const router = express.Router();

// POST /api/research
router.post('/research', handleResearchRequest);

module.exports = router;
