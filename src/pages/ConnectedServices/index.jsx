import { useState, useEffect, useCallback } from 'react';
import { fetchServices, connectService, disconnectService } from '../../api/services';
import './ConnectedServices.css';

const Icon = {
  Building:  () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14" /><path d="M9 21v-4h6v4" /></svg>),
  File:      () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>),
  Lock:      () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>),
  Briefcase: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>),
  Phone:     () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>),
  Monitor:   () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>),
  Wrench:    () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>),
  Tag:       () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>),
  Music:     () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>),
  Folder:    () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>),
};

const SERVICE_ICON = {
  va: Icon.Building, ssa: Icon.File, login_gov: Icon.Lock,
  sba: Icon.Briefcase, usajobs: Icon.Folder, tmobile: Icon.Phone,
  samsung: Icon.Monitor, lowes: Icon.Wrench, nike: Icon.Tag, spotify: Icon.Music,
};

export default function ConnectedServices() {
  const [services, setServices] = useState([]);
  const [filter, setFilter]     = useState('all');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [busy, setBusy]         = useState(null); // slug of service being toggled

  const load = useCallback(() => {
    setLoading(true);
    fetchServices()
      .then(setServices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const connected = services.filter((s) => s.connected);

  const filtered =
    filter === 'all'        ? services
    : filter === 'connected'  ? connected
    : filter === 'government' ? services.filter((s) => s.category === 'Government')
    : services.filter((s) => s.category === 'Commercial');

  async function handleToggle(svc) {
    setBusy(svc.id);
    try {
      if (svc.connected) {
        await disconnectService(svc.id);
        setServices((prev) => prev.map((s) => s.id === svc.id ? { ...s, connected: false } : s));
      } else {
        const result = await connectService(svc.id);
        setServices((prev) => prev.map((s) =>
          s.id === svc.id
            ? { ...s, connected: true, connectedAt: new Date().toISOString().split('T')[0], lastUsed: new Date().toISOString().split('T')[0] }
            : s
        ));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="cs-page">
      <div className="cs-header">
        <div>
          <h2>Connected Services</h2>
          <p className="cs-subtitle">
            Manage government and commercial services linked to your Digital ID.
          </p>
        </div>
        <div className="cs-stats-row">
          <div className="cs-stat">
            <span className="cs-stat-num">{connected.length}</span>
            <span className="cs-stat-label">Connected</span>
          </div>
          <div className="cs-stat">
            <span className="cs-stat-num">{services.length}</span>
            <span className="cs-stat-label">Available</span>
          </div>
        </div>
      </div>

      <div className="cs-filters">
        {[
          { id: 'all', label: 'All Services' },
          { id: 'connected', label: 'Connected' },
          { id: 'government', label: 'Government' },
          { id: 'commercial', label: 'Commercial' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            className={'cs-filter' + (filter === f.id ? ' active' : '')}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="cs-loading">
          <div className="cs-spinner" />
          <span>Loading services…</span>
        </div>
      )}

      {!loading && error && (
        <div className="cs-error"><p>{error}</p><button onClick={load}>Retry</button></div>
      )}

      {!loading && !error && (
        <div className="cs-list">
          {filtered.map((svc) => {
            const SvcIcon = SERVICE_ICON[svc.id] || Icon.Building;
            const isBusy = busy === svc.id;
            return (
              <div key={svc.id} className={'cs-card' + (svc.connected ? ' connected' : '')}>
                <div className="cs-card-top">
                  <span className="cs-card-icon"><SvcIcon /></span>
                  <div className="cs-card-info">
                    <span className="cs-card-name">{svc.name}</span>
                    <span className="cs-card-category">{svc.category}</span>
                  </div>
                  {svc.connected
                    ? <span className="cs-status-badge connected">Connected</span>
                    : <span className="cs-status-badge">Not Connected</span>
                  }
                </div>
                <p className="cs-card-desc">{svc.desc}</p>
                {svc.connected && svc.lastUsed && (
                  <div className="cs-card-meta">
                    <span>Connected: {svc.connectedAt}</span>
                    <span>Last used: {svc.lastUsed}</span>
                  </div>
                )}
                <div className="cs-card-actions">
                  <button
                    type="button"
                    className={'cs-toggle-btn' + (svc.connected ? ' disconnect' : '')}
                    onClick={() => handleToggle(svc)}
                    disabled={isBusy}
                  >
                    {isBusy ? '…' : svc.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
