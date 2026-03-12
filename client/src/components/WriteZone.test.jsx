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

        expect(screen.getByPlaceholderText(/continue the piece/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/your nickname:/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('calls onSubmit with user content and typed nickname', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({});
        const { getByRole, getByPlaceholderText } = renderWithClient(
            <WriteZone logId="123" colorHex="#FF0000" onSubmit={mockSubmit} />
        );

        fireEvent.change(getByPlaceholderText(/continue the piece/i), { target: { value: 'My cool turn' } });
        fireEvent.change(getByPlaceholderText(/your nickname:/i), { target: { value: 'Custom Nick' } });

        fireEvent.click(getByRole('button', { name: /submit/i }));

        await waitFor(() => {
            expect(mockSubmit).toHaveBeenCalledWith({ content: 'My cool turn', nickname: 'Custom Nick', colorHex: '#FF0000' });
        });
    });

    it('submits a generated placeholder nickname if the field is empty', async () => {
        const mockSubmit = vi.fn();
        renderWithClient(<WriteZone logId="123" colorHex="#000" onSubmit={mockSubmit} />);

        const textarea = screen.getByPlaceholderText(/continue the piece/i);
        const submitButton = screen.getByRole('button', { name: /submit/i });

        fireEvent.change(textarea, { target: { value: 'This is my turn.' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSubmit).toHaveBeenCalledWith({
                content: 'This is my turn.',
                nickname: expect.any(String),
                colorHex: '#000'
            });
            // Nickname should be non-empty (a generated placeholder, not '')
            const calledNick = mockSubmit.mock.calls[0][0].nickname;
            expect(calledNick.length).toBeGreaterThan(0);
        });
    });

    it('displays error if content exceeds character limit', () => {
        const { getByRole, getByPlaceholderText, getByText } = renderWithClient(
            <WriteZone logId="123" colorHex="#FF0000" perTurnLengthLimit={50} onSubmit={vi.fn()} />
        );

        const longText = 'A'.repeat(51);
        fireEvent.change(getByPlaceholderText(/continue the piece/i), { target: { value: longText } });

        const counter = getByText(/51 \/ 50/i);
        expect(counter).toBeInTheDocument();
        expect(counter).toHaveClass('error');

        const textarea = getByPlaceholderText(/continue the piece/i);
        expect(textarea).toHaveClass('over-limit');

        expect(getByRole('button', { name: /submit/i })).toBeDisabled();
    });
});
