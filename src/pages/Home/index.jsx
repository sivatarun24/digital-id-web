import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { fetchHome } from '../../api/home';
import { sendToAdmin, sendToInstAdmin, getMyMessages } from '../../api/messages';
import { getMyInfoRequests } from '../../api/infoRequests';
import { fetchNotifications } from '../../api/notifications';
import { fetchActivity } from '../../api/activity';
import './Home.css';

const FAVORITE_CARDS = [
  { path: '/verification', title: 'Verification Center', desc: 'Identity review, documents, and follow-up requests' },
  { path: '/credentials', title: 'Credentials', desc: 'Manage student, military, healthcare, and more' },
  { path: '/notifications', title: 'Notifications', desc: 'Track approvals, rejections, and new messages' },
  { path: '/wallet', title: 'Digital Wallet', desc: 'Open your cards and saved identity passes' },
];

const QUICK_ACTIONS = [
  { path: '/verification', title: 'Start verification', desc: 'Submit or update your identity documents' },
  { path: '/notifications', title: 'Open notifications', desc: 'Review unread updates from the platform' },
  { path: '/activity', title: 'View activity', desc: 'See recent sign-ins, uploads, and account changes' },
  { path: '/services', title: 'Browse services', desc: 'Access connected government and commercial services' },
  { path: '/settings', title: 'Security settings', desc: 'Manage MFA and account preferences' },
];

const VERIF_TYPES = [
  { label: 'Military', desc: 'Active duty & veterans' },
  { label: 'Student', desc: 'College enrollment' },
  { label: 'First Responder', desc: 'EMT, fire, police' },
  { label: 'Teacher', desc: 'K-12 & higher ed' },
  { label: 'Healthcare', desc: 'Medical staff' },
  { label: 'Government', desc: 'Federal & state employees' },
];

const TYPE_COLOR = {
  login: 'login',
  doc: 'doc',
  service: 'service',
  security: 'security',
  credential: 'credential',
  verification: 'verification',
};

