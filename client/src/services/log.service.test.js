import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as logService from './log.service';

globalThis.fetch = vi.fn();

describe('log.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchLogs handles parameters correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } })
    });

    const result = await logService.fetchLogs({ category: 'HAIKU', page: 2, limit: 10, canWrite: true });

    const [calledUrl] = fetch.mock.calls[0];
    expect(calledUrl).toContain('category=HAIKU');
    expect(calledUrl).toContain('page=2');
    expect(calledUrl).toContain('limit=10');
    expect(calledUrl).toContain('canWrite=true');
    expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ credentials: 'include' }));
    expect(result.pagination.totalPages).toBe(1);
  });

  it('getLogById handles success and 404', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'abc', title: 'Test' })
    });
    const log = await logService.getLogById('abc');
    expect(log.title).toBe('Test');

    fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(logService.getLogById('missing')).rejects.toThrow('Log not found');

    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(logService.getLogById('error')).rejects.toThrow('Failed to fetch log details');
  });

  it('closeLog sends PATCH and handles errors', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: '1', status: 'COMPLETED' }) });
    const res = await logService.closeLog('1');
    expect(res.status).toBe('COMPLETED');

    fetch.mockResolvedValueOnce({ 
      ok: false, 
      json: async () => ({ error: 'Unauthorized' }) 
    });
    await expect(logService.closeLog('2')).rejects.toThrow('Unauthorized');
  });
});
