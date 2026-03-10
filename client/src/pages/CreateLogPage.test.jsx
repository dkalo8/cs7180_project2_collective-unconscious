import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CreateLogPage from './CreateLogPage';

// Wrap with MemoryRouter since the component uses useNavigate
const renderPage = () =>
    render(
        <MemoryRouter>
            <CreateLogPage />
        </MemoryRouter>
    );

describe('CreateLogPage', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    it('renders required fields on mount', () => {
        renderPage();
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
        expect(screen.getByText(/access mode/i)).toBeInTheDocument();
        expect(screen.getByText(/turn mode/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /start log/i })).toBeInTheDocument();
    });

    it('hides advanced settings by default and shows them on toggle', () => {
        renderPage();
        expect(screen.queryByLabelText(/participant limit/i)).not.toBeInTheDocument();

        fireEvent.click(screen.getByText(/advanced settings/i));

        expect(screen.getByLabelText(/participant limit/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/round limit/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/seed/i)).toBeInTheDocument();
    });

    it('shows an error when title is empty and does not call fetch', async () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: /start log/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Title is required');
        expect(fetch).not.toHaveBeenCalled();
    });

    it('shows an error when participant limit is < 2', async () => {
        renderPage();

        fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Valid Title' } });
        fireEvent.click(screen.getByText(/advanced settings/i));
        fireEvent.change(screen.getByLabelText(/participant limit/i), {
            target: { value: '1' },
        });
        fireEvent.click(screen.getByRole('button', { name: /start log/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Participant limit must be at least 2'
        );
        expect(fetch).not.toHaveBeenCalled();
    });

    it('calls POST /api/logs with correct body on valid submit', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 'abc-123', accessCode: null }),
        });

        renderPage();

        fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Great Log' } });
        fireEvent.click(screen.getByRole('button', { name: /start log/i }));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                '/api/logs',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: expect.stringContaining('"title":"Great Log"'),
                })
            );
        });
    });
});
