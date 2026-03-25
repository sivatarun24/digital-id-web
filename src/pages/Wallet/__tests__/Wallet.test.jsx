import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderAuthenticated } from '../../../test/helpers';
import Wallet from '../index';

const { mockFetchWallet } = vi.hoisted(() => ({
  mockFetchWallet: vi.fn(),
}));

vi.mock('../../../api/home', () => ({
  fetchHome: vi.fn(),
  fetchWallet: () => mockFetchWallet(),
}));

describe('Wallet Page', () => {
  beforeEach(() => {
    mockFetchWallet.mockResolvedValue({
      identityVerified: true,
      credentials: [],
      name: 'Test User',
      userId: 1,
    });
  });

  async function renderWallet() {
    renderAuthenticated(<Wallet />);
    await waitFor(() => {
      expect(mockFetchWallet).toHaveBeenCalled();
      expect(screen.queryByText('Loading wallet…')).not.toBeInTheDocument();
    });
  }

  it('renders the page heading', async () => {
    await renderWallet();
    expect(screen.getByText('Digital Wallet')).toBeInTheDocument();
  });

  it('renders digital ID cards', async () => {
    await renderWallet();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    const cards = document.querySelectorAll('.wallet-card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('displays user name on cards', async () => {
    await renderWallet();
    expect(screen.getAllByText(/test user/i).length).toBeGreaterThan(0);
  });
});
