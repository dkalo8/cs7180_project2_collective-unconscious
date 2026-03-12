const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { generateTokens, rotateRefreshToken, revokeAllRefreshTokens } = require('../services/auth.service');
const prisma = new PrismaClient();

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax', // Now same-domain via proxy
  secure: process.env.NODE_ENV === 'production',
};

const ACCESS_COOKIE_OPTS = { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 }; // 15 min
const REFRESH_COOKIE_OPTS = { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 }; // 7 days

/**
 * GET /api/auth/google
 * Initiates the Google OAuth flow (handled by passport.authenticate in the route).
 */
const redirectToGoogle = (req, res) => {
  // This is a no-op — passport.authenticate handles the redirect
};

/**
 * GET /api/auth/google/callback
 * Called by Google after user grants permission. Issues JWT cookies and redirects to client.
 */
const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'OAuth authentication failed' });

    const { accessToken, refreshToken } = await generateTokens(user.id);

    // Link existing anonymous writer records to this user
    const sessionToken = req.sessionToken;
    if (sessionToken) {
      await prisma.writer.updateMany({
        where: { sessionToken, userId: null },
        data: { userId: user.id }
      });
      // Also ensure existing logs created by this session are marked with this user if they were null
      // (though Log model currently uses creatorToken, we might want to link them in a more formal way later)
    }

    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTS);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTS);

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(clientUrl);
  } catch (err) {
    console.error('googleCallback error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * POST /api/auth/refresh
 * Validates refresh token cookie, issues a new access + refresh token pair (rotation).
 */
const refreshToken = async (req, res) => {
  const token = req.cookies && req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token provided' });

  try {
    const { accessToken, refreshToken: newRefreshToken } = await rotateRefreshToken(token);
    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTS);
    res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTS);
    return res.status(200).json({ accessToken });
  } catch (err) {
    return res.status(401).json({ error: err.message || 'Invalid or expired refresh token' });
  }
};

/**
 * POST /api/auth/logout
 * Revokes all refresh tokens for the user, clears cookies.
 */
const logout = async (req, res) => {
  const token = req.cookies && req.cookies.refreshToken;

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await revokeAllRefreshTokens(payload.userId);
    } catch {
      // Token may already be expired — still clear cookies
    }
  }

  res.clearCookie('accessToken', COOKIE_OPTS);
  res.clearCookie('refreshToken', COOKIE_OPTS);
  return res.status(204).end();
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user (requires requireJwt middleware).
 */
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, displayName: true, email: true, bio: true, avatarUrl: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Link any orphan writer records from current session to this user
    const sessionToken = req.sessionToken;
    if (sessionToken) {
      await prisma.writer.updateMany({
        where: { sessionToken, userId: null },
        data: { userId: user.id }
      });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { redirectToGoogle, googleCallback, refreshToken, logout, getMe };
