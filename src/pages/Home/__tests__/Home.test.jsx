import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderAuthenticated, MOCK_USER } from '../../../test/helpers';
import Home from '../index';

describe('Home Page', () => {
  it('renders welcome message with user name', () => {
    renderAuthenticated(<Home />);
    expect(screen.getByText(/welcome back, test\b/i)).toBeInTheDocument();
  });

  it('shows verified identity status for ACTIVE user', () => {
    renderAuthenticated(<Home />);
    expect(screen.getByText('Identity Status')).toBeInTheDocument();
  });

  it('shows pending status for non-active user', () => {
    renderAuthenticated(<Home />, {
      user: { ...MOCK_USER, accountStatus: 'PENDING' },
    });
    expect(screen.getByText('Verification Pending')).toBeInTheDocument();
  });

  it('renders stat cards', () => {
    renderAuthenticated(<Home />);
    expect(screen.getByText('Verified IDs')).toBeInTheDocument();
    expect(screen.getAllByText('Connected Services').length).toBeGreaterThan(0);
  });

  it('renders all quick action cards', () => {
    renderAuthenticated(<Home />);
    expect(screen.getByText('Verify Identity')).toBeInTheDocument();
    expect(screen.getAllByText('Credentials').length).toBeGreaterThan(0);
    expect(screen.getByText('Security Settings')).toBeInTheDocument();
    expect(screen.getByText('Digital Wallet')).toBeInTheDocument();
  });

  it('renders supported verifications section', () => {
    renderAuthenticated(<Home />);
    expect(screen.getByText('Supported Verifications')).toBeInTheDocument();
    expect(screen.getByText('Military')).toBeInTheDocument();
    expect(screen.getByText('Student')).toBeInTheDocument();
  });

  it('navigates on quick action click', async () => {
    const user = userEvent.setup();
    renderAuthenticated(<Home />, { route: '/home' });

    const verifyCard = screen.getByText('Verify Identity').closest('.home-action-card');
    await user.click(verifyCard);
  });
});
