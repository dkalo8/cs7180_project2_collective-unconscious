const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const submitTurnSchema = z.object({
    content: z.string().min(1, 'Content is required'),
    nickname: z.string().optional(),
    colorHex: z.string().optional()
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

        const { content, nickname, colorHex } = parseResult.data;

        const result = await prisma.$transaction(async (tx) => {
            const log = await tx.log.findUnique({
                where: { id: logId },
                include: {
                    writers: { orderBy: { joinOrder: 'asc' } },
                    turns: { orderBy: { turnOrder: 'asc' } }
                }
            });

            if (!log) {
                throw new Error('NOT_FOUND');
            }

            if (log.status === 'COMPLETED') {
                throw new Error('COMPLETED');
            }

            let currentWriter = log.writers.find(w => w.sessionToken === token);
            let isNewJoin = false;
            
            if (!currentWriter) {
                // Create implicitly
                const nextJoinOrder = log.writers.length > 0 ? Math.max(...log.writers.map(w => w.joinOrder)) + 1 : 1;
                const { randomNick } = require('../utils/nickname');
                const generatedNickname = nickname && nickname.trim() !== '' ? nickname : randomNick();
                const assignedColor = colorHex || '#d4d0c8';
                
                currentWriter = await tx.writer.create({
                    data: {
                        sessionToken: token,
                        logId: log.id,
                        nickname: generatedNickname,
                        colorHex: assignedColor,
                        joinOrder: nextJoinOrder
                    }
                });
                isNewJoin = true;
                log.writers.push(currentWriter); // Update local array
            }

            if (log.perTurnLengthLimit && content.length > log.perTurnLengthLimit) {
                throw new Error('LENGTH_EXCEEDED');
            }

            const activeWriters = log.writers;
            const previousTurns = log.turns;
            const lastTurn = previousTurns.length > 0 ? previousTurns[previousTurns.length - 1] : null;

            let isEntrance = false;

            // Handle Freestyle
            if (log.turnMode === 'FREESTYLE') {
                if (lastTurn && lastTurn.writerId === currentWriter.id) {
                    throw new Error('CONSECUTIVE_TURNS_NOT_ALLOWED');
                }
                
                if (log.roundLimit && (previousTurns.length + 1) >= log.roundLimit) {
                    // Turn limits out at this turn
                    // We don't return early, we just flag it
                }
            } 
            // Handle Structured
            else if (log.turnMode === 'STRUCTURED') {
                if (isNewJoin) {
                    // Option B: Jump the line!
                    isEntrance = true;
                } else {
                    let expectJoinOrder = 1;
                    // Find the last NON-ENTRANCE and NON-SKIP turn to determine rotation
                    const validLastTurn = [...previousTurns].reverse().find(t => !t.isEntrance);

                    if (validLastTurn) {
                        const lastWriter = activeWriters.find(w => w.id === validLastTurn.writerId);
                        if (lastWriter) {
                            const lastJoinOrder = lastWriter.joinOrder;
                            const nextWriters = activeWriters.filter(w => w.joinOrder > lastJoinOrder);
                            
                            if (nextWriters.length > 0) {
                                expectJoinOrder = nextWriters[0].joinOrder;
                            } else {
                                expectJoinOrder = activeWriters[0].joinOrder;
                            }
                        }
                    }

                    if (currentWriter.joinOrder !== expectJoinOrder) {
                        throw new Error('NOT_YOUR_TURN');
                    }
                }
            }

            // Update writer nickname if provided and changed
            if (!isNewJoin && nickname && currentWriter.nickname !== nickname) {
                await tx.writer.update({
                    where: { id: currentWriter.id },
                    data: { nickname }
                });
            }

            // Insert turn
            const newTurn = await tx.turn.create({
                data: {
                    content,
                    turnOrder: previousTurns.length + 1,
                    logId: log.id,
                    writerId: currentWriter.id,
                    isEntrance: isEntrance
                }
            });
            
            // Re-evaluate COMPLETION
            let shouldComplete = false;
            if (log.turnMode === 'STRUCTURED' && log.roundLimit) {
                // If the turn just completed was the last person in the round, AND it's the final round
                // Wait, if next expected join order is 1, a round just finished.
                const nextExpectedWriterOrder = currentWriter.joinOrder === Math.max(...activeWriters.map(w => w.joinOrder)) ? 1 : currentWriter.joinOrder + 1;
                
                if (nextExpectedWriterOrder === 1) {
                    // A round just finished
                    const keeper = activeWriters.find(w => w.joinOrder === 1);
                    if (keeper) {
                        // Count how many normal turns the keeper has
                        const updatedTurns = await tx.turn.findMany({ where: { logId: log.id }});
                        const keeperTurns = updatedTurns.filter(t => t.writerId === keeper.id && !t.isEntrance && !t.isSkip).length;
                        if (keeperTurns >= log.roundLimit) {
                            shouldComplete = true;
                        }
                    }
                }
            } else if (log.turnMode === 'FREESTYLE' && log.roundLimit) {
                if ((previousTurns.length + 1) >= log.roundLimit) {
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
        if (error.message === 'NOT_FOUND') {
            return res.status(404).json({ error: 'Log not found' });
        }
        if (error.message === 'COMPLETED') {
            return res.status(403).json({ error: 'Log has been completed' });
        }
        if (error.message === 'FORBIDDEN_NOT_PARTICIPANT') {
            return res.status(403).json({ error: 'You must join this log to participate' });
        }
        if (error.message === 'LENGTH_EXCEEDED') {
            return res.status(422).json({ error: 'Content exceeds maximum length' });
        }
        if (error.message === 'CONSECUTIVE_TURNS_NOT_ALLOWED') {
            return res.status(403).json({ error: 'Consecutive turns are not allowed in Freestyle mode' });
        }
        if (error.message === 'NOT_YOUR_TURN') {
            return res.status(403).json({ error: 'Not your turn' });
        }
        if (error.message === 'ROUND_LIMIT_REACHED') {
            return res.status(403).json({ error: 'Log has completed its round limit' });
        }
        
        if (error.code === 'P2002' && error.meta?.target?.includes('turnOrder')) {
            return res.status(409).json({ error: 'Race condition detected: Another turn was submitted simultaneously.' });
        }

        console.error('submitTurn Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

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

            const keeper = log.writers.find(w => w.joinOrder === 1);
            if (!keeper || keeper.sessionToken !== token) {
                throw new Error('NOT_KEEPER');
            }

            const activeWriters = log.writers;
            if (activeWriters.length <= 1) {
                throw new Error('NOT_ENOUGH_WRITERS');
            }

            const previousTurns = log.turns;
            let expectJoinOrder = 1;

            const validLastTurn = [...previousTurns].reverse().find(t => !t.isEntrance);
            if (validLastTurn) {
                const lastWriter = activeWriters.find(w => w.id === validLastTurn.writerId);
                if (lastWriter) {
                    const nextWriters = activeWriters.filter(w => w.joinOrder > lastWriter.joinOrder);
                    if (nextWriters.length > 0) {
                        expectJoinOrder = nextWriters[0].joinOrder;
                    } else {
                        expectJoinOrder = activeWriters[0].joinOrder;
                    }
                }
            }

            const turnSkippedWriter = activeWriters.find(w => w.joinOrder === expectJoinOrder);

            await tx.turn.create({
                data: {
                    content: '*Skipped by Keeper*',
                    turnOrder: previousTurns.length + 1,
                    logId: log.id,
                    writerId: turnSkippedWriter.id,
                    isSkip: true
                }
            });

            // No completion check here because skipped rounds don't count toward Keeper round limits typically, or do they?
            // Actually, if expectJoinOrder was 1 and Keeper skips themselves, does that count as a round? Let's just let normal turns dictate.

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

module.exports = { submitTurn, skipTurn };
