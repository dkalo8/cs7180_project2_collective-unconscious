const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * GET /api/users/:id
 * Returns a public user profile. Does not expose email or googleId.
 */
const getProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        writers: {
          select: {
            log: {
              select: { id: true, title: true, category: true, status: true, createdAt: true },
            },
          },
        },
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Flatten writers → logs for a clean participation history
    const participationHistory = (user.writers || []).map((w) => w.log);
    return res.status(200).json({ ...user, writers: undefined, participationHistory });

  } catch (err) {
    console.error('getProfile error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * PATCH /api/users/me
 * Allows authenticated users to update their own display name and bio.
 */
const updateProfile = async (req, res) => {
  const { displayName, bio } = req.body;

  if (!displayName && bio === undefined) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  const data = {};
  if (displayName) data.displayName = displayName;
  if (bio !== undefined) data.bio = bio;

  try {
    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: { id: true, displayName: true, bio: true, avatarUrl: true, createdAt: true },
    });
    return res.status(200).json(user);
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getProfile, updateProfile };
