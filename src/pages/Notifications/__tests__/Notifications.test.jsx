import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderAuthenticated } from '../../../test/helpers';
import Notifications from '../index';

describe('Notifications Page', () => {
  it('renders the page heading', () => {
    renderAuthenticated(<Notifications />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('renders notification items', () => {
    renderAuthenticated(<Notifications />);
    const items = document.querySelectorAll('.notif-item');
    expect(items.length).toBeGreaterThan(0);
  });

  it('renders filter buttons', () => {
    renderAuthenticated(<Notifications />);
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('renders mark all as read button', () => {
    renderAuthenticated(<Notifications />);
    expect(screen.getByText(/mark all/i)).toBeInTheDocument();
  });
});
