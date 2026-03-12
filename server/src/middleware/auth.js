const { v4: uuidv4, validate: uuidValidate } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();


/**
 * sessionMiddleware
 * Ensures every incoming request has a valid UUIDv4 session token.
 * If not present or invalid, generates a new one and sets it as a cookie.
 */
const sessionMiddleware = (req, res, next) => {
    let token = req.cookies && req.cookies.sessionToken;

    // Supertest fallback for when cookie-parser isn't invoked or raw headers are used
    if (!token && req.headers && req.headers.cookie) {
        let cookieSource = req.headers.cookie;
        if (Array.isArray(cookieSource)) cookieSource = cookieSource.join(';');
        const match = cookieSource.match(/sessionToken=([^;]+)/);
        if (match) token = match[1];
    }

    // If no token or invalid token, create a new one
    // In non-production, allow arbitrary strings (e.g. "my-creator-token") for manual testing
    const isProduction = process.env.NODE_ENV === 'production';
    if (!token || (isProduction && !uuidValidate(token))) {
        token = uuidv4();

        // Config: HttpOnly, SameSite=Lax, Secure (in production), 30 days max age
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
        
        res.cookie('sessionToken', token, {
            httpOnly: true,
            sameSite: 'lax', // Now same-domain via proxy
            secure: isProduction,
            maxAge: maxAge,
        });
    }

    // Attach to request for downstream handlers
    req.sessionToken = token;
    next();
};

/**
 * requireAuth
 * A route guard that strictly checks if the request has a valid sessionToken.
 * Returns 401 if it's missing or invalid. Useful for endpoints that need an established session.
 */
const requireAuth = (req, res, next) => {
    // Attempt to grab token from established sessionMiddleware, OR fallback to cookies directly
    let token = req.sessionToken || (req.cookies && req.cookies.sessionToken);
    
    // Supertest mock handling
    if (!token && req.headers && req.headers.cookie) {
        let cookieSource = req.headers.cookie;
        if (Array.isArray(cookieSource)) {
            cookieSource = cookieSource.join(';');
        }
        const match = cookieSource.match(/sessionToken=([^;]+)/);
        if (match) token = match[1];
    }
    
    const isProductionAuth = process.env.NODE_ENV === 'production';
    if (!token || (isProductionAuth && !uuidValidate(token))) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing session token' });
    }
    
    req.sessionToken = token;
    next();
};

/**
 * requireWriter
 * Guard for log-specific endpoints. Expects `logId` in `req.params` or `req.body`.
 * Resolves the related `Writer` in the DB or creates a new one if it doesn't exist.
 * Assumes access control is handled later - THIS ONLY MANAGES THE WRITER RECORD.
 */
const requireWriter = async (req, res, next) => {
    const token = req.sessionToken;
    const logId = (req.params && req.params.logId) || (req.body && req.body.logId);
    
    const isProductionWriter = process.env.NODE_ENV === 'production';
    if (!token || (isProductionWriter && !uuidValidate(token))) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing session token' });
    }

    if (!logId) {
        return res.status(400).json({ error: 'Bad Request: Missing logId' });
    }
    
    try {
        // First check if the log even exists
        const log = await prisma.log.findUnique({
            where: { id: logId }
        });
        
        if (!log) {
            return res.status(404).json({ error: 'Log not found' });
        }
    
        // Find existing Writer for this session + log
        let writer = await prisma.writer.findFirst({
            where: {
                sessionToken: token,
                logId: logId
            }
        });
        
        if (!writer) {
            // Find current highest joinOrder to assign the next one
            const currentCount = await prisma.writer.count({
                where: { logId: logId }
            });
            
            // Generate a random color hex (basic implementation)
            const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
            
            writer = await prisma.writer.create({
                data: {
                    sessionToken: token,
                    logId: logId,
                    colorHex: randomColor,
                    joinOrder: currentCount + 1
                }
            });
        }
        
        req.writer = writer;
        next();
    } catch (error) {
        console.error('requireWriter Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * requireJwt
 * Verifies the JWT accessToken cookie. Attaches req.userId on success.
 * Returns 401 if token is missing, expired, or invalid.
 */
const requireJwt = (req, res, next) => {
    const token = req.cookies && req.cookies.accessToken;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No access token provided' });
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.userId;
        next();
    } catch {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired access token' });
    }
};

/**
 * requireAdmin
 * Guard for administrative endpoints.
 * First checks if the authenticated user has the "ADMIN" role.
 * Fallback: checks for a shared secret in the X-Admin-Secret header (useful for bootstrap).
 */
const requireAdmin = async (req, res, next) => {
    const adminSecret = process.env.ADMIN_SECRET;
    const headerSecret = req.headers['x-admin-secret'];

    // 1. Check shared secret fallback
    if (adminSecret && headerSecret === adminSecret) {
        return next();
    }

    // 2. Check JWT-based user role
    const token = req.cookies && req.cookies.accessToken;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Admin access or secret required' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: payload.userId } });
        
        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden: Admin role required' });
        }

        req.userId = user.id;
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = {
    sessionMiddleware,
    requireAuth,
    requireWriter,
    requireJwt,
    requireAdmin,
};

