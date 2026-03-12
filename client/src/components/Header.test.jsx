import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import * as authService from '../services/auth.service';
import { T } from '../utils/i18n';

vi.mock('../services/auth.service');

const mockT = T['en'];

const renderHeader = (props = {}) => render(
  <MemoryRouter>
    <Header t={mockT} lang="en" setLang={vi.fn()} {...props} />
  </MemoryRouter>
);

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders site name and tagline', () => {
    authService.getMe.mockResolvedValue(null);
    renderHeader();
    expect(screen.getByText(mockT.siteName)).toBeInTheDocument();
    expect(screen.getByText(mockT.tagline)).toBeInTheDocument();
  });

  it('renders sign in button when not logged in', async () => {
    authService.getMe.mockResolvedValue(null);
    renderHeader();
    expect(await screen.findByText(/sign in/i)).toBeInTheDocument();
  });

  it('renders user name and sign out when logged in', async () => {
    authService.getMe.mockResolvedValue({ id: 'u1', displayName: 'Alice' });
    renderHeader();
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText(/sign out/i)).toBeInTheDocument();
  });

  it('handles language switching', () => {
    const setLang = vi.fn();
    renderHeader({ setLang });
    const zhBtn = screen.getByRole('button', { name: /中文/i });
    fireEvent.click(zhBtn);
    expect(setLang).toHaveBeenCalledWith('zh');
  });

  it('handles logout', async () => {
    authService.getMe.mockResolvedValue({ id: 'u1', displayName: 'Alice' });
    renderHeader();
    const signOutBtn = await screen.findByText(/sign out/i);
    fireEvent.click(signOutBtn);
    expect(authService.logout).toHaveBeenCalled();
  });
});
