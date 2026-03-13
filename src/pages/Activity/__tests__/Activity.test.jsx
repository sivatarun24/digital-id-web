import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderAuthenticated } from '../../../test/helpers';
import Activity from '../index';

describe('Activity Page', () => {
  it('renders the page heading', () => {
    renderAuthenticated(<Activity />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Activity Log');
  });

  it('renders filter buttons', () => {
    renderAuthenticated(<Activity />);
    expect(screen.getByRole('button', { name: 'All Activity' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign-ins' })).toBeInTheDocument();
  });

  it('renders activity timeline items', () => {
    renderAuthenticated(<Activity />);
    expect(screen.getAllByText('Sign in successful').length).toBeGreaterThan(0);
  });
});
