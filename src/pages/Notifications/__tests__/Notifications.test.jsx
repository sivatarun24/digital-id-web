import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderAuthenticated } from '../../../test/helpers';
import Notifications from '../index';

const { mockFetchNotifications, mockGetMyInfoRequests } = vi.hoisted(() => ({
  mockFetchNotifications: vi.fn(),
  mockGetMyInfoRequests: vi.fn(),
}));

vi.mock('../../../api/notifications', () => ({
  fetchNotifications: () => mockFetchNotifications(),
  toggleRead: vi.fn(),
  markAllRead: vi.fn(),
  dismissNotification: vi.fn(),
}));

vi.mock('../../../api/infoRequests', () => ({
  getMyInfoRequests: () => mockGetMyInfoRequests(),
  respondToInfoRequest: vi.fn(),
}));

const MOCK_NOTIFICATION = {
  id: 1,
  title: 'Security alert',
  message: 'New sign-in from a new device.',
  time: new Date().toISOString(),
  type: 'security',
  read: false,
};

describe('Notifications Page', () => {
  beforeEach(() => {
    mockFetchNotifications.mockResolvedValue({
      notifications: [MOCK_NOTIFICATION],
      unreadCount: 1,
    });
    mockGetMyInfoRequests.mockResolvedValue([]);
  });

  async function renderNotifications() {
    renderAuthenticated(<Notifications />);
    await waitFor(() => expect(mockFetchNotifications).toHaveBeenCalled());
  }

  it('renders the page heading', async () => {
    await renderNotifications();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('renders notification items after loading', async () => {
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

  it('shows skeleton placeholders while loading', () => {
    // Don't await — check DOM before promise resolves
    let resolveFetch;
    mockFetchNotifications.mockReturnValue(new Promise(r => { resolveFetch = r; }));
    renderAuthenticated(<Notifications />);

    const skeletons = document.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThan(0);

    // resolve so no hanging promise leaks into next test
    resolveFetch({ notifications: [], unreadCount: 0 });
  });

  it('shows empty state when there are no notifications', async () => {
    mockFetchNotifications.mockResolvedValue({ notifications: [], unreadCount: 0 });
    renderAuthenticated(<Notifications />);
    await waitFor(() => expect(screen.getByText("You're all caught up!")).toBeInTheDocument());
  });

  it('shows unread badge count in the heading area', async () => {
    await renderNotifications();
    // unreadCount=1 should render somewhere visible
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
