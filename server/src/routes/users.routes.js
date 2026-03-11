const express = require('express');
const { getProfile, updateProfile } = require('../controllers/users.controller');
const { requireJwt } = require('../middleware/auth');

const router = express.Router();

// Public: view any user's profile
router.get('/:id', getProfile);

// Authenticated: update own profile
router.patch('/me', requireJwt, updateProfile);

module.exports = router;
