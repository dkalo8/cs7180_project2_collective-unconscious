import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import AboutPage from './AboutPage';

describe('AboutPage', () => {
  it('renders about page content from prop t', () => {
    const mockT = {
      nav: { about: 'About Title' },
      about: 'Detailed about text'
    };
    render(<AboutPage t={mockT} />);
    expect(screen.getByText('About Title')).toBeInTheDocument();
    expect(screen.getByText('Detailed about text')).toBeInTheDocument();
  });
});
