import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authService from './auth.service';

globalThis.fetch = vi.fn();

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getMe handles success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'u1', name: 'Test User' })
    });
    const user = await authService.getMe();
    expect(user.name).toBe('Test User');
  });

  it('getProfile handles success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'u1', name: 'Public User' })
    });
    const profile = await authService.getProfile('u1');
    expect(profile.name).toBe('Public User');
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/users/u1'), expect.any(Object));
  });

  it('logout handles success', async () => {
    fetch.mockResolvedValueOnce({ ok: true });
    await authService.logout();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/auth/logout'), expect.objectContaining({
      method: 'POST'
    }));
  });

  it('updateProfile handles success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'u1', bio: 'New bio' })
    });
    const updated = await authService.updateProfile({ displayName: 'New Name', bio: 'New bio' });
    expect(updated.bio).toBe('New bio');
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/users/me'), expect.objectContaining({
      method: 'PATCH'
    }));
  });
});
