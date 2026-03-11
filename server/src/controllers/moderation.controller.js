const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * createReport
 * POST /api/reports
 * Body: { targetType: 'TURN' | 'LOG', targetId: string, reason: string }
 */
const createReport = async (req, res) => {
    const { targetType, targetId, reason } = req.body;
    const reporterToken = req.sessionToken;

    if (!targetType || !targetId || !reason) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['TURN', 'LOG'].includes(targetType)) {
        return res.status(400).json({ error: 'Invalid target type' });
    }

    try {
        const report = await prisma.report.create({
            data: {
                reporterToken,
                targetType,
                targetId,
                reason,
            },
        });
        res.status(201).json(report);
    } catch (error) {
        console.error('createReport Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * getQueue
 * GET /api/moderation/queue
 * Returns all PENDING reports.
 */
const getQueue = async (req, res) => {
    try {
        const reports = await prisma.report.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'desc' },
        });

        // Enrich reports with target details (optional but helpful)
        const enrichedReports = await Promise.all(reports.map(async (report) => {
            let targetSummary = '';
            if (report.targetType === 'TURN') {
                const turn = await prisma.turn.findUnique({ where: { id: report.targetId } });
                targetSummary = turn ? turn.content.substring(0, 50) + (turn.content.length > 50 ? '...' : '') : 'Turn deleted';
            } else if (report.targetType === 'LOG') {
                const log = await prisma.log.findUnique({ where: { id: report.targetId } });
                targetSummary = log ? `Log: ${log.title}` : 'Log deleted';
            }
            return { ...report, targetSummary };
        }));

        res.json(enrichedReports);
    } catch (error) {
        console.error('getQueue Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * takeAction
 * POST /api/moderation/action
 * Body: { reportId: string, action: 'HIDE_TURN' | 'CLOSE_LOG' | 'DISMISS', note?: string }
 */
const takeAction = async (req, res) => {
    const { reportId, action, note } = req.body;
    const moderatorId = req.userId || 'admin-system'; // Fallback if using X-Admin-Secret

    if (!reportId || !action) {
        return res.status(400).json({ error: 'Missing reportId or action' });
    }

    try {
        const report = await prisma.report.findUnique({ where: { id: reportId } });
        if (!report) return res.status(404).json({ error: 'Report not found' });

        await prisma.$transaction(async (tx) => {
            // 1. Log the action
            await tx.moderationAction.create({
                data: {
                    moderatorId,
                    action,
                    reportId,
                    targetId: report.targetId,
                    note,
                },
            });

            // 2. Perform the action
            if (action === 'HIDE_TURN' && report.targetType === 'TURN') {
                await tx.turn.update({
                    where: { id: report.targetId },
                    data: { isHidden: true },
                });
            } else if (action === 'CLOSE_LOG' && report.targetType === 'LOG') {
                await tx.log.update({
                    where: { id: report.targetId },
                    data: { status: 'COMPLETED' }, // Or a new status like 'CLOSED'
                });
            }

            // 3. Update report status
            await tx.report.update({
                where: { id: reportId },
                data: { status: action === 'DISMISS' ? 'DISMISSED' : 'ACTIONED' },
            });
        });

        res.json({ message: 'Action recorded and applied' });
    } catch (error) {
        console.error('takeAction Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    createReport,
    getQueue,
    takeAction,
};
