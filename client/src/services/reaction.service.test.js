import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as reactionService from './reaction.service';

globalThis.fetch = vi.fn();

describe('reaction.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('addReaction handles success', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ '✦': 1 })
    });
    const result = await reactionService.addReaction('log1', '✦');
    expect(result['✦']).toBe(1);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/logs/log1/reactions'), expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ symbol: '✦' })
    }));
  });

  it('removeReaction handles success', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({})
    });
    await reactionService.removeReaction('log1', '✦');
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/logs/log1/reactions'), expect.objectContaining({
      method: 'DELETE',
      body: JSON.stringify({ symbol: '✦' })
    }));
  });
});
