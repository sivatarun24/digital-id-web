import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import AuthProvider from '../AuthContext';
import useAuth from '../../hooks/useAuth';

vi.mock('../../api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  fetchMe: vi.fn(),
  logout: vi.fn(),
  clearSession: vi.fn(),
}));

import * as authApi from '../../api/auth';

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with initializing true and user null', () => {
    authApi.fetchMe.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.initializing).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthed).toBe(false);
  });

  it('fetches user on mount and sets isAuthed', async () => {
    const mockUser = { id: 1, name: 'Test', email: 'test@test.com' };
    authApi.fetchMe.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.initializing).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthed).toBe(true);
  });

  it('handles fetchMe failure gracefully', async () => {
    authApi.fetchMe.mockRejectedValue(new Error('401'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.initializing).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthed).toBe(false);
  });

  it('login calls apiLogin then fetchMe and updates user', async () => {
    const mockUser = { id: 1, name: 'Logged In' };
    authApi.fetchMe
      .mockRejectedValueOnce(new Error('no session'))
      .mockResolvedValueOnce(mockUser);
    authApi.login.mockResolvedValue({ accessToken: 'tok' });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.initializing).toBe(false));

    await act(async () => {
      await result.current.login({ identifier: 'user', password: 'pass' });
    });

    expect(authApi.login).toHaveBeenCalledWith({ identifier: 'user', password: 'pass' });
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthed).toBe(true);
  });

  it('register calls apiRegister', async () => {
    authApi.fetchMe.mockRejectedValue(new Error('no session'));
    authApi.register.mockResolvedValue({});

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.initializing).toBe(false));

    const payload = { username: 'new', email: 'new@test.com', password: 'Pass@123' };
    await act(async () => {
      await result.current.register(payload);
    });

    expect(authApi.register).toHaveBeenCalledWith(payload);
  });

  it('logout clears session and resets user', async () => {
    const mockUser = { id: 1, name: 'Test' };
    authApi.fetchMe.mockResolvedValue(mockUser);
    authApi.logout.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isAuthed).toBe(true));

    await act(async () => {
      await result.current.logout();
    });

    expect(authApi.logout).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthed).toBe(false);
  });
});
