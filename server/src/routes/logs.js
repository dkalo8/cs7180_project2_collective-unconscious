const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { createLog, getLogs } = require('../controllers/logs');
const { submitTurn, skipTurn } = require('../controllers/turns');

// GET /api/logs — public discovery feed
router.get('/', getLogs);

// POST /api/logs — requires a valid session token to identify the Keeper
router.post('/', requireAuth, createLog);

// POST /api/logs/:id/turns — requires a valid session token
router.post('/:id/turns', requireAuth, submitTurn);

// POST /api/logs/:id/skip — requires a valid session token (Keeper only)
router.post('/:id/skip', requireAuth, skipTurn);

module.exports = router;
