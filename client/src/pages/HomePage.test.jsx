import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './HomePage';
import * as LogService from '../services/log.service';

// Mock the LogService
vi.mock('../services/log.service', () => ({
    fetchLogs: vi.fn()
}));

describe('HomePage Component', () => {
    const mockFeedResponse = {
        data: [
            { id: '1', title: 'Feed Log 1', category: 'Freewriting', excerpt: 'Excerpt 1', status: 'ACTIVE', participantCount: 1 },
            { id: '2', title: 'Feed Log 2', category: 'Haiku', excerpt: 'Excerpt 2', status: 'COMPLETED', participantCount: 3 }
        ],
        meta: {
            currentPage: 1,
            totalPages: 2,
            hasNextPage: true,
            totalCount: 4
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderWithRouter = (ui) => {
        return render(<BrowserRouter>{ui}</BrowserRouter>);
    };

    it('renders the initial feed and handles loading state', async () => {
        LogService.fetchLogs.mockResolvedValueOnce(mockFeedResponse);

        renderWithRouter(<HomePage />);
        
        // Wait for fetch to complete and cards to appear
        await waitFor(() => {
            expect(screen.getByText('Feed Log 1')).toBeInTheDocument();
            expect(screen.getByText('Feed Log 2')).toBeInTheDocument();
        });

        // Ensure total count logic works properly
        expect(screen.getByText('4 logs')).toBeInTheDocument();
    });

    it('shows error state if fetch fails', async () => {
        // Silencing console.error to keep test output clean
        vi.spyOn(console, 'error').mockImplementation(() => {});
        LogService.fetchLogs.mockRejectedValueOnce(new Error('Network error'));

        renderWithRouter(<HomePage />);
        
        await waitFor(() => {
            expect(screen.getByText(/Failed to load/i)).toBeInTheDocument();
        });
        console.error.mockRestore();
    });
});
