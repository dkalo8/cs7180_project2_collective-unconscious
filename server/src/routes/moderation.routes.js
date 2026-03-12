const express = require('express');
const router = express.Router();
const moderationController = require('../controllers/moderation.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         reporterToken:
 *           type: string
 *         logId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         turnId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         reason:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, DISMISSED, ACTIONED]
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Moderation
 *   description: Content reporting and moderation tools
 */

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Create a new report for a log or turn
 *     tags: [Moderation]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               logId:
 *                 type: string
 *               turnId:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Report created successfully
 */
router.post('/reports', requireAuth, moderationController.createReport);

/**
 * @swagger
 * /api/moderation/queue:
 *   get:
 *     summary: Get the moderation queue (Admin only)
 *     tags: [Moderation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending reports
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get('/moderation/queue', requireAdmin, moderationController.getQueue);

/**
 * @swagger
 * /api/moderation/action:
 *   post:
 *     summary: Take a moderation action (Admin only)
 *     tags: [Moderation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reportId, action]
 *             properties:
 *               reportId:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [HIDE_TURN, CLOSE_LOG, DISMISS]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Action taken successfully
 */
router.post('/moderation/action', requireAdmin, moderationController.takeAction);

module.exports = router;
