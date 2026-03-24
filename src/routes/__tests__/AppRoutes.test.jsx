import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

vi.mock('../../components/layout/Layout', () => ({
  default: ({ children }) => <div data-testid="layout">{children}</div>,
}));

import AppRoutes from '../AppRoutes';

const guestAuth = {
  user: null,
  isAuthed: false,
  initializing: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
};

const authedAuth = {
  ...guestAuth,
  user: { id: 1, name: 'Test', accountStatus: 'ACTIVE' },
  isAuthed: true,
};

function renderRoute(route, auth = guestAuth) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[route]}>
        <AppRoutes />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('AppRoutes', () => {
  it('redirects / to /login for guests', () => {
    renderRoute('/');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/welcome back/i);
  });

  it('redirects / to /home for authenticated users', async () => {
    renderRoute('/', authedAuth);
    expect(await screen.findByRole('heading', { level: 1, name: /home for test/i })).toBeInTheDocument();
  });

  it('shows auth screen at /login for guests', () => {
    renderRoute('/login');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/welcome back/i);
  });

  it('redirects /login to /home for authenticated users', async () => {
    renderRoute('/login', authedAuth);
    expect(await screen.findByRole('heading', { level: 1, name: /home for test/i })).toBeInTheDocument();
  });

  it('redirects protected routes to /login for guests', () => {
    renderRoute('/home');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/welcome back/i);
  });

  it('renders public routes for anyone', async () => {
    renderRoute('/about');
    expect(
      await screen.findByRole('heading', { level: 1, name: /trusted by millions/i }),
    ).toBeInTheDocument();
  });
});
