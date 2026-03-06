import { useState } from 'react';
import './ConnectedServices.css';

const AVAILABLE_SERVICES = [
  {
    id: 'va',
    icon: '🏛️',
    name: 'Department of Veterans Affairs',
    category: 'Government',
    desc: 'Access VA benefits, healthcare, and disability services.',
    connected: false,
  },
  {
    id: 'ssa',
    icon: '📋',
    name: 'Social Security Administration',
    category: 'Government',
    desc: 'View statements, apply for benefits, and manage your account.',
    connected: false,
  },
  {
    id: 'login_gov',
    icon: '🔐',
    name: 'Login.gov',
    category: 'Government',
    desc: 'Secure access to participating government agencies.',
    connected: false,
  },
  {
    id: 'sba',
    icon: '💼',
    name: 'Small Business Administration',
    category: 'Government',
    desc: 'Access SBA loans, grants, and business resources.',
    connected: false,
  },
  {
    id: 'tmobile',
    icon: '📱',
    name: 'T-Mobile',
    category: 'Commercial',
    desc: 'Military and first responder discounts on wireless plans.',
    connected: true,
    connectedAt: '2025-12-15',
    lastUsed: '2026-02-28',
  },
  {
    id: 'samsung',
    icon: '📺',
    name: 'Samsung',
    category: 'Commercial',
    desc: 'Exclusive discounts on electronics and appliances.',
    connected: false,
  },
  {
    id: 'lowes',
    icon: '🔨',
    name: "Lowe's",
    category: 'Commercial',
    desc: 'Military discount on eligible purchases.',
    connected: true,
    connectedAt: '2026-01-05',
    lastUsed: '2026-03-01',
  },
  {
    id: 'nike',
    icon: '👟',
    name: 'Nike',
    category: 'Commercial',
    desc: 'Exclusive discount for military, students, and first responders.',
    connected: false,
  },
  {
    id: 'spotify',
    icon: '🎵',
    name: 'Spotify',
    category: 'Commercial',
    desc: 'Student and military discount on Premium plans.',
    connected: false,
  },
  {
    id: 'usajobs',
    icon: '🗂️',
    name: 'USAJobs',
    category: 'Government',
    desc: 'Federal employment opportunities and applications.',
    connected: false,
  },
];

export default function ConnectedServices() {
  const [filter, setFilter] = useState('all');
  const [services, setServices] = useState(AVAILABLE_SERVICES);

  const connected = services.filter((s) => s.connected);
  const filtered =
    filter === 'all'
      ? services
      : filter === 'connected'
        ? connected
        : filter === 'government'
          ? services.filter((s) => s.category === 'Government')
          : services.filter((s) => s.category === 'Commercial');

  function handleToggle(id) {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              connected: !s.connected,
              connectedAt: !s.connected ? new Date().toISOString().split('T')[0] : s.connectedAt,
            }
          : s,
      ),
    );
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

      <div className="cs-list">
        {filtered.map((svc) => (
          <div key={svc.id} className={'cs-card' + (svc.connected ? ' connected' : '')}>
            <div className="cs-card-top">
              <span className="cs-card-icon">{svc.icon}</span>
              <div className="cs-card-info">
                <span className="cs-card-name">{svc.name}</span>
                <span className="cs-card-category">{svc.category}</span>
              </div>
              {svc.connected ? (
                <span className="cs-status-badge connected">Connected</span>
              ) : (
                <span className="cs-status-badge">Not Connected</span>
              )}
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
                onClick={() => handleToggle(svc.id)}
              >
                {svc.connected ? 'Disconnect' : 'Connect'}
              </button>
              {svc.connected && (
                <button type="button" className="cs-manage-btn">
                  Manage Permissions
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
