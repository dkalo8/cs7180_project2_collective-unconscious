import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LogDetailPage from './LogDetailPage';

// Mock dependencies
vi.mock('react-router-dom', () => ({
    useParams: () => ({ id: 'mock-log-id' })
}));

const mockInvalidateQueries = vi.fn();

vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn(),
    useQueryClient: () => ({
        invalidateQueries: mockInvalidateQueries
    })
}));

import { useQuery } from '@tanstack/react-query';

// Mock global fetch
globalThis.fetch = vi.fn();

describe('LogDetailPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        useQuery.mockReturnValue({ isLoading: true, isError: false, data: null });
        render(<LogDetailPage />);
        expect(screen.getByText(/Loading log.../)).toBeInTheDocument();
    });

    it('renders error state', () => {
        useQuery.mockReturnValue({ isLoading: false, isError: true, error: { message: 'Failed to fetch' }, data: null });
        render(<LogDetailPage />);
        expect(screen.getByText(/Error/)).toBeInTheDocument();
        expect(screen.getByText(/Failed to fetch/)).toBeInTheDocument();
    });

    it('renders a completed log state without the WriteZone', () => {
        const mockLog = {
            id: 'mock-log-id',
            title: 'My Completed Log',
            turnMode: 'STRUCTURED',
            status: 'COMPLETED',
            turnLimit: 2,
            turns: [
                { id: '1', content: 'First turn', writerId: 'w1' }
            ],
            writers: [
                { id: 'w1', nickname: 'Alice', colorHex: '#ff0000' }
            ]
        };
        useQuery.mockReturnValue({ isLoading: false, isError: false, data: mockLog });
        render(<LogDetailPage />);
        
        expect(screen.getByText('My Completed Log')).toBeInTheDocument();
        expect(screen.getByText('First turn')).toBeInTheDocument();
        
        // Assert "This log has been completed" is visible
        expect(screen.getByText(/This log has been completed/i)).toBeInTheDocument();
        
        // Assert WriteZone is NOT rendered by checking for the submit button or textarea
        expect(screen.queryByPlaceholderText('Type your turn...')).not.toBeInTheDocument();
    });

    it('handles the submit flow successfully on an active log', async () => {
        const mockLog = {
            id: 'mock-log-id',
            title: 'Active Log',
            turnMode: 'FREESTYLE',
            status: 'ACTIVE',
            perTurnLengthLimit: 500,
            turns: []
        };
        useQuery.mockReturnValue({ isLoading: false, isError: false, data: mockLog });
        
        // Mock successful submit definition
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 'new-turn' })
        });

        render(<LogDetailPage />);

        // The WriteZone is rendered because it's ACTIVE
        const textarea = screen.getByPlaceholderText('Type your turn...');
        const submitButton = screen.getByRole('button', { name: /Submit/i });

        fireEvent.change(textarea, { target: { value: 'A new contribution' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            // Assert fetch was called with the right body
            expect(fetch).toHaveBeenCalledWith('/api/logs/mock-log-id/turns', expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: 'A new contribution', nickname: '', colorHex: '#000' })
            }));

            // Assert react-query invalidated the cache to trigger a refetch
            expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['log', 'mock-log-id'] });
        });
    });
});
