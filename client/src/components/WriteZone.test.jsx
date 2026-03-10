import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import WriteZone from './WriteZone';

const renderWithClient = (ui) => {
    return render(ui);
};

describe('WriteZone Component', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders a textarea, optional nickname input, and submit button', () => {
        renderWithClient(<WriteZone logId="123" colorHex="#FF0000" />);
        
        expect(screen.getByPlaceholderText(/Type your turn.../i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Nickname \(optional\)/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
    });

    it('calls onSubmit with user content and typed nickname', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({});
        const { getByRole, getByPlaceholderText } = renderWithClient(
            <WriteZone logId="123" colorHex="#FF0000" onSubmit={mockSubmit} />
        );

        fireEvent.change(getByPlaceholderText(/Type your turn.../i), { target: { value: 'My cool turn' } });
        fireEvent.change(getByPlaceholderText(/Nickname \(optional\)/i), { target: { value: 'Custom Nick' } });
        
        fireEvent.click(getByRole('button', { name: /Submit/i }));

        await waitFor(() => {
            expect(mockSubmit).toHaveBeenCalledWith({ content: 'My cool turn', nickname: 'Custom Nick' });
        });
    });

    it('passes an empty nickname if the field is empty on submit', async () => {
        const mockSubmit = vi.fn();
        renderWithClient(<WriteZone logId="123" colorHex="#000" onSubmit={mockSubmit} />);

        const textarea = screen.getByPlaceholderText('Type your turn...');
        const submitButton = screen.getByText('Submit');

        fireEvent.change(textarea, { target: { value: 'This is my turn.' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSubmit).toHaveBeenCalledWith({
                content: 'This is my turn.',
                nickname: ''
            });
        });
    });

    it('displays error if content exceeds character limit', () => {
        const { getByRole, getByPlaceholderText, getByText } = renderWithClient(
            <WriteZone logId="123" colorHex="#FF0000" perTurnLengthLimit={50} onSubmit={vi.fn()} />
        );

        const longText = 'A'.repeat(51);
        fireEvent.change(getByPlaceholderText(/Type your turn.../i), { target: { value: longText } });
        
        const counter = getByText(/51 \/ 50/i);
        expect(counter).toBeInTheDocument();
        expect(counter).toHaveClass('error');
        
        const textarea = getByPlaceholderText(/Type your turn.../i);
        expect(textarea).toHaveClass('over-limit');
        
        expect(getByRole('button', { name: /Submit/i })).toBeDisabled();
    });
});
