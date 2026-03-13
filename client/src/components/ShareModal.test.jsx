import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ShareModal from './ShareModal';
import { LanguageProvider } from '../context/LanguageContext';
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
    render(
      <LanguageProvider>
        <ShareModal log={mockLog} onClose={mockOnClose} />
      </LanguageProvider>
    );
    expect(screen.getByText('Test Log')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.queryByText('World')).not.toBeInTheDocument();
  });

  it('handles theme switching', () => {
    render(
      <LanguageProvider>
        <ShareModal log={mockLog} onClose={mockOnClose} />
      </LanguageProvider>
    );

    ['Plain', 'Notepad', 'Stardew'].forEach(theme => {
      const btn = screen.getByRole('button', { name: new RegExp(theme, 'i') });
      fireEvent.click(btn);
      expect(btn).toHaveStyle({ backgroundColor: 'rgb(240, 240, 240)' });
    });
  });

  it('handles download logic', async () => {
    htmlToImage.toPng.mockResolvedValue('data:image/png;base64,123');
    const linkClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(
      <LanguageProvider>
        <ShareModal log={mockLog} onClose={mockOnClose} />
      </LanguageProvider>
    );
    const downloadBtn = screen.getByRole('button', { name: /download image/i });
    fireEvent.click(downloadBtn);

    expect(downloadBtn).toHaveTextContent(/exporting/i);

    await waitFor(() => {
      expect(htmlToImage.toPng).toHaveBeenCalled();
    });

    expect(downloadBtn).toHaveTextContent(/download image/i);
    linkClickSpy.mockRestore();
  });

  it('handles download error', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    htmlToImage.toPng.mockRejectedValue(new Error('Fail'));

    render(
      <LanguageProvider>
        <ShareModal log={mockLog} onClose={mockOnClose} />
      </LanguageProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: /download image/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to generate image. Please try again.');
    });
    alertSpy.mockRestore();
  });

  it('calls onClose when Close button is clicked', () => {
    render(
      <LanguageProvider>
        <ShareModal log={mockLog} onClose={mockOnClose} />
      </LanguageProvider>
    );
    const closeBtn = screen.getByRole('button', { name: /×/i });
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
