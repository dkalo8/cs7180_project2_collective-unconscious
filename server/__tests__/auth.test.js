/**
 * S2-1: Auth endpoint tests (TDD — written before implementation)
 * Tests for Google OAuth flow, JWT token management, and /me endpoint.
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');

// We mock passport and prisma so tests don't require live Google or a real DB
jest.mock('passport', () => ({
  initialize: () => (req, res, next) => next(),
  session: () => (req, res, next) => next(),
  authenticate: (strategy, options) => (req, res, next) => {
    if (strategy === 'google') {
      if (options && options.failureRedirect) {
        // Simulate callback: attach mock user then call next
        req.user = { id: 'mock-user-id', displayName: 'Test User', email: 'test@gmail.com' };
        return next();
      }
      // Simulate redirect to Google
      return res.redirect('https://accounts.google.com/oauth/authorize?mock=true');
    }
    next();
  },
  use: jest.fn(),
  serializeUser: jest.fn(),
  deserializeUser: jest.fn(),
}));

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    writer: {
      findMany: jest.fn().mockResolvedValue([]),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const { PrismaClient } = require('@prisma/client');
const prismaMock = new PrismaClient();

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.GOOGLE_CLIENT_ID = 'mock-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'mock-client-secret';
process.env.GOOGLE_CALLBACK_URL = 'http://localhost:3000/api/auth/google/callback';
process.env.CLIENT_URL = 'http://localhost:5173';

const app = require('../src/index');

describe('Auth Routes — S2-1', () => {

  describe('GET /api/auth/google', () => {
    it('should redirect to Google OAuth URL', async () => {
      const res = await request(app).get('/api/auth/google');
      expect(res.status).toBe(302);
      expect(res.headers.location).toMatch(/accounts\.google\.com/);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user when a valid JWT access token is provided', async () => {
      const mockUser = { id: 'user-1', displayName: 'Test User', email: 'test@gmail.com', bio: null, avatarUrl: null };
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const token = jwt.sign({ userId: 'user-1' }, JWT_SECRET, { expiresIn: '15m' });
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `accessToken=${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: 'user-1', displayName: 'Test User', email: 'test@gmail.com' });
      // Should never expose sensitive fields
      expect(res.body.googleId).toBeUndefined();
    });

    it('should return 401 if no access token is provided', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should return 401 if access token is expired/invalid', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', 'accessToken=totally.invalid.token');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return a new access token given a valid refresh token', async () => {
      const storedToken = { token: 'hashed-refresh', userId: 'user-1', expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) };
      prismaMock.refreshToken.findUnique.mockResolvedValue(storedToken);
      prismaMock.refreshToken.delete.mockResolvedValue({});
      prismaMock.refreshToken.create.mockResolvedValue({});

      const refreshToken = jwt.sign({ userId: 'user-1' }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', `refreshToken=${refreshToken}`);

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });

    it('should return 401 if refresh token is missing', async () => {
      const res = await request(app).post('/api/auth/refresh');
      expect(res.status).toBe(401);
    });

    it('should return 401 if refresh token is invalid', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue(null);
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', 'refreshToken=bad.token.here');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear cookies and return 204 on logout', async () => {
      prismaMock.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      const refreshToken = jwt.sign({ userId: 'user-1' }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', `refreshToken=${refreshToken}`);

      expect(res.status).toBe(204);
      // Cookies should be cleared
      const setCookieHeader = res.headers['set-cookie'] || [];
      const clearsAccess = setCookieHeader.some(c => c.startsWith('accessToken=;') || c.includes('accessToken=;'));
      const clearsRefresh = setCookieHeader.some(c => c.startsWith('refreshToken=;') || c.includes('refreshToken=;'));
      expect(clearsAccess || clearsRefresh).toBe(true);
    });
  });
});
