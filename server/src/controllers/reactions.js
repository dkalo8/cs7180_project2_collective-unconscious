const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const VALID_SYMBOLS = ['✦', '◎', '∿', '⌖'];

const addReaction = async (req, res) => {
    const { id: logId } = req.params;
    const { symbol } = req.body;
    const sessionToken = req.sessionToken;

    if (!VALID_SYMBOLS.includes(symbol)) {
        return res.status(400).json({ error: 'Invalid symbol' });
    }

    const log = await prisma.log.findUnique({ where: { id: logId } });
    if (!log) return res.status(404).json({ error: 'Log not found' });
    if (log.status !== 'COMPLETED') {
        return res.status(403).json({ error: 'Reactions only allowed on completed logs' });
    }

    try {
        await prisma.reaction.create({ data: { sessionToken, symbol, logId } });
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(409).json({ error: 'Already reacted with this symbol' });
        }
        throw err;
    }

    const count = await prisma.reaction.count({ where: { logId, symbol } });
    return res.status(201).json({ symbol, count });
};

const removeReaction = async (req, res) => {
    const { id: logId } = req.params;
    const { symbol } = req.body;
    const sessionToken = req.sessionToken;

    if (!VALID_SYMBOLS.includes(symbol)) {
        return res.status(400).json({ error: 'Invalid symbol' });
    }

    await prisma.reaction.deleteMany({ where: { sessionToken, logId, symbol } });

    const count = await prisma.reaction.count({ where: { logId, symbol } });
    return res.status(200).json({ symbol, count });
};

module.exports = { addReaction, removeReaction };
