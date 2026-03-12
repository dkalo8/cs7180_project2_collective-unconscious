import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ShareModal from './ShareModal';
import * as htmlToImage from 'html-to-image';

vi.mock('html-to-image', () => ({
  toPng: vi.fn()
}));

describe('ShareModal', () => {
  const mockOnClose = vi.fn();
  const mockLog = {
    id: 'l1',
    title: 'Test Log',
    turns: [
      { id: 't1', content: 'Hello', writerId: 'w1' },
      { id: 't2', content: 'World', isSkip: true }
    ],
    writers: [{ id: 'w1', name: 'Alice', colorHex: '#ff0000' }]
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with title and visible turns', () => {
    render(<ShareModal log={mockLog} onClose={mockOnClose} />);
    expect(screen.getByText('Test Log')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.queryByText('World')).not.toBeInTheDocument();
  });

  it('handles theme switching', () => {
    render(<ShareModal log={mockLog} onClose={mockOnClose} />);
    
    TRIAL_THEMES: ['Minimal', 'Nocturne', 'Parchment'].forEach(theme => {
      const btn = screen.getByRole('button', { name: new RegExp(theme, 'i') });
      fireEvent.click(btn);
      expect(btn).toHaveStyle({ fontWeight: 'bold' });
    });
  });

  it('handles download logic', async () => {
    htmlToImage.toPng.mockResolvedValue('data:image/png;base64,123');
    const linkClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    
    render(<ShareModal log={mockLog} onClose={mockOnClose} />);
    const downloadBtn = screen.getByRole('button', { name: /download png/i });
    fireEvent.click(downloadBtn);

    expect(downloadBtn).toHaveTextContent(/generating/i);
    
    await waitFor(() => {
      expect(htmlToImage.toPng).toHaveBeenCalled();
    });
    
    expect(downloadBtn).toHaveTextContent(/download png/i);
    linkClickSpy.mockRestore();
  });

  it('handles download error', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    htmlToImage.toPng.mockRejectedValue(new Error('Fail'));
    
    render(<ShareModal log={mockLog} onClose={mockOnClose} />);
    fireEvent.click(screen.getByRole('button', { name: /download png/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to generate image. Please try again.');
    });
    alertSpy.mockRestore();
  });

  it('calls onClose when Close button is clicked', () => {
    render(<ShareModal log={mockLog} onClose={mockOnClose} />);
    const closeBtn = screen.getByRole('button', { name: /×/i });
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
