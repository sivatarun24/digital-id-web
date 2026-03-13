import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../../../test/helpers';
import ProtectedRoute from '../ProtectedRoute';

vi.mock('../../layout/Layout', () => ({
  default: ({ children }) => <div data-testid="layout">{children}</div>,
}));

describe('ProtectedRoute', () => {
  it('renders null while initializing', () => {
    const { container } = renderWithProviders(
      <Routes>
        <Route path="/" element={<ProtectedRoute><div>Protected</div></ProtectedRoute>} />
      </Routes>,
      { auth: { initializing: true } },
    );

    expect(container.innerHTML).toBe('');
  });

  it('redirects to /login when not authenticated', () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<ProtectedRoute><div>Protected</div></ProtectedRoute>} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
      { auth: { isAuthed: false, initializing: false } },
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children inside Layout when authenticated', () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<ProtectedRoute><div>Protected Content</div></ProtectedRoute>} />
      </Routes>,
      { auth: { isAuthed: true, initializing: false, user: { id: 1 } } },
    );

    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
