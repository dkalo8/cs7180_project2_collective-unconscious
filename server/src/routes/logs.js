const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { createLog, getLogs, getLogById, closeLog } = require('../controllers/logs');
const { submitTurn, skipTurn } = require('../controllers/turns');
const { addReaction, removeReaction } = require('../controllers/reactions');

// GET /api/logs — public discovery feed
router.get('/', getLogs);

// GET /api/logs/:id — fetch a single log with its turns and participants
router.get('/:id', getLogById);

// POST /api/logs — requires a valid session token to identify the Keeper
router.post('/', requireAuth, createLog);

// POST /api/logs/:id/turns — requires a valid session token
router.post('/:id/turns', requireAuth, submitTurn);

// POST /api/logs/:id/skip — requires a valid session token (Keeper only)
router.post('/:id/skip', requireAuth, skipTurn);

// PATCH /api/logs/:id/close — Keeper closes the log
router.patch('/:id/close', requireAuth, closeLog);

// POST /api/logs/:id/reactions — add a symbol reaction (session token required)
router.post('/:id/reactions', requireAuth, addReaction);

// DELETE /api/logs/:id/reactions — remove a symbol reaction (session token required)
router.delete('/:id/reactions', requireAuth, removeReaction);

module.exports = router;
