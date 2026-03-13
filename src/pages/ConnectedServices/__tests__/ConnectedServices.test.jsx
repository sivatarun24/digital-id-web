import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderAuthenticated } from '../../../test/helpers';
import ConnectedServices from '../index';

describe('ConnectedServices Page', () => {
  it('renders the page heading', () => {
    renderAuthenticated(<ConnectedServices />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Connected Services');
  });

  it('renders service cards', () => {
    renderAuthenticated(<ConnectedServices />);
    expect(screen.getByText('Department of Veterans Affairs')).toBeInTheDocument();
  });

  it('renders filter buttons', () => {
    renderAuthenticated(<ConnectedServices />);
    expect(screen.getByRole('button', { name: 'All Services' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Government' })).toBeInTheDocument();
  });
});
