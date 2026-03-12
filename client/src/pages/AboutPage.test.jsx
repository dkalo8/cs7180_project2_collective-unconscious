import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import AboutPage from './AboutPage';
import { LanguageProvider } from '../context/LanguageContext';

describe('AboutPage', () => {
  it('renders about page content and how it works instructions', () => {
    render(
      <LanguageProvider>
        <AboutPage />
      </LanguageProvider>
    );
    
    // Check main title (About in English is 'about' from T.en.nav.about)
    expect(screen.getByText('about')).toBeInTheDocument();
    
    // Check one of the steps from T.en.howItWorks
    expect(screen.getByText(/Give your log a title, category, and rules/)).toBeInTheDocument();
  });
});
