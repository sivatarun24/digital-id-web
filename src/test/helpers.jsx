import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const DEFAULT_AUTH = {
  user: null,
  isAuthed: false,
  initializing: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
};

const MOCK_USER = {
  id: 1,
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  phoneNo: 1234567890,
  gender: 'MALE',
  dateOfBirth: '1990-01-01',
  accountStatus: 'ACTIVE',
  role: 'USER',
};

export function renderWithProviders(ui, { auth = {}, route = '/', ...options } = {}) {
  const authValue = { ...DEFAULT_AUTH, ...auth };

  function Wrapper({ children }) {
    return (
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </AuthContext.Provider>
    );
  }

  return { ...render(ui, { wrapper: Wrapper, ...options }), authValue };
}

export function renderAuthenticated(ui, { user = MOCK_USER, route = '/', ...options } = {}) {
  return renderWithProviders(ui, {
    auth: { user, isAuthed: true },
    route,
    ...options,
  });
}

export { MOCK_USER };
