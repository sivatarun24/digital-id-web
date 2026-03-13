import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderAuthenticated } from '../../../test/helpers';
import Wallet from '../index';

describe('Wallet Page', () => {
  it('renders the page heading', () => {
    renderAuthenticated(<Wallet />);
    expect(screen.getByText('Digital Wallet')).toBeInTheDocument();
  });

  it('renders digital ID cards', () => {
    renderAuthenticated(<Wallet />);
    const cards = document.querySelectorAll('.wallet-card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('displays user name on cards', () => {
    renderAuthenticated(<Wallet />);
    expect(screen.getAllByText(/test user/i).length).toBeGreaterThan(0);
  });
});
