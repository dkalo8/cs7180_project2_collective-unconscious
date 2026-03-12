import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LogDetailPage from './LogDetailPage';

// Mock dependencies
vi.mock('react-router-dom', () => ({
    useParams: () => ({ id: 'mock-log-id' })
}));

// Helper: a log with two writers of distinct colors
const mockColorLog = {
    id: 'mock-log-id',
    title: 'Color Toggle Log',
    turnMode: 'STRUCTURED',
    accessMode: 'OPEN',
    status: 'ACTIVE',
    isMyTurn: false,
    turns: [
        { id: 't1', content: 'Red turn', writerId: 'w1' },
        { id: 't2', content: 'Blue turn', writerId: 'w2' },
    ],
    writers: [
        { id: 'w1', nickname: 'Alice', colorHex: '#FF0000' },
        { id: 'w2', nickname: 'Bob',   colorHex: '#0000FF' },
    ],
};

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
        sessionStorage.clear();
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
        expect(screen.queryByPlaceholderText(/continue the piece/i)).not.toBeInTheDocument();

        // Assert Share as Image button IS rendered
        expect(screen.getByText(/Share as Image/i)).toBeInTheDocument();
    });

    // ── Color toggle tests (S1-7) ──────────────────────────────────────────
    it('renders a "Hide colors" button on the log detail page', () => {
        useQuery.mockReturnValue({ isLoading: false, isError: false, data: mockColorLog });
        render(<LogDetailPage />);
        expect(screen.getByRole('button', { name: /hide colors/i })).toBeInTheDocument();
    });

    it('turns are rendered in author colors by default', () => {
        useQuery.mockReturnValue({ isLoading: false, isError: false, data: mockColorLog });
        const { container } = render(<LogDetailPage />);
        const redTurn = screen.getByText('Red turn');
        const blueTurn = screen.getByText('Blue turn');
        expect(redTurn).toHaveStyle({ color: '#FF0000' });
        expect(blueTurn).toHaveStyle({ color: '#0000FF' });
    });

    it('clicking "Hide colors" renders all turns in black and changes button label to "Show colors"', () => {
        useQuery.mockReturnValue({ isLoading: false, isError: false, data: mockColorLog });
        render(<LogDetailPage />);

        const toggle = screen.getByRole('button', { name: /hide colors/i });
        fireEvent.click(toggle);

        expect(screen.getByText('Red turn')).toHaveStyle({ color: '#000000' });
        expect(screen.getByText('Blue turn')).toHaveStyle({ color: '#000000' });
        expect(screen.getByRole('button', { name: /show colors/i })).toBeInTheDocument();
    });

    it('clicking "Show colors" after hiding restores author colors', () => {
        useQuery.mockReturnValue({ isLoading: false, isError: false, data: mockColorLog });
        render(<LogDetailPage />);

        fireEvent.click(screen.getByRole('button', { name: /hide colors/i }));
        fireEvent.click(screen.getByRole('button', { name: /show colors/i }));

        expect(screen.getByText('Red turn')).toHaveStyle({ color: '#FF0000' });
        expect(screen.getByText('Blue turn')).toHaveStyle({ color: '#0000FF' });
    });

    it('color toggle preference is saved to sessionStorage', () => {
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
        useQuery.mockReturnValue({ isLoading: false, isError: false, data: mockColorLog });
        render(<LogDetailPage />);

        fireEvent.click(screen.getByRole('button', { name: /hide colors/i }));
        expect(setItemSpy).toHaveBeenCalledWith('colorsHidden', 'true');
    });

    it('color toggle restores from sessionStorage on mount', () => {
        sessionStorage.setItem('colorsHidden', 'true');
        useQuery.mockReturnValue({ isLoading: false, isError: false, data: mockColorLog });
        render(<LogDetailPage />);

        expect(screen.getByText('Red turn')).toHaveStyle({ color: '#000000' });
        expect(screen.getByRole('button', { name: /show colors/i })).toBeInTheDocument();
        sessionStorage.removeItem('colorsHidden');
    });
    // ──────────────────────────────────────────────────────────────────────

    it('handles the submit flow successfully on an active log', async () => {
        const mockLog = {
            id: 'mock-log-id',
            title: 'Active Log',
            turnMode: 'FREESTYLE',
            accessMode: 'OPEN',
            status: 'ACTIVE',
            perTurnLengthLimit: 500,
            isMyTurn: true,
            myWriter: null,
            turns: [],
            writers: [],
        };
        useQuery.mockReturnValue({ isLoading: false, isError: false, data: mockLog });
        
        // Mock successful submit definition
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 'new-turn' })
        });

        render(<LogDetailPage />);

        // The WriteZone is rendered because it's ACTIVE
        const textarea = screen.getByPlaceholderText(/continue the piece/i);
        const submitButton = screen.getByRole('button', { name: /submit/i });

        fireEvent.change(textarea, { target: { value: 'A new contribution' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            // Assert fetch was called with the right body
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/logs/mock-log-id/turns'), expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: 'A new contribution', nickname: '', colorHex: '#000' })
            }));

            // Assert react-query invalidated the cache to trigger a refetch
            expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['log', 'mock-log-id'] });
        });
    });

    it('invokes skipTurnApi when creator clicks skip turn', async () => {
        const creatorLog = { ...mockColorLog, isCreator: true, turnMode: 'STRUCTURED' };
        useQuery.mockReturnValue({ isLoading: false, isError: false, data: creatorLog });
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'skip-1' }) });

        render(<LogDetailPage />);

        const skipBtn = screen.getByRole('button', { name: /skip turn/i });
        fireEvent.click(skipBtn);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/logs/mock-log-id/skip'), expect.objectContaining({ method: 'POST' }));
            expect(mockInvalidateQueries).toHaveBeenCalled();
        });
    });

    it('invokes closeLog when creator clicks close log', async () => {
        const creatorLog = { ...mockColorLog, isCreator: true, status: 'ACTIVE' };
        useQuery.mockReturnValue({ isLoading: false, isError: false, data: creatorLog });
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'mock-log-id', status: 'COMPLETED' }) });

        render(<LogDetailPage />);

        const closeBtn = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeBtn);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/logs/mock-log-id/close'), expect.objectContaining({ method: 'PATCH' }));
            expect(mockInvalidateQueries).toHaveBeenCalled();
        });
    });

    it('handles reaction clicking (add and remove)', async () => {
        const completedLog = { ...mockColorLog, status: 'COMPLETED', reactions: { '✦': 1 } };
        useQuery.mockReturnValue({ isLoading: false, isError: false, data: completedLog });
        
        // Add reaction mock
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ count: 2 }) });

        render(<LogDetailPage />);

        // Click a reaction that hasn't been "reacted" by the current user (mock state is local)
        const reactionBtn = screen.getByText('◎');
        fireEvent.click(reactionBtn);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/logs/mock-log-id/reactions'), expect.objectContaining({ method: 'POST' }));
        });
    });

    it('renders private log access code input and conditional WriteZone', async () => {
        const privateLog = { 
            ...mockColorLog, 
            accessMode: 'PRIVATE', 
            isMyTurn: true, 
            myWriter: null,
            turns: [],
            writers: [] 
        };
        useQuery.mockReturnValue({ isLoading: false, isError: false, data: privateLog });

        render(<LogDetailPage />);

        expect(screen.getByPlaceholderText(/enter code/i)).toBeInTheDocument();
        // WriteZone shouldn't be visible yet because accessCode is empty
        expect(screen.queryByPlaceholderText(/continue the piece/i)).not.toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText(/enter code/i), { target: { value: 'secret123' } });

        // Now WriteZone should appear
        expect(screen.getByPlaceholderText(/continue the piece/i)).toBeInTheDocument();
    });

    it('filters out skipped turns from the visible list', () => {
        const logWithSkip = {
            ...mockColorLog,
            turns: [
                { id: 't1', content: 'Visible', isSkip: false },
                { id: 't2', content: 'Invisible', isSkip: true },
            ]
        };
        useQuery.mockReturnValue({ isLoading: false, isError: false, data: logWithSkip });
        render(<LogDetailPage />);

        expect(screen.getByText('Visible')).toBeInTheDocument();
        expect(screen.queryByText('Invisible')).not.toBeInTheDocument();
    });

    it('displays next writer waiting message when it is NOT the user\'s turn', () => {
        const notMyTurnLog = {
            ...mockColorLog,
            isMyTurn: false,
            nextWriter: { id: 'w2', nickname: 'Bob', colorHex: '#00F' }
        };
        useQuery.mockReturnValue({ isLoading: false, isError: false, data: notMyTurnLog });
        render(<LogDetailPage />);

        expect(screen.getByText(/waiting for Bob/i)).toBeInTheDocument();
    });

    it('shows error box when submission fails', async () => {
        const activeLog = { ...mockColorLog, isMyTurn: true, myWriter: { id: 'w1' } };
        useQuery.mockReturnValue({ isLoading: false, isError: false, data: activeLog });
        
        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Invalid contribution' })
        });

        render(<LogDetailPage />);
        fireEvent.change(screen.getByPlaceholderText(/continue the piece/i), { target: { value: 'short' } });
        fireEvent.click(screen.getByRole('button', { name: /submit/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid contribution')).toBeInTheDocument();
        });
    });
});
