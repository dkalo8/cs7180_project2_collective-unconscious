import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LogCard from './LogCard';

describe('LogCard Component', () => {
    const mockLog = {
        id: '123',
        title: 'Test Log',
        category: 'Haiku',
        excerpt: 'This is a test excerpt that is long enough to demonstrate.',
        status: 'ACTIVE',
        participantCount: 3,
        createdAt: '2026-03-01T10:00:00Z'
    };

    const renderWithRouter = (ui) => {
        return render(<BrowserRouter>{ui}</BrowserRouter>);
    };

    it('renders log properties correctly', () => {
        renderWithRouter(<LogCard log={mockLog} />);
        
        expect(screen.getByText('Test Log')).toBeInTheDocument();
        expect(screen.getByText('(俳句)')).toBeInTheDocument();
        expect(screen.getByText(mockLog.excerpt)).toBeInTheDocument();
        
        const link = screen.getByRole('link', { name: 'Test Log' });
        expect(link.getAttribute('href')).toBe('/logs/123');
    });

    it('handles empty excerpt gracefully', () => {
        const emptyLog = { ...mockLog, excerpt: '' };
        renderWithRouter(<LogCard log={emptyLog} />);
        
        expect(screen.getByText('暂无内容')).toBeInTheDocument();
    });

    it('handles COMPLETED status by adding suffix', () => {
        const completedLog = { ...mockLog, status: 'COMPLETED' };
        renderWithRouter(<LogCard log={completedLog} />);
        
        expect(screen.getByText('(俳句, 已完成)')).toBeInTheDocument();
    });
});
