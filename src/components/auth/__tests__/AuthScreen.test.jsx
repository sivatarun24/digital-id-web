import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/helpers';
import AuthScreen from '../AuthScreen';

describe('AuthScreen', () => {
  describe('Login mode', () => {
    it('renders login form at /login', () => {
      renderWithProviders(<AuthScreen />, { route: '/login' });

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/welcome back/i);
      expect(screen.getByLabelText(/username, email, or phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('shows Create account button to switch to register', () => {
      renderWithProviders(<AuthScreen />, { route: '/login' });
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('shows forgot password link', () => {
      renderWithProviders(<AuthScreen />, { route: '/login' });
      expect(screen.getByRole('button', { name: /forgot password/i })).toBeInTheDocument();
    });

    it('submits login form', async () => {
      const user = userEvent.setup();
      const loginFn = vi.fn().mockResolvedValue({ id: 1 });

      renderWithProviders(<AuthScreen />, {
        route: '/login',
        auth: { login: loginFn, register: vi.fn() },
      });

      await user.type(screen.getByLabelText(/username, email, or phone/i), 'testuser');
      await user.type(screen.getByLabelText('Password'), 'Pass@123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(loginFn).toHaveBeenCalledWith({
        identifier: 'testuser',
        password: 'Pass@123',
      });
    });

    it('displays error on failed login', async () => {
      const user = userEvent.setup();
      const loginFn = vi.fn().mockRejectedValue(new Error('Invalid credentials'));

      renderWithProviders(<AuthScreen />, {
        route: '/login',
        auth: { login: loginFn, register: vi.fn() },
      });

      await user.type(screen.getByLabelText(/username, email, or phone/i), 'bad');
      await user.type(screen.getByLabelText('Password'), 'wrong');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  describe('Register mode', () => {
    it('renders register form at /register', () => {
      renderWithProviders(<AuthScreen />, { route: '/register' });

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/create your account/i);
      expect(screen.getByText(/secure, verified identity/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Full name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone number')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('shows password checklist on register form', () => {
      renderWithProviders(<AuthScreen />, { route: '/register' });
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/at least 1 uppercase/i)).toBeInTheDocument();
    });

    it('shows back to sign in button', () => {
      renderWithProviders(<AuthScreen />, { route: '/register' });
      expect(screen.getByRole('button', { name: /back to sign in/i })).toBeInTheDocument();
    });
  });

  describe('Password visibility toggle', () => {
    it('toggles password field type', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AuthScreen />, { route: '/login' });

      const passwordInput = screen.getByLabelText('Password');
      expect(passwordInput).toHaveAttribute('type', 'password');

      const toggleBtn = screen.getByLabelText('Show password');
      await user.click(toggleBtn);

      expect(passwordInput).toHaveAttribute('type', 'text');
    });
  });
});
