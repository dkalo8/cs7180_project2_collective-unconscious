// Set required env vars before any test imports the app,
// so passport-google-oauth20 doesn't throw on missing clientID.
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'mock-client-id';
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'mock-client-secret';
process.env.GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-session-secret';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
