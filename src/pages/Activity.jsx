import { useState } from 'react';
import './Activity.css';

const MOCK_ACTIVITY = [
  {
    id: 1,
    type: 'login',
    icon: '🔑',
    title: 'Sign in successful',
    desc: 'Signed in from Chrome on macOS',
    ip: '192.168.1.42',
    location: 'San Francisco, CA',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 2,
    type: 'verification',
    icon: '🪪',
    title: 'Identity verification initiated',
    desc: "Driver's License submitted for review",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 3,
    type: 'service',
    icon: '🔗',
    title: 'Service connected',
    desc: "Connected to Lowe's military discount program",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 4,
    type: 'security',
    icon: '🔐',
    title: 'Password changed',
    desc: 'Account password updated successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 5,
    type: 'login',
    icon: '🔑',
    title: 'Sign in successful',
    desc: 'Signed in from Safari on iPhone',
    ip: '10.0.0.15',
    location: 'San Francisco, CA',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 6,
    type: 'credential',
    icon: '🎖️',
    title: 'Credential verification started',
    desc: 'Military affiliation verification in progress',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 7,
    type: 'service',
    icon: '🔗',
    title: 'Service connected',
    desc: 'Connected to T-Mobile military plan',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 8,
    type: 'login',
    icon: '🔑',
    title: 'Sign in from new device',
    desc: 'Signed in from Firefox on Windows',
    ip: '172.16.0.88',
    location: 'Austin, TX',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: 9,
    type: 'security',
    icon: '📧',
    title: 'Email verification sent',
    desc: 'Verification code sent to j***@email.com',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: 10,
    type: 'login',
    icon: '🔑',
    title: 'Account created',
    desc: 'Digital ID account registered successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
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

export default function Activity() {
  const [filter, setFilter] = useState('all');

  const filtered =
    filter === 'all'
      ? MOCK_ACTIVITY
      : MOCK_ACTIVITY.filter((a) => a.type === filter);

  const typeColors = {
    login: 'login',
    verification: 'verify',
    service: 'service',
    security: 'security',
    credential: 'credential',
  };

  return (
    <div className="act-page">
      <div className="act-header">
        <h2>Activity Log</h2>
        <p className="act-subtitle">
          Track sign-ins, verification events, and security changes across your account.
        </p>
      </div>

      <div className="act-filters">
        {[
          { id: 'all', label: 'All Activity' },
          { id: 'login', label: 'Sign-ins' },
          { id: 'verification', label: 'Verifications' },
          { id: 'security', label: 'Security' },
          { id: 'service', label: 'Services' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            className={'act-filter' + (filter === f.id ? ' active' : '')}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="act-timeline">
        {filtered.length === 0 ? (
          <div className="act-empty">
            <span className="act-empty-icon">📭</span>
            <p>No activity found for this filter.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="act-item">
              <div className={'act-dot ' + (typeColors[item.type] || '')} />
              <div className="act-item-content">
                <div className="act-item-top">
                  <span className="act-item-icon">{item.icon}</span>
                  <div className="act-item-text">
                    <span className="act-item-title">{item.title}</span>
                    <span className="act-item-desc">{item.desc}</span>
                  </div>
                  <span className="act-item-time">{timeAgo(item.timestamp)}</span>
                </div>
                {(item.ip || item.location) && (
                  <div className="act-item-meta">
                    {item.ip && <span>IP: {item.ip}</span>}
                    {item.location && <span>{item.location}</span>}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
