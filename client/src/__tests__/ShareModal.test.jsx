import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ShareModal from '../components/ShareModal';

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
    
    // Switch to Stardew theme
    const stardewBtn = screen.getByText('Stardew').closest('button');
    fireEvent.click(stardewBtn);
    
    // Theme switching should update the state (indirectly checked by button background)
    expect(stardewBtn.style.backgroundColor).toBe('rgb(240, 240, 240)'); // #f0f0f0
  });

  it('calls onClose when clicking close button', () => {
    const onClose = vi.fn();
    render(<ShareModal log={mockLog} onClose={onClose} />);
    const closeBtn = screen.getByText('×');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
