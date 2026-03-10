const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { createLog } = require('../controllers/logs');

// POST /api/logs — requires a valid session token to identify the Keeper
router.post('/', requireAuth, createLog);

module.exports = router;
