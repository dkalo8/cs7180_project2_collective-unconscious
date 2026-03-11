/**
 * S2-1: User profile endpoint tests (TDD — written before implementation)
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('passport', () => ({
  initialize: () => (req, res, next) => next(),
  session: () => (req, res, next) => next(),
  authenticate: () => (req, res, next) => next(),
  use: jest.fn(),
  serializeUser: jest.fn(),
  deserializeUser: jest.fn(),
}));

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
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

describe('User Profile Routes — S2-1', () => {
  const makeToken = (userId = 'user-1') =>
    jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });

  describe('GET /api/users/:id', () => {
    it('should return public profile for an existing user', async () => {
      const mockUser = {
        id: 'user-1',
        displayName: 'Test User',
        bio: 'Hello!',
        avatarUrl: null,
        createdAt: new Date().toISOString(),
      };
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const res = await request(app).get('/api/users/user-1');
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: 'user-1', displayName: 'Test User' });
      // Email should NOT be exposed on public profile
      expect(res.body.email).toBeUndefined();
      expect(res.body.googleId).toBeUndefined();
    });

    it('should return 404 for a non-existent user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/users/nonexistent-id');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should update the profile when authenticated', async () => {
      const updatedUser = { id: 'user-1', displayName: 'New Name', bio: 'Updated bio', avatarUrl: null };
      prismaMock.user.update.mockResolvedValue(updatedUser);

      const res = await request(app)
        .patch('/api/users/me')
        .set('Cookie', `accessToken=${makeToken('user-1')}`)
        .send({ displayName: 'New Name', bio: 'Updated bio' });

      expect(res.status).toBe(200);
      expect(res.body.displayName).toBe('New Name');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .send({ displayName: 'Hacker' });
      expect(res.status).toBe(401);
    });

    it('should return 400 if no valid fields are provided', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Cookie', `accessToken=${makeToken('user-1')}`)
        .send({});
      expect(res.status).toBe(400);
    });
  });
});
