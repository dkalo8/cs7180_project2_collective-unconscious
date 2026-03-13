const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { computeNextExpectedJoinOrder } = require('./turns');

// Default palette - index 0 is the Keeper's color
const KEEPER_COLOR = '#FF0000';

// Utility: generate a 6-char alphanumeric access code
const generateAccessCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Zod schema for log creation
const createLogSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    accessMode: z.enum(['OPEN', 'PRIVATE']),
    turnMode: z.enum(['FREESTYLE', 'STRUCTURED']),
    // Server-side default so direct API calls without category still get 'FREEWRITING'
    category: z.enum(['FREEWRITING', 'HAIKU', 'POEM', 'SHORT_NOVEL']).default('FREEWRITING'),
    seed: z.string().optional(),
    // Unlimited by default (null); if provided must be >= 2 (no arbitrary cap)
    participantLimit: z
        .number()
        .int()
        .min(2, 'Participant limit must be at least 2')
        .optional()
        .nullable(),
    turnLimit: z.number().int().min(1).optional().nullable(),
    turnTimeout: z.number().int().min(1).optional().nullable(),
    perTurnLengthLimit: z.number().int().min(1).optional().nullable(),
});

const createLog = async (req, res) => {
    try {
        const token = req.sessionToken;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Missing session token' });
        }

        const parseResult = createLogSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ errors: parseResult.error.flatten().fieldErrors });
        }

        const data = parseResult.data;

        let accessCode = null;
        if (data.accessMode === 'PRIVATE') {
            accessCode = generateAccessCode();
        }

        // Transaction: create Log atomically
        const result = await prisma.$transaction(async (tx) => {
            const newLog = await tx.log.create({
                data: {
                    title: data.title,
                    accessMode: data.accessMode,
                    turnMode: data.turnMode,
                    category: data.category,
                    seed: data.seed,
                    participantLimit: data.participantLimit ?? null,
                    turnLimit: data.turnLimit ?? null,
                    turnTimeout: data.turnTimeout ?? null,
                    perTurnLengthLimit: data.perTurnLengthLimit ?? null,
                    accessCode,
                    status: 'ACTIVE',
                    creatorToken: token, // Add the creator's token to the record directly
                },
            });

            return { ...newLog };
        });

        return res.status(201).json(result);
    } catch (error) {
        console.error('createLog Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const getLogsQuerySchema = z.object({
    page:     z.coerce.number().int().min(1).default(1),
    limit:    z.coerce.number().int().min(1).max(100).default(20),
    category: z.string().optional(),
    canWrite: z.string().optional(),
});

