import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from './Pagination';

describe('Pagination', () => {
    it('renders nothing when totalPages <= 1', () => {
        const { container } = render(<Pagination page={1} totalPages={1} onPageChange={vi.fn()} />);
        expect(container.firstChild).toBeNull();

        const { container: c2 } = render(<Pagination page={1} totalPages={0} onPageChange={vi.fn()} />);
        expect(c2.firstChild).toBeNull();
    });

    it('hides prev button on page 1', () => {
        render(<Pagination page={1} totalPages={5} onPageChange={vi.fn()} />);
        expect(screen.queryByText('prev')).toBeNull();
        expect(screen.getByText('next')).toBeInTheDocument();
    });

    it('hides next button on last page', () => {
        render(<Pagination page={5} totalPages={5} onPageChange={vi.fn()} />);
        expect(screen.queryByText('next')).toBeNull();
        expect(screen.getByText('prev')).toBeInTheDocument();
    });

    it('shows all page numbers when totalPages <= 7 (no ellipsis)', () => {
        render(<Pagination page={3} totalPages={7} onPageChange={vi.fn()} />);
        for (let i = 1; i <= 7; i++) {
            expect(screen.getByText(String(i))).toBeInTheDocument();
        }
        expect(screen.queryByText('...')).toBeNull();
    });

    it('collapses with ellipsis on left when current page is near end', () => {
        render(<Pagination page={18} totalPages={20} onPageChange={vi.fn()} />);
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('...')).toBeInTheDocument();
        expect(screen.getByText('20')).toBeInTheDocument();
        // page 18 ± 2 should be visible
        expect(screen.getByText('16')).toBeInTheDocument();
        expect(screen.getByText('18')).toBeInTheDocument();
        expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('collapses with ellipsis on right when current page is near start', () => {
        render(<Pagination page={3} totalPages={20} onPageChange={vi.fn()} />);
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('...')).toBeInTheDocument();
        expect(screen.getByText('20')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('collapses both sides when current page is in the middle', () => {
        render(<Pagination page={10} totalPages={20} onPageChange={vi.fn()} />);
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('20')).toBeInTheDocument();
        const ellipses = screen.getAllByText('...');
        expect(ellipses.length).toBe(2);
        expect(screen.getByText('8')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('calls onPageChange with correct page number when clicked', async () => {
        const onPageChange = vi.fn();
        render(<Pagination page={5} totalPages={10} onPageChange={onPageChange} />);
        await userEvent.click(screen.getByText('3'));
        expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('calls onPageChange with page-1 and page+1 for prev/next buttons', async () => {
        const onPageChange = vi.fn();
        render(<Pagination page={5} totalPages={10} onPageChange={onPageChange} />);
        await userEvent.click(screen.getByText('prev'));
        expect(onPageChange).toHaveBeenCalledWith(4);
        await userEvent.click(screen.getByText('next'));
        expect(onPageChange).toHaveBeenCalledWith(6);
    });

    it('renders current page with aria-current="page" and bold font-weight', () => {
        render(<Pagination page={4} totalPages={7} onPageChange={vi.fn()} />);
        const currentBtn = screen.getByText('4');
        expect(currentBtn).toHaveAttribute('aria-current', 'page');
        expect(currentBtn).toHaveStyle({ fontWeight: 'bold' });
    });
});
