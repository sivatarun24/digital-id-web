import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { fetchDashboard } from '../../api/dashboard';
import './Home.css';

const QUICK_ACTIONS = [
  { path: '/verify-identity', title: 'Verify Identity',    desc: 'Upload documents and get verified' },
  { path: '/credentials',     title: 'Credentials',        desc: 'Manage group affiliations' },
  { path: '/wallet',          title: 'Digital Wallet',     desc: 'View your ID cards' },
  { path: '/documents',       title: 'Documents',          desc: 'Upload and manage documents' },
  { path: '/services',        title: 'Connected Services', desc: 'Government & commercial services' },
  { path: '/settings',        title: 'Security Settings',  desc: 'MFA and account preferences' },
];

const VERIF_TYPES = [
  { label: 'Military',        desc: 'Active duty & veterans' },
  { label: 'Student',         desc: 'College enrollment' },
  { label: 'First Responder', desc: 'EMT, fire, police' },
  { label: 'Teacher',         desc: 'K–12 & higher ed' },
  { label: 'Healthcare',      desc: 'Medical staff' },
  { label: 'Government',      desc: 'Federal & state employees' },
];

const TYPE_COLOR = { login: 'login', doc: 'doc', service: 'service', security: 'security', credential: 'credential' };

function timeAgo(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function ActivityDot({ type }) {
  return <span className={`home-activity-dot ${TYPE_COLOR[type] || 'security'}`} />;
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboard().then(setStats).catch(() => {});
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const firstName = user?.name?.split(' ')[0] || user?.username || '';
  const identityVerified = stats?.identityVerified ?? false;
  const recentActivity = stats?.recentActivity ?? [];

  return (
    <div className="home-page">

      {/* ── Welcome ── */}
      <div className="home-welcome">
        <div className="home-welcome-text">
          <h1 className="home-welcome-title">Welcome back{firstName ? `, ${firstName}` : ''}</h1>
          <p className="home-welcome-date">{today}</p>
        </div>
        <div className={`home-status-pill ${identityVerified ? 'verified' : 'pending'}`}>
          <span className="home-status-dot" />
          {identityVerified ? 'Identity Verified' : 'Verification Pending'}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="home-stats">
        <div className="home-stat">
          <span className="home-stat-value">{stats ? (identityVerified ? '1' : '0') : '—'}</span>
          <span className="home-stat-label">Verified IDs</span>
          <span className="home-stat-sub">Government-issued</span>
        </div>
        <div className="home-stat">
          <span className="home-stat-value">{stats?.serviceCount ?? '—'}</span>
          <span className="home-stat-label">Connected Services</span>
          <span className="home-stat-sub">Active partnerships</span>
        </div>
        <div className="home-stat">
          <span className="home-stat-value">{stats?.credentialCount ?? '—'}</span>
          <span className="home-stat-label">Credentials</span>
          <span className="home-stat-sub">Group affiliations</span>
        </div>
        <div className="home-stat">
          <span className="home-stat-value">{stats?.docCount ?? '—'}</span>
          <span className="home-stat-label">Documents</span>
          <span className="home-stat-sub">Stored securely</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="home-body">
        <div className="home-main">

          <section className="home-section">
            <h2 className="home-section-heading">Quick Actions</h2>
            <div className="home-actions">
              {QUICK_ACTIONS.map((a) => (
                <button key={a.path} type="button" className="home-action" onClick={() => navigate(a.path)}>
                  <div className="home-action-text">
                    <span className="home-action-title">{a.title}</span>
                    <span className="home-action-desc">{a.desc}</span>
                  </div>
                  <svg className="home-action-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </section>

          <section className="home-section">
            <h2 className="home-section-heading">Supported Verifications</h2>
            <div className="home-verif-grid">
              {VERIF_TYPES.map((v) => (
                <div key={v.label} className="home-verif-chip">
                  <span className="home-verif-name">{v.label}</span>
                  <span className="home-verif-desc">{v.desc}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="home-side">

          <section className="home-section">
            <h2 className="home-section-heading">Identity Status</h2>
            <div className="home-id-card">
              <div className="home-id-card-row">
                <span className="home-id-card-label">Name</span>
                <span className="home-id-card-value">{user?.name || user?.username || '—'}</span>
              </div>
              <div className="home-id-card-row">
                <span className="home-id-card-label">Status</span>
                <span className={`home-id-status ${identityVerified ? 'verified' : 'pending'}`}>
                  {identityVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="home-id-card-row">
                <span className="home-id-card-label">Level</span>
                <span className="home-id-card-value">
                  {identityVerified ? 'IAL2 — Strong' : 'Not yet verified'}
                </span>
              </div>
              <div className="home-id-card-row">
                <span className="home-id-card-label">ID</span>
                <span className="home-id-card-value home-id-mono">
                  DID-{(user?.id || '000000').toString().padStart(6, '0')}
                </span>
              </div>
              {!identityVerified && (
                <button type="button" className="home-verify-cta" onClick={() => navigate('/verify-identity')}>
                  Verify your identity
                </button>
              )}
            </div>
          </section>

          <section className="home-section">
            <div className="home-section-header">
              <h2 className="home-section-heading" style={{ margin: 0 }}>Recent Activity</h2>
              <Link to="/activity" className="home-section-link">View all</Link>
            </div>
            <div className="home-activity-list">
              {recentActivity.length === 0 ? (
                <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', padding: '8px 0' }}>
                  No activity yet.
                </p>
              ) : (
                recentActivity.map((item, i) => (
                  <div key={i} className="home-activity-item">
                    <ActivityDot type={item.type} />
                    <div className="home-activity-body">
                      <span className="home-activity-label">{item.label}</span>
                      {item.detail && <span className="home-activity-detail">{item.detail}</span>}
                    </div>
                    <span className="home-activity-time">{timeAgo(item.time)}</span>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
