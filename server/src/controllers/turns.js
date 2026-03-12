const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// =======================
// Shared helper: compute the next expected joinOrder in a STRUCTURED rotation.
// Looks at the last in-rotation turn (not isOutOfRotation) to advance the pointer.
// Skip turns DO count (they consume the writer's rotation slot).
// If the computed next writer just wrote an isOutOfRotation (entrance) turn,
// advance the pointer one more to avoid consecutive same-writer turns.
// =======================
function computeNextExpectedJoinOrder(turns, writers) {
    if (writers.length === 0) return null;

    const lastInRotation = [...turns].reverse().find(t => !t.isOutOfRotation);

    let nextJoinOrder;
    if (!lastInRotation) {
        nextJoinOrder = writers[0].joinOrder;
    } else {
        const lastWriter = writers.find(w => w.id === lastInRotation.writerId);
        if (!lastWriter) return writers[0].joinOrder;
        const later = writers.filter(w => w.joinOrder > lastWriter.joinOrder);
        nextJoinOrder = later.length > 0 ? later[0].joinOrder : writers[0].joinOrder;
    }

    // Collect all writers who have already written since the last in-rotation turn
    // (OOR entrance turns). They cannot be next — advance past them.
    const lastInRotationIdx = lastInRotation
        ? turns.findIndex(t => t.id === lastInRotation.id)
        : -1;
    const alreadyWroteIds = new Set(
        turns.slice(lastInRotationIdx + 1)
            .filter(t => !t.isSkip)
            .map(t => t.writerId)
    );

    // Starting from the computed next, find the first writer who hasn't
    // already written since the last in-rotation turn.
    const ordered = [...writers].sort((a, b) => a.joinOrder - b.joinOrder);
    const start = ordered.findIndex(w => w.joinOrder === nextJoinOrder);
    for (let i = 0; i < ordered.length; i++) {
        const candidate = ordered[(start + i) % ordered.length];
        if (!alreadyWroteIds.has(candidate.id)) {
            return candidate.joinOrder;
        }
    }

    return nextJoinOrder;
}

// =======================
// POST /api/logs/:id/turns
// =======================
const submitTurnSchema = z.object({
    content: z.string().min(1, 'Content is required'),
    nickname: z.string().optional(),
    colorHex: z.string().optional(),
    lang: z.enum(['en', 'zh', 'es']).optional()
});

