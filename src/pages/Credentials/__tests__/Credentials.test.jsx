import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderAuthenticated } from '../../../test/helpers';
import Credentials from '../index';

describe('Credentials Page', () => {
  it('renders the page heading', () => {
    renderAuthenticated(<Credentials />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Credentials');
  });

  it('renders credential categories', () => {
    renderAuthenticated(<Credentials />);
    expect(screen.getAllByText(/military/i).length).toBeGreaterThan(0);
  });

  it('renders credential list items', () => {
    renderAuthenticated(<Credentials />);
    expect(screen.getAllByText(/student/i).length).toBeGreaterThan(0);
  });
});
