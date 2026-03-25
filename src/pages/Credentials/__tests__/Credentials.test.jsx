import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderAuthenticated } from '../../../test/helpers';
import Credentials from '../index';

const { mockFetchCredentials } = vi.hoisted(() => ({
  mockFetchCredentials: vi.fn(),
}));
const { mockFetchVerificationStatus } = vi.hoisted(() => ({
  mockFetchVerificationStatus: vi.fn(),
}));

vi.mock('../../../api/credentials', () => ({
  fetchCredentials: () => mockFetchCredentials(),
  startCredentialVerification: vi.fn(),
}));

vi.mock('../../../api/verifyIdentity', () => ({
  fetchVerificationStatus: () => mockFetchVerificationStatus(),
}));

describe('Credentials Page', () => {
  beforeEach(() => {
    mockFetchCredentials.mockResolvedValue([]);
    mockFetchVerificationStatus.mockResolvedValue({ status: 'VERIFIED' });
  });

  async function renderCredentials() {
    renderAuthenticated(<Credentials />);
    await waitFor(() => {
      expect(mockFetchCredentials).toHaveBeenCalled();
      expect(mockFetchVerificationStatus).toHaveBeenCalled();
    });
  }

  it('renders the page heading', async () => {
    await renderCredentials();
    expect(await screen.findByRole('heading', { name: /credential verifications/i })).toBeInTheDocument();
  });

  it('renders credential categories', async () => {
    await renderCredentials();
    expect(await screen.findAllByText(/military/i)).not.toHaveLength(0);
  });

  it('renders credential list items', async () => {
    await renderCredentials();
    expect(await screen.findAllByText(/student/i)).not.toHaveLength(0);
  });
});
