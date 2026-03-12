import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LogCard from './LogCard';
import { LanguageProvider } from '../context/LanguageContext';

describe('LogCard Component', () => {
    const mockLog = {
        id: '123',
        title: 'Test Log',
        category: 'HAIKU',
        excerpt: 'This is a test excerpt that is long enough to demonstrate.',
        status: 'ACTIVE',
        participantCount: 3,
        createdAt: '2026-03-01T10:00:00Z'
    };

    const renderWithContext = (ui) => {
        return render(
            <BrowserRouter>
                <LanguageProvider>
                    <div id="test-wrapper">
                        {ui}
                    </div>
                </LanguageProvider>
            </BrowserRouter>
        );
    };

    it('renders log properties correctly in Chinese', () => {
        // Force zh locale in localStorage for the mock provider
        localStorage.setItem('lang', 'zh');
        renderWithContext(<LogCard log={mockLog} />);
        
        expect(screen.getByText('Test Log')).toBeInTheDocument();
        // Use a function matcher to find text even if split across nodes
        expect(screen.getByText((content) => content.includes('(俳句)'))).toBeInTheDocument();
        expect(screen.getByText(mockLog.excerpt)).toBeInTheDocument();
        
        const link = screen.getByRole('link', { name: 'Test Log' });
        expect(link.getAttribute('href')).toBe('/logs/123');
    });

    it('handles empty excerpt gracefully', () => {
        localStorage.setItem('lang', 'zh');
        const emptyLog = { ...mockLog, excerpt: '' };
        renderWithContext(<LogCard log={emptyLog} />);
        
        expect(screen.getByText('暂无内容')).toBeInTheDocument();
    });

    it('handles COMPLETED status by adding suffix', () => {
        localStorage.setItem('lang', 'zh');
        const completedLog = { ...mockLog, status: 'COMPLETED' };
        renderWithContext(<LogCard log={completedLog} />);
        
        expect(screen.getByText((content) => content.includes('(俳句, 已完成)'))).toBeInTheDocument();
    });
});
