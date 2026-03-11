const express = require('express');
const router = express.Router();

// GET /api/dev/set-token/:token
// Sets the sessionToken cookie to any arbitrary value for manual testing.
router.get('/set-token/:token', (req, res) => {
    const { token } = req.params;
    res.cookie('sessionToken', token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.json({ ok: true, sessionToken: token });
});

module.exports = router;
