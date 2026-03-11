const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
    // Server-side default so direct API calls without category still get 'Freewriting'
    category: z.enum(['Freewriting', 'Haiku', 'Poem', 'Short Novel']).default('Freewriting'),
    seed: z.string().optional(),
    // Unlimited by default (null); if provided must be >= 2 (no arbitrary cap)
    participantLimit: z
        .number()
        .int()
        .min(2, 'Participant limit must be at least 2')
        .optional()
        .nullable(),
    roundLimit: z.number().int().min(1).optional().nullable(),
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

        // Transaction: create Log + Keeper Writer atomically
        const result = await prisma.$transaction(async (tx) => {
            const newLog = await tx.log.create({
                data: {
                    title: data.title,
                    accessMode: data.accessMode,
                    turnMode: data.turnMode,
                    category: data.category,
                    seed: data.seed,
                    participantLimit: data.participantLimit ?? null,
                    roundLimit: data.roundLimit ?? null,
                    turnTimeout: data.turnTimeout ?? null,
                    perTurnLengthLimit: data.perTurnLengthLimit ?? null,
                    accessCode,
                    status: 'ACTIVE',
                },
            });

            // Create the Keeper (Writer #1) with the default color
            const keeper = await tx.writer.create({
                data: {
                    sessionToken: token,
                    logId: newLog.id,
                    joinOrder: 1,
                    colorHex: KEEPER_COLOR,
                },
            });

            return { ...newLog, Keeper: keeper };
        });

        return res.status(201).json(result);
    } catch (error) {
        console.error('createLog Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const getLogs = async (req, res) => {
    try {
        const { category, page = '1', limit = '20' } = req.query;
        
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        
        if (isNaN(pageNum) || pageNum < 1) {
            return res.status(400).json({ error: 'Invalid page number' });
        }
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            return res.status(400).json({ error: 'Invalid limit parameter' });
        }

        const skip = (pageNum - 1) * limitNum;
        
        const whereClause = {};
        if (category) {
            whereClause.category = category;
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
            if (log.turns && log.turns.length > 0) {
                // Return plain text excerpt (first ~100 chars)
                excerpt = log.turns[0].content.substring(0, 100);
                if (log.turns[0].content.length > 100) excerpt += '...';
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
            meta: {
                totalCount,
                currentPage: pageNum,
                totalPages: Math.ceil(totalCount / limitNum),
                hasNextPage: skip + formattedLogs.length < totalCount
            }
        });

    } catch (error) {
        console.error('getLogs Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { createLog, getLogs };
