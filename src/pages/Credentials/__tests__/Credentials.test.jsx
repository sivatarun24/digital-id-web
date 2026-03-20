import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderAuthenticated } from '../../../test/helpers';
import Credentials from '../index';

const { mockFetchCredentials } = vi.hoisted(() => ({
  mockFetchCredentials: vi.fn(),
}));

vi.mock('../../../api/credentials', () => ({
  fetchCredentials: () => mockFetchCredentials(),
  startCredentialVerification: vi.fn(),
}));

describe('Credentials Page', () => {
  beforeEach(() => {
    mockFetchCredentials.mockResolvedValue([]);
  });

  async function renderCredentials() {
    renderAuthenticated(<Credentials />);
    await waitFor(() => expect(mockFetchCredentials).toHaveBeenCalled());
  }

  it('renders the page heading', async () => {
    await renderCredentials();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Credentials');
  });

  it('renders credential categories', async () => {
    await renderCredentials();
    expect(screen.getAllByText(/military/i).length).toBeGreaterThan(0);
  });

  it('renders credential list items', async () => {
    await renderCredentials();
    expect(screen.getAllByText(/student/i).length).toBeGreaterThan(0);
  });
});
