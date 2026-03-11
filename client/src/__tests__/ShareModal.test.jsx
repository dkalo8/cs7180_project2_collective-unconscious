import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ShareModal from '../src/components/ShareModal';

// Mock html-to-image
vi.mock('html-to-image', () => ({
  toPng: vi.fn().mockResolvedValue('data:image/png;base64,test')
}));

const mockLog = {
  id: 'log-1',
  title: 'Test Collective Log',
  status: 'COMPLETED',
  turns: [
    { id: 't1', content: 'Turn one', writerId: 'w1' },
    { id: 't2', content: 'Turn two', writerId: 'w2' }
  ],
  writers: [
    { id: 'w1', nickname: 'Alice', colorHex: '#ff0000' },
    { id: 'w2', nickname: 'Bob', colorHex: '#0000ff' }
  ]
};

describe('ShareModal', () => {
  it('renders log title and turns', () => {
    render(<ShareModal log={mockLog} onClose={() => {}} />);
    expect(screen.getByText('Test Collective Log')).toBeDefined();
    expect(screen.getByText('Turn one')).toBeDefined();
    expect(screen.getByText('Turn two')).toBeDefined();
  });

  it('allows switching themes', () => {
    render(<ShareModal log={mockLog} onClose={() => {}} />);
    
    // Default theme (Minimal) should have white background in container style
    const nocturneBtn = screen.getByText('Nocturne');
    fireEvent.click(nocturneBtn);
    
    // Theme switching should update the state (indirectly checked by button bolding or similar)
    expect(nocturneBtn.style.background).toBe('rgb(238, 238, 238)'); // #eee as rendered in test env
  });

  it('calls onClose when clicking close button', () => {
    const onClose = vi.fn();
    render(<ShareModal log={mockLog} onClose={onClose} />);
    const closeBtn = screen.getByText('×');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
