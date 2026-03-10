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
    category: z.string().default('Freewriting'),
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

module.exports = { createLog };
