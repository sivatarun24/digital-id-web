import { useState } from 'react';
import './Notifications.css';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'security',
    icon: '🔐',
    title: 'New sign-in detected',
    message: 'A new sign-in was detected from Chrome on macOS in San Francisco, CA.',
    time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
  },
  {
    id: 2,
    type: 'verification',
    icon: '🪪',
    title: 'Verification in progress',
    message: 'Your identity documents are being reviewed. This usually takes 5–10 minutes.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
  },
  {
    id: 3,
    type: 'service',
    icon: '🔗',
    title: 'Service connected successfully',
    message: 'Your Digital ID has been connected to the Lowe\'s military discount program.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
  },
  {
    id: 4,
    type: 'promo',
    icon: '🎁',
    title: 'New partner discount available',
    message: 'Nike now offers 20% off for verified military and first responders. Connect your service to claim.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    read: true,
  },
  {
    id: 5,
    type: 'security',
    icon: '🔑',
    title: 'Password changed successfully',
    message: "Your account password was changed. If this wasn't you, contact support immediately.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    read: true,
  },
  {
    id: 6,
    type: 'verification',
    icon: '✅',
    title: 'Identity verified',
    message: 'Congratulations! Your identity has been successfully verified. You now have full access.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    read: true,
  },
  {
    id: 7,
    type: 'system',
    icon: '📢',
    title: 'System maintenance scheduled',
    message: 'Digital ID will undergo planned maintenance on March 10, 2:00–4:00 AM UTC.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    read: true,
  },
  {
    id: 8,
    type: 'promo',
    icon: '🎓',
    title: 'Student verification now available',
    message: 'Verify your student status to unlock exclusive discounts from Spotify, Apple, and more.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    read: true,
  },
];

function formatTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString();
}

export default function Notifications() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered =
    filter === 'all'
      ? notifications
      : filter === 'unread'
        ? notifications.filter((n) => !n.read)
        : notifications.filter((n) => n.type === filter);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function toggleRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
    );
  }

  function dismissNotification(id) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="notif-page">
      <div className="notif-header">
        <div>
          <h2>
            Notifications
            {unreadCount > 0 && <span className="notif-unread-count">{unreadCount}</span>}
          </h2>
          <p className="notif-subtitle">Stay updated on security events, verifications, and offers.</p>
        </div>
        {unreadCount > 0 && (
          <button type="button" className="notif-mark-all" onClick={markAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="notif-filters">
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'security', label: 'Security' },
          { id: 'verification', label: 'Verification' },
          { id: 'service', label: 'Services' },
          { id: 'promo', label: 'Offers' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            className={'notif-filter' + (filter === f.id ? ' active' : '')}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="notif-empty">
          <span className="notif-empty-icon">🔔</span>
          <h3>No notifications</h3>
          <p>You're all caught up!</p>
        </div>
      ) : (
        <div className="notif-list">
          {filtered.map((notif) => (
            <div
              key={notif.id}
              className={'notif-item' + (notif.read ? '' : ' unread')}
            >
              <div className="notif-item-left">
                <span className="notif-item-icon">{notif.icon}</span>
                {!notif.read && <span className="notif-unread-dot" />}
              </div>
              <div className="notif-item-content">
                <div className="notif-item-top">
                  <span className="notif-item-title">{notif.title}</span>
                  <span className="notif-item-time">{formatTime(notif.time)}</span>
                </div>
                <p className="notif-item-message">{notif.message}</p>
              </div>
              <div className="notif-item-actions">
                <button
                  type="button"
                  className="notif-action-btn"
                  onClick={() => toggleRead(notif.id)}
                  title={notif.read ? 'Mark unread' : 'Mark read'}
                >
                  {notif.read ? '○' : '●'}
                </button>
                <button
                  type="button"
                  className="notif-action-btn dismiss"
                  onClick={() => dismissNotification(notif.id)}
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
