import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderAuthenticated } from '../../../test/helpers';
import Notifications from '../index';

const { mockFetchNotifications } = vi.hoisted(() => ({
  mockFetchNotifications: vi.fn(),
}));

vi.mock('../../../api/notifications', () => ({
  fetchNotifications: () => mockFetchNotifications(),
  toggleRead: vi.fn(),
  markAllRead: vi.fn(),
  dismissNotification: vi.fn(),
}));

describe('Notifications Page', () => {
  beforeEach(() => {
    mockFetchNotifications.mockResolvedValue({
      notifications: [
        {
          id: 1,
          title: 'Security alert',
          message: 'New sign-in from a new device.',
          time: new Date().toISOString(),
          type: 'security',
          read: false,
        },
      ],
      unreadCount: 1,
    });
  });

  async function renderNotifications() {
    renderAuthenticated(<Notifications />);
    await waitFor(() => expect(mockFetchNotifications).toHaveBeenCalled());
  }

  it('renders the page heading', async () => {
    await renderNotifications();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('renders notification items', async () => {
    await renderNotifications();
    expect(screen.getByText('Security alert')).toBeInTheDocument();
    const items = document.querySelectorAll('.notif-item');
    expect(items.length).toBeGreaterThan(0);
  });

  it('renders filter buttons', async () => {
    await renderNotifications();
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('renders mark all as read button', async () => {
    await renderNotifications();
    expect(screen.getByRole('button', { name: /mark all as read/i })).toBeInTheDocument();
  });
});
