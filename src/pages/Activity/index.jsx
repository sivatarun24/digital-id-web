import { useState, useEffect, useCallback } from 'react';
import { fetchActivity } from '../../api/activity';
import './Activity.css';

const Icon = {
  Key: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5" /><path d="M21 2l-9.6 9.6" /><path d="M15.5 7.5l3 3L22 7l-3-3" />
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
  Lock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Award: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  Inbox: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  ),
};

const TYPE_ICON = {
  login: Icon.Key,
  verification: Icon.IdCard,
  service: Icon.Link,
  security: Icon.Lock,
  credential: Icon.Award,
};

const TYPE_COLOR = {
  login: 'login',
  verification: 'verify',
  service: 'service',
  security: 'security',
  credential: 'credential',
};

const FILTERS = [
  { id: 'all', label: 'All Activity' },
  { id: 'login', label: 'Sign-ins' },
  { id: 'verification', label: 'Verifications' },
  { id: 'security', label: 'Security' },
  { id: 'service', label: 'Services' },
];

function timeAgo(isoString) {
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

function parseUserAgent(ua) {
  if (!ua) return '';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edge')) return 'Edge';
  return 'Browser';
}

const PAGE_SIZE = 20;

export default function Activity() {
  const [activity, setActivity] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState(null);

  const load = useCallback((currentFilter, reset = true) => {
    if (reset) setLoading(true);
    const off = reset ? 0 : offset;
    fetchActivity({ type: currentFilter, limit: PAGE_SIZE, offset: off })
      .then(({ activity: list, hasMore: more }) => {
        setActivity((prev) => reset ? list : [...prev, ...list]);
        setHasMore(!!more);
        setOffset(off + list.length);
        setError(null);
        setLoading(false);
        setLoadingMore(false);
      })
      .catch((err) => { setError(err.message); setLoading(false); setLoadingMore(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    setOffset(0);
    load(filter, true);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleFilterChange(id) { setError(null); setFilter(id); }
  function handleRetry() { setLoading(true); setError(null); load(filter, true); }
  function handleLoadMore() { setLoadingMore(true); load(filter, false); }

  return (
    <div className="act-page">
      <div className="act-header">
        <h2>Activity Log</h2>
        <p className="act-subtitle">
          Track sign-ins, verification events, and security changes across your account.
        </p>
      </div>

      <div className="act-filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={'act-filter' + (filter === f.id ? ' active' : '')}
            onClick={() => handleFilterChange(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="act-loading">
          <div className="act-spinner" />
          <span>Loading activity…</span>
        </div>
      )}

      {!loading && error && (
        <div className="act-error">
          <p>{error}</p>
          <button type="button" className="act-retry-btn" onClick={handleRetry}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="act-timeline">
            {activity.length === 0 ? (
              <div className="act-empty">
                <span className="act-empty-icon"><Icon.Inbox /></span>
                <p>No activity found for this filter.</p>
              </div>
            ) : (
              activity.map((item) => {
                const ItemIcon = TYPE_ICON[item.type] || Icon.Lock;
                return (
                  <div key={item.id} className="act-item">
                    <div className={'act-dot ' + (TYPE_COLOR[item.type] || '')} />
                    <div className="act-item-content">
                      <div className="act-item-top">
                        <span className="act-item-icon"><ItemIcon /></span>
                        <div className="act-item-text">
                          <span className="act-item-title">{item.title}</span>
                          <span className="act-item-desc">{item.desc}</span>
                        </div>
                        <span className="act-item-time">{timeAgo(item.timestamp)}</span>
                      </div>
                      {(item.ip || item.userAgent) && (
                        <div className="act-item-meta">
                          {item.ip && <span>IP: {item.ip}</span>}
                          {item.userAgent && <span>{parseUserAgent(item.userAgent)}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {hasMore && (
            <button
              type="button"
              className="act-load-more"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
