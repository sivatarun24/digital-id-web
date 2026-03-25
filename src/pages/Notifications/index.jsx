import { useState, useEffect, useCallback } from 'react';
import {
  fetchNotifications,
  toggleRead,
  markAllRead,
  dismissNotification,
} from '../../api/notifications';
import { getMyInfoRequests, respondToInfoRequest } from '../../api/infoRequests';
import './Notifications.css';

function InfoResponseModal({ request, onClose, onResponded }) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]); // raw File objects
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleFileChange(e) {
    setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    e.target.value = '';
  }

  function removeFile(i) {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit() {
    if (!message.trim() && files.length === 0) return;
    setLoading(true);
    setError('');
    try {
      await respondToInfoRequest(request.id, message.trim(), files);
      setSent(true);
      setTimeout(onResponded, 1000);
    } catch (e) {
      setError(e.message || 'Failed to send response');
      setLoading(false);
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#0f172a', border: '1px solid #1e2a3a', borderRadius: 12, padding: 24, maxWidth: 520, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}
      >
        <p style={{ fontWeight: 700, fontSize: '1rem', color: '#e2e8f0', margin: '0 0 4px' }}>Respond to Admin Request</p>
        <div style={{ background: '#1c1107', border: '1px solid #78350f', borderRadius: 8, padding: '10px 14px', marginBottom: 18 }}>
          <div style={{ fontSize: '0.7rem', color: '#fb923c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Admin requested:
          </div>
          <div style={{ fontSize: '0.85rem', color: '#fde68a' }}>{request.note}</div>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#4ade80', fontWeight: 600 }}>Response sent!</div>
        ) : (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Your Message
              </label>
              <textarea
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #1e2a3a', background: '#0a0d14', color: '#e2e8f0', fontSize: '0.85rem', minHeight: 90, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                placeholder="Explain or provide the requested information…"
                value={message}
                onChange={e => setMessage(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Attach Files (optional)
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '6px 14px', borderRadius: 6, border: '1px solid #1e2a3a', background: '#0a0d14', color: '#94a3b8', fontSize: '0.82rem' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
                Choose files
                <input type="file" multiple style={{ display: 'none' }} onChange={handleFileChange} />
              </label>
              {files.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {files.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: '#1e2a3a', borderRadius: 4, fontSize: '0.75rem', color: '#94a3b8' }}>
                      📎 {f.name}
                      <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '0.8rem', padding: 0, lineHeight: 1 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              {error && <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#f87171' }}>{error}</div>}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{ padding: '7px 16px', borderRadius: 6, border: '1px solid #1e2a3a', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.83rem' }}>
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || (!message.trim() && files.length === 0)}
                style={{ padding: '7px 16px', borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 600, opacity: (loading || (!message.trim() && files.length === 0)) ? 0.5 : 1 }}
              >
                {loading ? 'Sending…' : 'Send Response'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

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

const PAGE_SIZE = 20;

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [filter, setFilter]               = useState('all');
  const [loading, setLoading]             = useState(true);
  const [loadingMore, setLoadingMore]     = useState(false);
  const [hasMore, setHasMore]             = useState(false);
  const [offset, setOffset]               = useState(0);
  const [error, setError]                 = useState(null);
  const [infoRequests, setInfoRequests]   = useState([]);
  const [respondTarget, setRespondTarget] = useState(null);
  const [requestKey, setRequestKey]       = useState(0);

  const refreshInfoRequests = useCallback(() => {
    getMyInfoRequests().then(setInfoRequests).catch(() => {});
  }, []);

  useEffect(() => {
    fetchNotifications({ type: filter, limit: PAGE_SIZE, offset: 0 })
      .then(({ notifications: list, unreadCount: count, hasMore: more }) => {
        setNotifications(list);
        setUnreadCount(count);
        setHasMore(!!more);
        setOffset(list.length);
        setLoading(false);
        setLoadingMore(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        setLoadingMore(false);
      });
  }, [filter, requestKey]);

  useEffect(() => { refreshInfoRequests(); }, [refreshInfoRequests]);

  function handleLoadMore() {
    setLoadingMore(true);
    fetchNotifications({ type: filter, limit: PAGE_SIZE, offset })
      .then(({ notifications: list, unreadCount: count, hasMore: more }) => {
        setNotifications((prev) => [...prev, ...list]);
        setUnreadCount(count);
        setHasMore(!!more);
        setOffset(offset + list.length);
        setLoadingMore(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoadingMore(false);
      });
  }

  function handleFilterChange(nextFilter) {
    if (nextFilter === filter) return;
    setError(null);
    setLoading(true);
    setFilter(nextFilter);
  }

  function handleRetry() {
    setError(null);
    setLoading(true);
    setRequestKey((key) => key + 1);
  }

  const filtered =
    filter === 'unread' ? notifications.filter((n) => !n.read)
    : notifications;

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

      {infoRequests.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fb923c', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.3)', borderRadius: 4, padding: '2px 8px' }}>
              ⚠ Action Required
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Admin Info Requests ({infoRequests.length})
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {infoRequests.map(r => (
              <div
                key={r.id}
                onClick={() => setRespondTarget(r)}
                style={{
                  cursor: 'pointer',
                  background: '#1c1107',
                  border: '1px solid #92400e',
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#fb923c'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#92400e'}
              >
                <span style={{ fontSize: '1.1rem', marginTop: 1 }}>📋</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.7rem', color: '#fb923c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
                    Admin Request · {r.source === 'verification_review' ? 'Verification' : 'General'}
                  </div>
                  <div style={{ fontSize: '0.87rem', color: '#fde68a', marginBottom: 4, wordBreak: 'break-word' }}>{r.note}</div>
                  <div style={{ fontSize: '0.72rem', color: '#78350f' }}>
                    {r.requestedAt ? formatTime(r.requestedAt) : ''} · Click to respond
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff', background: '#b45309', borderRadius: 4, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Respond →
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
            onClick={() => handleFilterChange(f.id)}
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
        <div className="notif-error"><p>{error}</p><button onClick={handleRetry}>Retry</button></div>
      )}

      {!loading && !error && (
        filtered.length === 0 ? (
          <div className="notif-empty">
            <span className="notif-empty-icon"><Icon.Bell /></span>
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <>
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
            {hasMore && filter !== 'unread' && (
              <button
                type="button"
                className="notif-load-more"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            )}
          </>
        )
      )}

      {respondTarget && (
        <InfoResponseModal
          request={respondTarget}
          onClose={() => setRespondTarget(null)}
          onResponded={() => { setRespondTarget(null); refreshInfoRequests(); }}
        />
      )}
    </div>
  );
}
