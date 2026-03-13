import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../../../test/helpers';
import GuestRoute from '../GuestRoute';

describe('GuestRoute', () => {
  it('renders null while initializing', () => {
    const { container } = renderWithProviders(
      <Routes>
        <Route path="/" element={<GuestRoute><div>Guest</div></GuestRoute>} />
      </Routes>,
      { auth: { initializing: true } },
    );

    expect(container.innerHTML).toBe('');
  });

  it('redirects to /home when authenticated', () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<GuestRoute><div>Guest</div></GuestRoute>} />
        <Route path="/home" element={<div>Home Page</div>} />
      </Routes>,
      { auth: { isAuthed: true, initializing: false, user: { id: 1 } } },
    );

    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('renders children when not authenticated', () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<GuestRoute><div>Login Form</div></GuestRoute>} />
      </Routes>,
      { auth: { isAuthed: false, initializing: false } },
    );

    expect(screen.getByText('Login Form')).toBeInTheDocument();
  });
});
