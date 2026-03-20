import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderAuthenticated } from '../../../test/helpers';
import ConnectedServices from '../index';

const { mockFetchServices } = vi.hoisted(() => ({
  mockFetchServices: vi.fn(),
}));

vi.mock('../../../api/services', () => ({
  fetchServices: () => mockFetchServices(),
  connectService: vi.fn(),
  disconnectService: vi.fn(),
}));

describe('ConnectedServices Page', () => {
  beforeEach(() => {
    mockFetchServices.mockResolvedValue([
      {
        id: 'va',
        name: 'Department of Veterans Affairs',
        category: 'Government',
        desc: 'Access VA health and benefits.',
        connected: false,
      },
    ]);
  });

  async function renderServices() {
    renderAuthenticated(<ConnectedServices />);
    await waitFor(() => expect(mockFetchServices).toHaveBeenCalled());
  }

  it('renders the page heading', async () => {
    await renderServices();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Connected Services');
  });

  it('renders service cards', async () => {
    await renderServices();
    expect(screen.getByText('Department of Veterans Affairs')).toBeInTheDocument();
  });

  it('renders filter buttons', async () => {
    await renderServices();
    expect(screen.getByRole('button', { name: 'All Services' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Government' })).toBeInTheDocument();
  });
});
