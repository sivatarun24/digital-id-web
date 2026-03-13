import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import useAuth from '../useAuth';
import { AuthContext } from '../../context/AuthContext';

describe('useAuth', () => {
  it('returns context value when inside AuthProvider', () => {
    const mockValue = {
      user: { id: 1 },
      isAuthed: true,
      initializing: false,
      login: () => {},
      register: () => {},
      logout: () => {},
      refreshUser: () => {},
    };

    const wrapper = ({ children }) => (
      <AuthContext.Provider value={mockValue}>{children}</AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBe(mockValue);
    expect(result.current.user.id).toBe(1);
    expect(result.current.isAuthed).toBe(true);
  });

  it('throws error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });
});