function timeAgo(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function ActivityDot({ type }) {
  return <span className={`home-activity-dot ${TYPE_COLOR[type] || 'security'}`} />;
}

function SendMessageModal({ title, onSend, onClose }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);

  function handleSend() {
    if (!body.trim()) return;
    onSend(subject.trim() || title, body.trim());
    setSent(true);
    setTimeout(onClose, 1100);
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--surface, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: 12, padding: 24, maxWidth: 460, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
        onClick={e => e.stopPropagation()}
      >
        <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-1, #1a1a1a)', margin: '0 0 16px' }}>{title}</p>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#16a34a', fontWeight: 600 }}>
            Sent successfully!
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-2, #555)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Subject
              </label>
              <input
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border, #e2e8f0)', background: 'var(--surface-2, #f8f9fa)', color: 'var(--text-1, #1a1a1a)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                placeholder="What is this about?"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-2, #555)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Message *
              </label>
              <textarea
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border, #e2e8f0)', background: 'var(--surface-2, #f8f9fa)', color: 'var(--text-1, #1a1a1a)', fontSize: '0.85rem', minHeight: 100, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                placeholder="Write your message..."
                value={body}
                onChange={e => setBody(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                style={{ padding: '7px 16px', borderRadius: 6, border: '1px solid var(--border, #e2e8f0)', background: 'transparent', color: 'var(--text-2, #555)', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!body.trim()}
                style={{ padding: '7px 16px', borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 600, opacity: body.trim() ? 1 : 0.5 }}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [msgTarget, setMsgTarget] = useState(null);
  const [pendingInfoRequests, setPendingInfoRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [myMessages, setMyMessages] = useState([]);

  useEffect(() => {
    fetchHome().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    getMyInfoRequests().then(data => setPendingInfoRequests(Array.isArray(data) ? data : (data?.requests ?? []))).catch(() => {});
    fetchNotifications({ limit: 5 }).then(data => setNotifications(data?.notifications ?? [])).catch(() => {});
    fetchActivity({ limit: 6 }).then(data => {
      const items = (data?.activity ?? []).map(item => ({
        type: item.type,
        label: item.label || item.title,
        detail: item.detail || item.desc,
        time: item.time || item.createdAt || item.timestamp,
      }));
      setActivityFeed(items);
    }).catch(() => {});
    getMyMessages().then(data => setMyMessages(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const firstName = user?.name?.split(' ')[0] || user?.username || '';
  const identityVerified = stats?.identityVerified ?? false;
  const recentActivity = activityFeed.length > 0 ? activityFeed : (stats?.recentActivity ?? []);
  const unreadNotifications = stats?.unreadNotifications ?? notifications.filter((n) => !n.read).length;
  const pendingVerifications = stats?.pendingVerifications ?? 0;
  const latestNotifications = useMemo(
    () => (stats?.latestNotifications?.length ? stats.latestNotifications : notifications).slice(0, 3),
    [notifications, stats]
  );
  const lastSupportContact = myMessages[0] ?? null;
  const latestActivity = recentActivity[0] ?? null;
  const identityStatusText = identityVerified
    ? 'Verified'
    : stats?.hasPendingIdentityVerification
      ? 'Pending review'
      : 'Not started';
  const identityStatusTone = identityVerified ? 'verified' : stats?.hasPendingIdentityVerification ? 'pending' : 'idle';

  const homeCards = [
    {
      label: 'Pending Verifications',
      value: pendingVerifications,
      tone: pendingVerifications > 0 ? 'warning' : 'success',
      helper: pendingVerifications > 0 ? 'Reviews in progress' : 'Nothing waiting',
      onClick: () => navigate('/verification'),
    },
    {
      label: 'Unread Notifications',
      value: unreadNotifications,
      tone: unreadNotifications > 0 ? 'info' : 'neutral',
      helper: unreadNotifications > 0 ? 'Needs your attention' : 'You are all caught up',
      onClick: () => navigate('/notifications'),
    },
    {
      label: 'Identity Status',
      value: identityStatusText,
      tone: identityStatusTone,
      helper: identityVerified ? 'Ready for protected services' : 'Continue in verification center',
      onClick: () => navigate('/verification'),
    },
    {
      label: 'Latest Activity',
      value: latestActivity?.label || 'No recent activity',
      tone: latestActivity ? 'neutral' : 'idle',
      helper: latestActivity ? timeAgo(latestActivity.time || latestActivity.createdAt) : 'Your account is quiet',
      onClick: () => navigate('/activity'),
    },
    {
      label: 'Last Contact Support',
      value: lastSupportContact?.subject || 'No support messages yet',
      tone: lastSupportContact ? 'info' : 'idle',
      helper: lastSupportContact ? `${lastSupportContact.target === 'ADMIN' ? 'Platform support' : 'Institution admin'} • ${timeAgo(lastSupportContact.sentAt)}` : 'You have not contacted support',
      onClick: () => setMsgTarget('admin'),
    },
  ];

  function handleSend(subject, body) {
    if (msgTarget === 'admin') sendToAdmin(subject, body).catch(() => {});
    else sendToInstAdmin(subject, body).catch(() => {});
  }

  return (
    <div className="home-page">
      <div className="home-welcome">
        <div className="home-welcome-text">
          <h1 className="home-welcome-title">Home{firstName ? ` for ${firstName}` : ''}</h1>
          <p className="home-welcome-date">{today}</p>
        </div>
        <div className={`home-status-pill ${identityVerified ? 'verified' : 'pending'}`}>
          <span className="home-status-dot" />
          {identityVerified ? 'Identity Verified' : stats?.hasPendingIdentityVerification ? 'Verification Pending' : 'Verification Not Started'}
        </div>
      </div>

      {pendingInfoRequests.length > 0 && (
        <div className="home-banner">
          <div className="home-banner-head">
            <span className="home-banner-icon">!</span>
            <span className="home-banner-title">Action Required - More information needed</span>
          </div>
          <div className="home-banner-list">
            {pendingInfoRequests.map((request) => (
              <div key={request.id} className="home-banner-item">
                <div className="home-banner-note">{request.note}</div>
                <div className="home-banner-meta">Requested by {request.requestedBy}</div>
              </div>
            ))}
          </div>
          <div className="home-banner-footer">
            Please respond in the verification center or contact support if you need help.
          </div>
        </div>
      )}

      <div className="home-stats home-stats-home">
        {homeCards.map((card) => (
          <button key={card.label} type="button" className={`home-stat home-stat-card ${card.tone}`} onClick={card.onClick}>
            <span className="home-stat-label">{card.label}</span>
            <span className="home-stat-value">{card.value}</span>
            <span className="home-stat-sub">{card.helper}</span>
          </button>
        ))}
      </div>

      <div className="home-body">
        <div className="home-main">
          <section className="home-section">
            <h2 className="home-section-heading">Favorite Cards</h2>
            <div className="home-favorite-grid">
              {FAVORITE_CARDS.map((card) => (
                <button key={card.path} type="button" className="home-favorite-card" onClick={() => navigate(card.path)}>
                  <span className="home-favorite-title">{card.title}</span>
                  <span className="home-favorite-desc">{card.desc}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="home-section">
            <div className="home-section-header">
              <h2 className="home-section-heading home-section-heading-inline">Notifications Snapshot</h2>
              <Link to="/notifications" className="home-section-link">View all</Link>
            </div>
            <div className="home-activity-list">
              {latestNotifications.length === 0 ? (
                <p className="home-empty-copy">No notifications yet.</p>
              ) : (
                latestNotifications.map((item) => (
                  <div key={item.id} className="home-activity-item">
                    <ActivityDot type={item.type} />
                    <div className="home-activity-body">
                      <span className="home-activity-label">{item.title}</span>
                      {item.message && <span className="home-activity-detail">{item.message}</span>}
                    </div>
                    <span className="home-activity-time">{timeAgo(item.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="home-section">
            <div className="home-section-header">
              <h2 className="home-section-heading home-section-heading-inline">Latest Activity</h2>
              <Link to="/activity" className="home-section-link">View all</Link>
            </div>
            <div className="home-activity-list">
              {recentActivity.length === 0 ? (
                <p className="home-empty-copy">No activity yet.</p>
              ) : (
                recentActivity.map((item, index) => (
                  <div key={index} className="home-activity-item">
                    <ActivityDot type={item.type} />
                    <div className="home-activity-body">
                      <span className="home-activity-label">{item.label}</span>
                      {item.detail && <span className="home-activity-detail">{item.detail}</span>}
                    </div>
                    <span className="home-activity-time">{timeAgo(item.time || item.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="home-section">
            <h2 className="home-section-heading">Quick Actions</h2>
            <div className="home-actions">
              {QUICK_ACTIONS.map((action) => (
                <button key={action.path} type="button" className="home-action" onClick={() => navigate(action.path)}>
                  <div className="home-action-text">
                    <span className="home-action-title">{action.title}</span>
                    <span className="home-action-desc">{action.desc}</span>
                  </div>
                  <svg className="home-action-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </section>

          <section className="home-section">
            <h2 className="home-section-heading">Contact Support</h2>
            <div className="home-actions">
              <button type="button" className="home-action" onClick={() => setMsgTarget('admin')}>
                <div className="home-action-text">
                  <span className="home-action-title">Message Admin</span>
                  <span className="home-action-desc">Send a message to platform support</span>
                </div>
                <svg className="home-action-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                </svg>
              </button>
              <button type="button" className="home-action" onClick={() => setMsgTarget('inst')}>
                <div className="home-action-text">
                  <span className="home-action-title">Message Institution</span>
                  <span className="home-action-desc">Contact your institution admin</span>
                </div>
                <svg className="home-action-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
            <div className="home-support-meta">
              Last contact:
              <span>
                {lastSupportContact
                  ? `${lastSupportContact.subject || 'No subject'} • ${timeAgo(lastSupportContact.sentAt)}`
                  : ' Never'}
              </span>
            </div>
          </section>

          <section className="home-section">
            <h2 className="home-section-heading">Supported Verifications</h2>
            <div className="home-verif-grid">
              {VERIF_TYPES.map((item) => (
                <div key={item.label} className="home-verif-chip">
                  <span className="home-verif-name">{item.label}</span>
                  <span className="home-verif-desc">{item.desc}</span>
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
                <span className={`home-id-status ${identityStatusTone}`}>{identityStatusText}</span>
              </div>
              <div className="home-id-card-row">
                <span className="home-id-card-label">Level</span>
                <span className="home-id-card-value">
                  {identityVerified ? 'IAL2 - Strong' : stats?.hasPendingIdentityVerification ? 'Submitted for review' : 'Not yet verified'}
                </span>
              </div>
              <div className="home-id-card-row">
                <span className="home-id-card-label">ID</span>
                <span className="home-id-card-value home-id-mono">
                  DID-{(user?.id || '000000').toString().padStart(6, '0')}
                </span>
              </div>
              {!identityVerified && (
                <button type="button" className="home-verify-cta" onClick={() => navigate('/verification')}>
                  {stats?.hasPendingIdentityVerification ? 'Check verification status' : 'Verify your identity'}
                </button>
              )}
            </div>
          </section>

          <section className="home-section">
            <h2 className="home-section-heading">Account Snapshot</h2>
            <div className="home-id-card">
              <div className="home-id-card-row">
                <span className="home-id-card-label">Credentials</span>
                <span className="home-id-card-value">{stats?.credentialCount ?? '—'}</span>
              </div>
              <div className="home-id-card-row">
                <span className="home-id-card-label">Connected Services</span>
                <span className="home-id-card-value">{stats?.serviceCount ?? '—'}</span>
              </div>
              <div className="home-id-card-row">
                <span className="home-id-card-label">Stored Documents</span>
                <span className="home-id-card-value">{stats?.docCount ?? '—'}</span>
              </div>
              <div className="home-id-card-row">
                <span className="home-id-card-label">Unread Notifications</span>
                <span className="home-id-card-value">{unreadNotifications}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {msgTarget && (
        <SendMessageModal
          title={msgTarget === 'admin' ? 'Message Admin' : 'Message Institution Admin'}
          onSend={handleSend}
          onClose={() => setMsgTarget(null)}
        />
      )}
    </div>
  );
}
