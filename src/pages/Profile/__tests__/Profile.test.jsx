import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderAuthenticated, MOCK_USER } from '../../../test/helpers';
import Profile from '../index';

describe('Profile Page', () => {
  it('renders the profile heading', () => {
    renderAuthenticated(<Profile />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('My Identity');
  });

  it('displays user name', () => {
    renderAuthenticated(<Profile />);
    expect(screen.getAllByText(MOCK_USER.name).length).toBeGreaterThan(0);
  });

  it('displays user email', () => {
    renderAuthenticated(<Profile />);
    expect(screen.getAllByText(MOCK_USER.email).length).toBeGreaterThan(0);
  });

  it('displays user initials in avatar', () => {
    renderAuthenticated(<Profile />);
    expect(screen.getByText('TU')).toBeInTheDocument();
  });

  it('shows username field', () => {
    renderAuthenticated(<Profile />);
    expect(screen.getByText(MOCK_USER.username)).toBeInTheDocument();
  });

  it('renders personal information section', () => {
    renderAuthenticated(<Profile />);
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
  });

  it('renders account details section', () => {
    renderAuthenticated(<Profile />);
    expect(screen.getByText('Account Details')).toBeInTheDocument();
  });
});
