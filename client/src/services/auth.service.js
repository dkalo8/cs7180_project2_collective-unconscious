import { API_BASE_URL } from '../config';

const API_BASE = `${API_BASE_URL}/api`;

/**
 * Get the currently authenticated user (from JWT cookie).
 * Returns null if not logged in (401).
 */
export const getMe = async () => {
  const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error('Failed to fetch current user');
  return res.json();
};

/**
 * Get a user's public profile by ID.
 */
export const getProfile = async (id) => {
  const res = await fetch(`${API_BASE}/users/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);
  return res.json();
};

/**
 * Update the authenticated user's own profile.
 */
export const updateProfile = async ({ displayName, bio }) => {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName, bio }),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
};

/**
 * Redirect the browser to initiate Google OAuth login.
 */
export const loginWithGoogle = () => {
  window.location.href = `${API_BASE}/auth/google`;
};

/**
 * Log out the current user.
 */
export const logout = async () => {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
};
