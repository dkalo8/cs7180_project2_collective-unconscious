const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Find an existing user by googleId, or create a new one from a Google profile.
 */
const findOrCreateUser = async (googleProfile) => {
  const { id: googleId, displayName, emails, photos } = googleProfile;
  const email = emails && emails[0] ? emails[0].value : null;
  const avatarUrl = photos && photos[0] ? photos[0].value : null;

  const user = await prisma.user.upsert({
    where: { googleId },
    update: { displayName, avatarUrl },
    create: { googleId, email, displayName, avatarUrl },
  });

  return user;
};

/**
 * Generate a JWT access token (short-lived) and a refresh token (long-lived).
 * Stores the refresh token in the DB.
 */
const generateTokens = async (userId) => {
  const accessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId, expiresAt },
  });

  return { accessToken, refreshToken };
};

/**
 * Rotate a refresh token: verify it, delete the old one, issue a new pair.
 */
const rotateRefreshToken = async (oldToken) => {
  let payload;
  try {
    payload = jwt.verify(oldToken, REFRESH_TOKEN_SECRET);
  } catch {
    throw new Error('Invalid refresh token');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: oldToken } });
  if (!stored || stored.expiresAt < new Date()) {
    // Token not in DB or expired — revoke everything for this user
    if (stored) await prisma.refreshToken.delete({ where: { token: oldToken } });
    throw new Error('Refresh token expired or revoked');
  }

  // Delete old token and issue new pair
  await prisma.refreshToken.delete({ where: { token: oldToken } });
  return generateTokens(payload.userId);
};

/**
 * Revoke all refresh tokens for a user (used on logout).
 */
const revokeAllRefreshTokens = async (userId) => {
  await prisma.refreshToken.deleteMany({ where: { userId } });
};

module.exports = { findOrCreateUser, generateTokens, rotateRefreshToken, revokeAllRefreshTokens };
