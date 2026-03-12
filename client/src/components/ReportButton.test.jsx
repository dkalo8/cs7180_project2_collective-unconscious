import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReportButton from './ReportButton';

globalThis.fetch = vi.fn();

describe('ReportButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens form on click and handles report submission', async () => {
    fetch.mockResolvedValue({ ok: true });
    render(<ReportButton targetId="t1" targetType="TURN" />);
    
    const openBtn = screen.getByRole('button', { name: /\[report\]/i });
    fireEvent.click(openBtn);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'spam' } });
    
    const sendBtn = screen.getByRole('button', { name: /Send/i });
    fireEvent.click(sendBtn);

    // Transition to "Reported" state
    expect(await screen.findByText(/Reported/i)).toBeInTheDocument();

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/reports'), expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ targetType: 'TURN', targetId: 't1', reason: 'spam' })
    }));
  });

  it('handles submission error with alert', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    fetch.mockResolvedValue({ ok: false });
    
    render(<ReportButton targetId="t1" targetType="TURN" />);
    fireEvent.click(screen.getByRole('button', { name: /\[report\]/i }));
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'hateful' } });

    fireEvent.click(screen.getByRole('button', { name: /Send/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to submit report. Please try again.');
    });

    alertSpy.mockRestore();
  });
});
