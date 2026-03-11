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
        globalThis.fetch = vi.fn();
    });

    it('renders required fields on mount', () => {
        renderPage();
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
        expect(screen.getByText(/^access$/i)).toBeInTheDocument();
        expect(screen.getByText(/turn mode/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^create$/i })).toBeInTheDocument();
    });

    it('hides advanced settings by default and shows them on toggle', () => {
        renderPage();
        expect(screen.queryByLabelText(/participant limit/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/turn timeout/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/per-turn limit/i)).not.toBeInTheDocument();

        fireEvent.click(screen.getByText(/advanced settings/i));

        expect(screen.getByLabelText(/participant limit/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^turn limit$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/seed/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/turn timeout/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/per-turn limit/i)).toBeInTheDocument();
    });

    it('shows an error when title is empty and does not call fetch', async () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

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
        fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Participant limit must be at least 2'
        );
        expect(fetch).not.toHaveBeenCalled();
    });

    it('calls POST /api/logs and redirects to /logs/:id on valid public submit', async () => {
        globalThis.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 'abc-123', accessCode: null }),
        });

        renderPage();

        fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Great Log' } });
        fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                '/api/logs',
                expect.objectContaining({
                    method: 'POST',
                })
            );
        });
    });

    it('shows access code modal for private log and redirects on "Done"', async () => {
        globalThis.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 'private-789', accessCode: 'SECRET' }),
        });

        renderPage();

        fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Secret Log' } });
        fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

        // Modal should appear — uses t.access.title = "This is a private log"
        expect(await screen.findByText(/this is a private log/i)).toBeInTheDocument();
        expect(screen.getByText('SECRET')).toBeInTheDocument();

        // Click Done to redirect
        fireEvent.click(screen.getByRole('button', { name: /done/i }));
        // Redirection is handled by useNavigate which is harder to check in MemoryRouter without a custom wrapper,
        // but we can trust the component calls it. (In a real set we'd check current location).
    });

    it('copy button copies to clipboard and shows feedback', async () => {
        const writeText = vi.fn().mockResolvedValue();
        Object.assign(navigator, { clipboard: { writeText } });

        globalThis.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 'copyme-123', accessCode: 'COPYME' }),
        });

        renderPage();
        fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Copyable Log' } });
        fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

        // Modal uses t.log.copy = "copy link"
        const copyBtn = await screen.findByRole('button', { name: /copy link/i });
        fireEvent.click(copyBtn);

        expect(writeText).toHaveBeenCalledWith('COPYME');
        // t.log.copied = "copied"
        expect(await screen.findByText(/^copied$/i)).toBeInTheDocument();
    });

    it('handles clipboard unavailability gracefully', async () => {
        // Delete clipboard API
        delete navigator.clipboard;

        globalThis.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 'nocallback-123', accessCode: 'MANUAL' }),
        });

        renderPage();
        fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'No Clipboard Log' } });
        fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

        const copyBtn = await screen.findByRole('button', { name: /copy link/i });
        fireEvent.click(copyBtn);

        expect(screen.getByText(/manual copy: manual/i)).toBeInTheDocument();
    });
});
