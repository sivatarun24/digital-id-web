import { useState, useEffect, useCallback } from 'react';
import {
  fetchNotifications,
  toggleRead,
  markAllRead,
  dismissNotification,
} from '../../api/notifications';
import './Notifications.css';

const Icon = {
  Lock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  IdCard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="8" cy="12" r="2" /><path d="M14 10h4M14 14h3" />
    </svg>
  ),
  Link: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  Gift: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  ),
  Key: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5" /><path d="M21 2l-9.6 9.6" /><path d="M15.5 7.5l3 3L22 7l-3-3" />
    </svg>
  ),
  CheckShield: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  Megaphone: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l19-9-9 19-2-8-8-2z" />
    </svg>
  ),
  Bell: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  X: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  CircleFill: () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="10" /></svg>
  ),
  Circle: () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /></svg>
  ),
};

const TYPE_ICON = {
  security: Icon.Lock,
  verification: Icon.CheckShield,
  service: Icon.Link,
  promo: Icon.Gift,
  system: Icon.Megaphone,
};

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
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [filter, setFilter]               = useState('all');
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  const load = useCallback(() => {
    fetchNotifications()
      .then(({ notifications: list, unreadCount: count }) => {
        setNotifications(list);
        setUnreadCount(count);
        setLoading(false);
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered =
    filter === 'all'     ? notifications
    : filter === 'unread' ? notifications.filter((n) => !n.read)
    : notifications.filter((n) => n.type === filter);

  async function handleToggleRead(id) {
    try {
      const updated = await toggleRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: updated.read } : n));
      setUnreadCount((c) => updated.read ? Math.max(0, c - 1) : c + 1);
    } catch (err) { alert(err.message); }
  }

  async function handleMarkAllRead() {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) { alert(err.message); }
  }

  async function handleDismiss(id) {
    try {
      await dismissNotification(id);
      const dismissed = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (dismissed && !dismissed.read) setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) { alert(err.message); }
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
          <button type="button" className="notif-mark-all" onClick={handleMarkAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="notif-filters">
        {[
          { id: 'all',          label: 'All' },
          { id: 'unread',       label: `Unread (${unreadCount})` },
          { id: 'security',     label: 'Security' },
          { id: 'verification', label: 'Verification' },
          { id: 'service',      label: 'Services' },
          { id: 'promo',        label: 'Offers' },
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

      {loading && (
        <div className="notif-loading">
          <div className="notif-spinner" />
          <span>Loading notifications…</span>
        </div>
      )}

      {!loading && error && (
        <div className="notif-error"><p>{error}</p><button onClick={load}>Retry</button></div>
      )}

      {!loading && !error && (
        filtered.length === 0 ? (
          <div className="notif-empty">
            <span className="notif-empty-icon"><Icon.Bell /></span>
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <div className="notif-list">
            {filtered.map((notif) => {
              const NotifIcon = TYPE_ICON[notif.type] || Icon.Megaphone;
              return (
                <div key={notif.id} className={'notif-item' + (notif.read ? '' : ' unread')}>
                  <div className="notif-item-left">
                    <span className="notif-item-icon"><NotifIcon /></span>
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
                      onClick={() => handleToggleRead(notif.id)}
                      title={notif.read ? 'Mark unread' : 'Mark read'}
                    >
                      {notif.read ? <Icon.Circle /> : <Icon.CircleFill />}
                    </button>
                    <button
                      type="button"
                      className="notif-action-btn dismiss"
                      onClick={() => handleDismiss(notif.id)}
                      title="Dismiss"
                    >
                      <Icon.X />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