const getLogs = async (req, res) => {
    try {
        const parseResult = getLogsQuerySchema.safeParse(req.query);
        if (!parseResult.success) {
            return res.status(400).json({ errors: parseResult.error.flatten().fieldErrors });
        }

        const { page: pageNum, limit: limitNum, category, canWrite } = parseResult.data;
        const skip = (pageNum - 1) * limitNum;

        const whereClause = {};
        if (category) {
            whereClause.category = category;
        }
        if (canWrite === 'true') {
            const token = req.sessionToken;
            whereClause.status = { not: 'COMPLETED' };
            whereClause.OR = [
                { accessMode: 'OPEN' },
                { writers: { some: { sessionToken: token } } },
            ];
        }

        const logs = await prisma.log.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limitNum,
            include: {
                _count: {
                    select: { writers: true }
                },
                turns: {
                    orderBy: { turnOrder: 'asc' },
                    take: 1
                }
            }
        });

        const totalCount = await prisma.log.count({ where: whereClause });

        const formattedLogs = logs.map(log => {
            let excerpt = '';
            const firstTurn = log.turns && log.turns.length > 0 ? log.turns[0] : null;
            
            if (firstTurn) {
                const content = firstTurn.isHidden ? '[content removed]' : firstTurn.content;
                excerpt = content.substring(0, 100);
                if (content.length > 100) excerpt += '...';
            } else if (log.seed) {
                excerpt = log.seed.substring(0, 100);
                if (log.seed.length > 100) excerpt += '...';
            }

            return {
                id: log.id,
                title: log.title,
                category: log.category,
                status: log.status,
                participantCount: log._count.writers,
                excerpt,
                createdAt: log.createdAt
            };
        });

        return res.status(200).json({
            data: formattedLogs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitNum),
            }
        });

    } catch (error) {
        console.error('getLogs Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const getLogById = async (req, res) => {
    try {
        const { id } = req.params;
        const token = req.sessionToken;

        const log = await prisma.log.findUnique({
            where: { id },
            include: {
                turns: {
                    orderBy: { turnOrder: 'asc' },
                },
                reactions: {
                    select: { symbol: true },
                },
                writers: {
                    select: {
                        id: true,
                        joinOrder: true,
                        colorHex: true,
                        logId: true,
                        createdAt: true,
                        nickname: true,
                        sessionToken: true, // needed for isMyTurn calc, stripped before response
                    },
                    orderBy: { joinOrder: 'asc' },
                }
            }
        });

        if (!log) {
            return res.status(404).json({ error: 'Log not found' });
        }

        const isCreator = typeof token === 'string' && log.creatorToken === token;

        // ── Writers who have submitted at least one turn (entrance counts; skip does not) ──
        const realTurnWriterIds = new Set(
            log.turns.filter(t => !t.isSkip).map(t => t.writerId)
        );
        const participatingWriters = log.writers.filter(w => realTurnWriterIds.has(w.id));

        // ── STRUCTURED: next expected writer in the rotation ──
        let nextExpectedJoinOrder = null;
        if (participatingWriters.length > 0) {
            nextExpectedJoinOrder = computeNextExpectedJoinOrder(log.turns, participatingWriters);
        }

        const nextWriter = nextExpectedJoinOrder !== null
            ? participatingWriters.find(w => w.joinOrder === nextExpectedJoinOrder) || null
            : null;
        const myWriter = log.writers.find(w => w.sessionToken === token) || null;

        // isMyTurn: true when
        //   - FREESTYLE: I have a writer record AND I wasn't the last to submit
        //   - STRUCTURED: it is literally my joinOrder that is expected next
        //   - OR I'm completely new (I haven't joined yet — I can always enter)
        let isMyTurn = false;
        if (log.status !== 'COMPLETED') {
            if (!myWriter) {
                // Not joined yet — can submit if participant limit not hit
                if (log.participantLimit && participatingWriters.length >= log.participantLimit) {
                    isMyTurn = false;
                } else {
                    isMyTurn = true;
                }
            } else if (log.turnMode === 'FREESTYLE') {
                // FREESTYLE: can't go twice in a row (check absolute last turn)
                const lastTurnAny = log.turns.length > 0 ? log.turns[log.turns.length - 1] : null;
                isMyTurn = !lastTurnAny || lastTurnAny.writerId !== myWriter.id;
            } else {
                // STRUCTURED: must be my joinOrder AND not consecutive
                const lastTurnAny = log.turns.length > 0 ? log.turns[log.turns.length - 1] : null;
                const wouldBeConsecutive = lastTurnAny && !lastTurnAny.isSkip && lastTurnAny.writerId === myWriter.id;
                isMyTurn = !wouldBeConsecutive && nextExpectedJoinOrder !== null && myWriter.joinOrder === nextExpectedJoinOrder;
            }
        }

        // Strip sessionTokens before sending to client
        const safeWriters = participatingWriters.map(({ sessionToken: _st, ...w }) => w);

        // Redact hidden turns unless the requester is an admin (checked via secret or role)
        const isAdmin = (req.headers['x-admin-secret'] === process.env.ADMIN_SECRET);
        // Note: we don't have a full User object here yet as it's not guarded by requireAdmin
        // but for now secret header is enough.

        const safeTurns = log.turns.map(t => {
            if (t.isHidden && !isAdmin) {
                return { ...t, content: '[content removed]' };
            }
            return t;
        });

        // Aggregate reactions into { '✦': 3, '◎': 1, ... }
        const reactionCounts = (log.reactions || []).reduce((acc, r) => {
            acc[r.symbol] = (acc[r.symbol] || 0) + 1;
            return acc;
        }, {});

        const keeperWriterRecord = log.writers.find(w => w.sessionToken === log.creatorToken);
        const keeperNickname = keeperWriterRecord?.nickname || null;

        const safeLog = {
            ...log,
            turns: safeTurns,
            writers: safeWriters,
            reactions: reactionCounts,
            isCreator,
            isMyTurn,
            keeperNickname,
            nextWriter: nextWriter ? { id: nextWriter.id, nickname: nextWriter.nickname, colorHex: nextWriter.colorHex, joinOrder: nextWriter.joinOrder } : null,
            myWriter: myWriter ? { id: myWriter.id, nickname: myWriter.nickname, colorHex: myWriter.colorHex, joinOrder: myWriter.joinOrder } : null,
        };
        delete safeLog.creatorToken;
        delete safeLog.accessCode;

        return res.status(200).json(safeLog);
    } catch (error) {
        console.error('getLogById Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// =======================
// PATCH /api/logs/:id/close
// =======================
const closeLog = async (req, res) => {
    try {
        const { id } = req.params;
        const token = req.sessionToken;

        const log = await prisma.log.findUnique({ where: { id } });

        if (!log) {
            return res.status(404).json({ error: 'Log not found' });
        }

        if (log.creatorToken !== token) {
            return res.status(403).json({ error: 'Only the Keeper can close this log' });
        }

        if (log.status === 'COMPLETED') {
            return res.status(400).json({ error: 'Log is already closed' });
        }

        const updated = await prisma.log.update({
            where: { id },
            data: { status: 'COMPLETED' },
        });

        return res.status(200).json(updated);
    } catch (error) {
        console.error('closeLog Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { createLog, getLogs, getLogById, closeLog };
