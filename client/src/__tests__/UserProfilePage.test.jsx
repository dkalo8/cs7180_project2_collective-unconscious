/**
 * S2-2: UserProfilePage tests (TDD — written before implementation)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import UserProfilePage from '../pages/UserProfilePage';
import * as authService from '../services/auth.service';

// Mock auth service
vi.mock('../services/auth.service', () => ({
  getMe: vi.fn(),
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
}));


const renderWithRoute = (userId = 'user-1') =>
  render(
    <MemoryRouter initialEntries={[`/users/${userId}`]}>
      <Routes>
        <Route path="/users/:id" element={<UserProfilePage />} />
      </Routes>
    </MemoryRouter>
  );

describe('UserProfilePage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders display name and bio for a public profile (non-owner)', async () => {
    authService.getProfile.mockResolvedValue({
      id: 'user-1',
      displayName: 'Alice',
      bio: 'Love writing haiku.',
      avatarUrl: null,
      participationHistory: [],
    });
    authService.getMe.mockResolvedValue(null); // not logged in

    renderWithRoute('user-1');

    await waitFor(() => screen.getByText('Alice'));
    expect(screen.getByText('Love writing haiku.')).toBeDefined();
    // No edit button for non-owners
    expect(screen.queryByRole('button', { name: /edit/i })).toBeNull();
  });

  it('shows Edit button only when viewer is the owner', async () => {
    authService.getProfile.mockResolvedValue({
      id: 'user-1',
      displayName: 'Alice',
      bio: 'Hello!',
      avatarUrl: null,
      participationHistory: [],
    });
    authService.getMe.mockResolvedValue({ id: 'user-1', displayName: 'Alice' });

    renderWithRoute('user-1');

    await waitFor(() => screen.getByText('Alice'));
    expect(screen.getByRole('button', { name: /edit/i })).toBeDefined();
  });

  it('shows participation history as a list of log links', async () => {
    authService.getProfile.mockResolvedValue({
      id: 'user-1',
      displayName: 'Bob',
      bio: null,
      avatarUrl: null,
      participationHistory: [
        { id: 'log-1', title: 'A Strange Haiku', category: 'Haiku', status: 'COMPLETED' },
        { id: 'log-2', title: 'Office Complaints', category: 'Freewriting', status: 'ACTIVE' },
      ],
    });
    authService.getMe.mockResolvedValue(null);

    renderWithRoute('user-1');

    await waitFor(() => screen.getByText('A Strange Haiku'));
    expect(screen.getByText('Office Complaints')).toBeDefined();
  });

  it('shows 404 message when user is not found', async () => {
    authService.getProfile.mockRejectedValue(new Error('404'));
    authService.getMe.mockResolvedValue(null);

    renderWithRoute('nonexistent');

    await waitFor(() => screen.getByText(/not found/i));
  });

  it('calls updateProfile when edit form is submitted', async () => {
    authService.getProfile.mockResolvedValue({
      id: 'user-1',
      displayName: 'Alice',
      bio: 'Old bio',
      avatarUrl: null,
      participationHistory: [],
    });
    authService.getMe.mockResolvedValue({ id: 'user-1', displayName: 'Alice' });
    authService.updateProfile.mockResolvedValue({ id: 'user-1', displayName: 'Alice', bio: 'New bio' });

    renderWithRoute('user-1');

    await waitFor(() => screen.getByRole('button', { name: /edit/i }));
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    const bioInput = screen.getByDisplayValue('Old bio');
    fireEvent.change(bioInput, { target: { value: 'New bio' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(authService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ bio: 'New bio' })
      )
    );
  });
});
