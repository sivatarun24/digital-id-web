import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderAuthenticated } from '../../../test/helpers';
import Settings from '../index';

vi.mock('../../../api/auth', () => ({
  changePassword: vi.fn(),
}));

describe('Settings Page', () => {
  it('renders the settings heading', () => {
    renderAuthenticated(<Settings />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders security section', () => {
    renderAuthenticated(<Settings />);
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  it('renders identity section', () => {
    renderAuthenticated(<Settings />);
    expect(screen.getByText('Identity')).toBeInTheDocument();
  });

  it('renders privacy & notifications section', () => {
    renderAuthenticated(<Settings />);
    expect(screen.getByText('Privacy & Notifications')).toBeInTheDocument();
  });

  it('renders danger zone section', () => {
    renderAuthenticated(<Settings />);
    expect(screen.getByText('Danger Zone')).toBeInTheDocument();
  });

  it('shows password form when Change button is clicked', async () => {
    const user = userEvent.setup();
    renderAuthenticated(<Settings />);

    const changeBtn = screen.getByRole('button', { name: 'Change' });
    await user.click(changeBtn);

    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
  });
});
