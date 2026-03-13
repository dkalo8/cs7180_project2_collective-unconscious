import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
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
        pagination: {
            page: 1,
            limit: 20,
            total: 40,
            totalPages: 2,
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderWithRouter = (ui, { initialEntries = ['/'] } = {}) => {
        return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
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
        expect(screen.getByText('40 logs')).toBeInTheDocument();
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

    it('fetches page 2 when next pagination button is clicked', async () => {
        LogService.fetchLogs.mockResolvedValue(mockFeedResponse);

        renderWithRouter(<HomePage />);

        await waitFor(() => {
            expect(screen.getByText('Feed Log 1')).toBeInTheDocument();
        });

        // Click page 2 button
        await userEvent.click(screen.getByText('2'));

        await waitFor(() => {
            expect(LogService.fetchLogs).toHaveBeenCalledWith(
                expect.objectContaining({ page: 2 })
            );
        });
    });

    it('resets to page 1 when category changes', async () => {
        // Start on page 2
        LogService.fetchLogs.mockResolvedValue(mockFeedResponse);

        renderWithRouter(<HomePage />, { initialEntries: ['/?page=2'] });

        await waitFor(() => {
            expect(screen.getByText('Feed Log 1')).toBeInTheDocument();
        });

        // Change category
        const select = screen.getByRole('combobox');
        await userEvent.selectOptions(select, 'HAIKU');

        await waitFor(() => {
            expect(LogService.fetchLogs).toHaveBeenCalledWith(
                expect.objectContaining({ page: 1, category: 'HAIKU' })
            );
        });
    });
});
