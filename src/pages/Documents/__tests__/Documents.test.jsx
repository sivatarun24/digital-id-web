import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderAuthenticated } from '../../../test/helpers';
import Documents from '../index';

describe('Documents Page', () => {
  it('renders the page heading', () => {
    renderAuthenticated(<Documents />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Documents');
  });

  it('renders upload trigger button', () => {
    renderAuthenticated(<Documents />);
    const uploadBtns = screen.getAllByText(/upload/i);
    expect(uploadBtns.length).toBeGreaterThan(0);
  });

  it('renders document list', () => {
    renderAuthenticated(<Documents />);
    expect(screen.getByText(/driver/i)).toBeInTheDocument();
  });
});
