const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { createLog, getLogs, getLogById, closeLog } = require('../controllers/logs');
const { submitTurn, skipTurn } = require('../controllers/turns');
const { addReaction, removeReaction } = require('../controllers/reactions');

/**
 * @swagger
 * components:
 *   schemas:
 *     Log:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         category:
 *           type: string
 *           enum: [FREEWRITING, HAIKU, POEM, SHORT_NOVEL]
 *         status:
 *           type: string
 *           enum: [ACTIVE, COMPLETED]
 *         accessMode:
 *           type: string
 *           enum: [OPEN, PRIVATE]
 *         turnMode:
 *           type: string
 *           enum: [FREESTYLE, STRUCTURED]
 *         participantLimit:
 *           type: integer
 *           nullable: true
 *         turnLimit:
 *           type: integer
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Turn:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         content:
 *           type: string
 *         turnOrder:
 *           type: integer
 *         writerId:
 *           type: string
 *           format: uuid
 *         isHidden:
 *           type: boolean
 *         isSkip:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: Log management and collaborative writing
 */

/**
 * @swagger
 * /api/logs:
 *   get:
 *     summary: Retrieve a list of logs
 *     tags: [Logs]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [FREEWRITING, HAIKU, POEM, SHORT_NOVEL]
 *         description: Filter logs by category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of logs per page
 *       - in: query
 *         name: canWrite
 *         schema:
 *           type: boolean
 *         description: If true, only returns logs that are open or where the user is already a participant
 *     responses:
 *       200:
 *         description: A paginated list of logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Log'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalCount:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 */
router.get('/', getLogs);

/**
 * @swagger
 * /api/logs/{id}:
 *   get:
 *     summary: Get a log by ID
 *     tags: [Logs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The log ID
 *     responses:
 *       200:
 *         description: Detailed log data including turns and writers
 *       404:
 *         description: Log not found
 */
router.get('/:id', getLogById);

/**
 * @swagger
 * /api/logs:
 *   post:
 *     summary: Create a new log
 *     tags: [Logs]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, accessMode, turnMode]
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [FREEWRITING, HAIKU, POEM, SHORT_NOVEL]
 *                 default: FREEWRITING
 *               accessMode:
 *                 type: string
 *                 enum: [OPEN, PRIVATE]
 *               turnMode:
 *                 type: string
 *                 enum: [FREESTYLE, STRUCTURED]
 *               seed:
 *                 type: string
 *               participantLimit:
 *                 type: integer
 *                 minimum: 2
 *               turnLimit:
 *                 type: integer
 *               turnTimeout:
 *                 type: integer
 *               perTurnLengthLimit:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Log created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', requireAuth, createLog);

/**
 * @swagger
 * /api/logs/{id}/turns:
 *   post:
 *     summary: Submit a turn to a log
 *     tags: [Logs]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Turn submitted
 *       400:
 *         description: Bad request (e.g., not your turn, log completed)
 */
router.post('/:id/turns', requireAuth, submitTurn);

/**
 * @swagger
 * /api/logs/{id}/skip:
 *   post:
 *     summary: Skip a turn (Keeper only)
 *     tags: [Logs]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Turn skipped
 *       403:
 *         description: Only the Keeper can skip turns
 */
router.post('/:id/skip', requireAuth, skipTurn);

/**
 * @swagger
 * /api/logs/{id}/close:
 *   patch:
 *     summary: Close a log (Keeper only)
 *     tags: [Logs]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Log closed
 *       403:
 *         description: Only the Keeper can close this log
 */
router.patch('/:id/close', requireAuth, closeLog);

/**
 * @swagger
 * /api/logs/{id}/reactions:
 *   post:
 *     summary: Add a reaction to a log
 *     tags: [Logs]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [symbol]
 *             properties:
 *               symbol:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reaction added
 */
router.post('/:id/reactions', requireAuth, addReaction);

/**
 * @swagger
 * /api/logs/{id}/reactions:
 *   delete:
 *     summary: Remove a reaction from a log
 *     tags: [Logs]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [symbol]
 *             properties:
 *               symbol:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reaction removed
 */
router.delete('/:id/reactions', requireAuth, removeReaction);

module.exports = router;