const submitTurn = async (req, res) => {
    try {
        const token = req.sessionToken;
        const logId = req.params.id;

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Missing session token' });
        }

        const parseResult = submitTurnSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ errors: parseResult.error.flatten().fieldErrors });
        }

        const { content, nickname, colorHex, lang } = parseResult.data;

        const result = await prisma.$transaction(async (tx) => {
            const log = await tx.log.findUnique({
                where: { id: logId },
                include: {
                    writers: { orderBy: { joinOrder: 'asc' } },
                    turns: { orderBy: { turnOrder: 'asc' } }
                }
            });

            if (!log) throw new Error('NOT_FOUND');
            if (log.status === 'COMPLETED') throw new Error('COMPLETED');

            // ── Find or create writer ──
            let currentWriter = log.writers.find(w => w.sessionToken === token);
            let isNewJoin = false;

            if (!currentWriter) {
                // Check access code for private logs
                if (log.accessMode === 'PRIVATE') {
                    const submittedCode = req.body.accessCode;
                    if (!submittedCode || submittedCode !== log.accessCode) {
                        throw new Error('ACCESS_CODE_INVALID');
                    }
                }

                // Check participant limit
                if (log.participantLimit && log.writers.length >= log.participantLimit) {
                    throw new Error('PARTICIPANT_LIMIT_REACHED');
                }

                const nextJoinOrder = log.writers.length > 0 ? Math.max(...log.writers.map(w => w.joinOrder)) + 1 : 1;
                const { randomNick } = require('../utils/nickname');
                const generatedNickname = nickname && nickname.trim() !== '' ? nickname : randomNick(lang || 'en');
                const assignedColor = colorHex || '#d4d0c8';

                currentWriter = await tx.writer.create({
                    data: {
                        sessionToken: token,
                        logId: log.id,
                        nickname: generatedNickname,
                        colorHex: assignedColor,
                        joinOrder: nextJoinOrder,
                        userId: req.userId // Link to user if authenticated
                    }
                });
                isNewJoin = true;
                log.writers.push(currentWriter);
            }

            // ── Length check ──
            if (log.perTurnLengthLimit && content.length > log.perTurnLengthLimit) {
                throw new Error('LENGTH_EXCEEDED');
            }

            const activeWriters = log.writers;
            const previousTurns = log.turns;
            const lastTurn = previousTurns.length > 0 ? previousTurns[previousTurns.length - 1] : null;

            let isOutOfRotation = false;

            // ── Universal: block consecutive turns by the same writer ──
            if (!isNewJoin && lastTurn && !lastTurn.isSkip && lastTurn.writerId === currentWriter.id) {
                throw new Error('CONSECUTIVE_TURNS_NOT_ALLOWED');
            }

            // ── STRUCTURED validation ──
            if (log.turnMode === 'STRUCTURED') {
                if (isNewJoin) {
                    // A new joiner's turn is out-of-rotation ONLY if there's already an active
                    // rotation queue to disrupt. If nobody is in rotation yet, this turn
                    // establishes the queue (in-rotation).
                    const hasInRotationTurns = previousTurns.some(t => !t.isOutOfRotation);
                    isOutOfRotation = hasInRotationTurns;
                } else {
                    // Existing writer: must be their turn in the rotation
                    const expectJoinOrder = computeNextExpectedJoinOrder(previousTurns, activeWriters);

                    if (expectJoinOrder !== null && currentWriter.joinOrder !== expectJoinOrder) {
                        throw new Error('NOT_YOUR_TURN');
                    }
                }
            }

            // ── Insert the turn ──
            const newTurn = await tx.turn.create({
                data: {
                    content,
                    turnOrder: previousTurns.length + 1,
                    logId: log.id,
                    writerId: currentWriter.id,
                    isOutOfRotation
                }
            });

            // ── Re-evaluate COMPLETION ──
            // turnLimit = total number of real (non-skip) submitted turns before auto-close.
            let shouldComplete = false;
            if (log.turnLimit) {
                const totalRealTurns = previousTurns.filter(t => !t.isSkip).length + 1; // +1 for the turn just created
                if (totalRealTurns >= log.turnLimit) {
                    shouldComplete = true;
                }
            }

            if (shouldComplete) {
                await tx.log.update({
                    where: { id: log.id },
                    data: { status: 'COMPLETED' }
                });
            }

            const updatedLog = await tx.log.findUnique({
                where: { id: logId },
                include: {
                    writers: { orderBy: { joinOrder: 'asc' } },
                    turns: { orderBy: { turnOrder: 'asc' } }
                }
            });

            return updatedLog;
        });

        return res.status(201).json(result);

    } catch (error) {
        if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Log not found' });
        if (error.message === 'COMPLETED') return res.status(403).json({ error: 'Log has been completed' });
        if (error.message === 'ACCESS_CODE_INVALID') return res.status(403).json({ error: 'Invalid access code' });
        if (error.message === 'PARTICIPANT_LIMIT_REACHED') return res.status(403).json({ error: 'Participant limit reached' });
        if (error.message === 'LENGTH_EXCEEDED') return res.status(422).json({ error: 'Content exceeds maximum length' });
        if (error.message === 'CONSECUTIVE_TURNS_NOT_ALLOWED') return res.status(403).json({ error: 'Consecutive turns are not allowed' });
        if (error.message === 'NOT_YOUR_TURN') return res.status(403).json({ error: 'Not your turn' });

        if (error.code === 'P2002' && error.meta?.target?.includes('turnOrder')) {
            return res.status(409).json({ error: 'Race condition detected: Another turn was submitted simultaneously.' });
        }

        console.error('submitTurn Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// =======================
// POST /api/logs/:id/skip
// =======================
const skipTurn = async (req, res) => {
    try {
        const token = req.sessionToken;
        const logId = req.params.id;

        if (!token) return res.status(401).json({ error: 'Unauthorized: Missing session token' });

        const result = await prisma.$transaction(async (tx) => {
            const log = await tx.log.findUnique({
                where: { id: logId },
                include: {
                    writers: { orderBy: { joinOrder: 'asc' } },
                    turns: { orderBy: { turnOrder: 'asc' } }
                }
            });

            if (!log) throw new Error('NOT_FOUND');
            if (log.status === 'COMPLETED') throw new Error('COMPLETED');
            if (log.turnMode !== 'STRUCTURED') throw new Error('NOT_STRUCTURED');

            if (log.creatorToken !== token) {
                throw new Error('NOT_KEEPER');
            }

            const activeWriters = log.writers;
            if (activeWriters.length <= 1) {
                throw new Error('NOT_ENOUGH_WRITERS');
            }

            const expectJoinOrder = computeNextExpectedJoinOrder(log.turns, activeWriters);
            const turnSkippedWriter = activeWriters.find(w => w.joinOrder === expectJoinOrder);

            if (!turnSkippedWriter) throw new Error('NOT_ENOUGH_WRITERS');

            await tx.turn.create({
                data: {
                    content: '*Skipped by Keeper*',
                    turnOrder: log.turns.length + 1,
                    logId: log.id,
                    writerId: turnSkippedWriter.id,
                    isSkip: true
                }
            });

            return await tx.log.findUnique({
                where: { id: logId },
                include: { writers: true, turns: true }
            });
        });

        return res.status(200).json(result);

    } catch (error) {
        if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Log not found' });
        if (error.message === 'COMPLETED') return res.status(403).json({ error: 'Log has been completed' });
        if (error.message === 'NOT_STRUCTURED') return res.status(400).json({ error: 'Cannot skip turns in Freestyle mode' });
        if (error.message === 'NOT_KEEPER') return res.status(403).json({ error: 'Only the log Keeper can skip turns' });
        if (error.message === 'NOT_ENOUGH_WRITERS') return res.status(400).json({ error: 'Not enough writers to skip' });

        console.error('skipTurn Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { submitTurn, skipTurn, computeNextExpectedJoinOrder };
