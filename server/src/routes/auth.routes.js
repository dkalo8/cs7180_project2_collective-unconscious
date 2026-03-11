const express = require('express');
const passport = require('passport');
const { googleCallback, refreshToken, logout, getMe } = require('../controllers/auth.controller');
const { requireJwt } = require('../middleware/auth');

const router = express.Router();

// Step 1: Redirect to Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Step 2: Google redirects back here with a code
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed` }),
  googleCallback
);

// Token refresh
router.post('/refresh', refreshToken);

// Logout
router.post('/logout', logout);

// Current user
router.get('/me', requireJwt, getMe);

module.exports = router;
