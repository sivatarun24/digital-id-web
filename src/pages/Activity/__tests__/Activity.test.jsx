import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderAuthenticated } from '../../../test/helpers';
import Activity from '../index';

const { mockFetchActivity } = vi.hoisted(() => ({
  mockFetchActivity: vi.fn(),
}));

vi.mock('../../../api/activity', () => ({
  fetchActivity: (...args) => mockFetchActivity(...args),
}));

describe('Activity Page', () => {
  beforeEach(() => {
    mockFetchActivity.mockResolvedValue({
      activity: [
        {
          id: 1,
          type: 'login',
          title: 'Sign in successful',
          desc: 'New session from Chrome',
          timestamp: new Date().toISOString(),
          ip: '127.0.0.1',
          userAgent: 'Chrome',
        },
      ],
      hasMore: false,
      total: 1,
    });
  });

  async function renderActivity() {
    renderAuthenticated(<Activity />);
    await waitFor(() => expect(screen.queryByText('Loading activity…')).not.toBeInTheDocument());
  }

  it('renders the page heading', async () => {
    await renderActivity();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Activity Log');
  });

  it('renders filter buttons', async () => {
    await renderActivity();
    expect(screen.getByRole('button', { name: 'All Activity' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign-ins' })).toBeInTheDocument();
  });

  it('renders activity timeline items', async () => {
    await renderActivity();
    expect(screen.getAllByText('Sign in successful').length).toBeGreaterThan(0);
  });
});
