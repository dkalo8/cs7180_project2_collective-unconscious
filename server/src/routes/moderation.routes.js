const express = require('express');
const router = express.Router();
const moderationController = require('../controllers/moderation.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Public/Authenticated reporting
router.post('/reports', requireAuth, moderationController.createReport);

// Admin-only moderation
router.get('/moderation/queue', requireAdmin, moderationController.getQueue);
router.post('/moderation/action', requireAdmin, moderationController.takeAction);

module.exports = router;
