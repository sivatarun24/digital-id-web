import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import { adminGetStats } from '../../../api/admin';
import {
  getAdminMessages,
  markAdminRead,
  deleteAdminMessage,
} from '../../../api/messages';

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function rolePill(role) {
  const map = {
    USER:       { bg: '#1e2a3a', color: '#94a3b8', label: 'User' },
    INST_ADMIN: { bg: '#2d1b69', color: '#a78bfa', label: 'Inst Admin' },
    ADMIN:      { bg: '#1e3a5f', color: '#60a5fa', label: 'Admin' },
  };
  const s = map[role] || map.USER;
  return (
    <span className="badge" style={{ background: s.bg, color: s.color, fontSize: '0.65rem' }}>
      {s.label}
    </span>
  );
}

function MessageModal({ msg, onClose, onDelete }) {
  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <p className="admin-modal-title" style={{ margin: 0 }}>{msg.subject || '(No subject)'}</p>
          {rolePill(msg.from?.role)}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 14 }}>
          From: <span style={{ color: '#94a3b8' }}>{msg.from?.name || '—'}</span>
          {msg.from?.email && <> · <span style={{ color: '#64748b' }}>{msg.from.email}</span></>}
          <span style={{ float: 'right' }}>{timeAgo(msg.sentAt)}</span>
        </div>
        <div style={{
          background: '#0f1117',
          border: '1px solid #1e2a3a',
          borderRadius: 8,
          padding: '14px 16px',
          color: '#e2e8f0',
          fontSize: '0.84rem',
          lineHeight: 1.6,
          marginBottom: 20,
          whiteSpace: 'pre-wrap',
          minHeight: 80,
        }}>
          {msg.body || '(Empty message)'}
        </div>
        <div className="admin-modal-footer">
          <button className="btn btn-danger btn-sm" onClick={() => { onDelete(msg.id); onClose(); }}>
            Delete
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [openMsg, setOpenMsg] = useState(null);

  function refreshMessages() {
    getAdminMessages().then(setMessages).catch(() => {});
  }

  useEffect(() => {
    adminGetStats()
      .then(setStats)
      .catch(e => setError(e.message));
    refreshMessages();
  }, []);

  function openMessage(msg) {
    if (!msg.read) {
      markAdminRead(msg.id).then(refreshMessages).catch(() => {});
    }
    setOpenMsg(msg);
  }

  function handleDelete(id) {
    deleteAdminMessage(id).then(refreshMessages).catch(() => {});
  }

  const unreadCount = messages.filter(m => !m.read).length;

  const QUICK_LINKS = [
    { to: '/admin/users',         label: 'Users',         desc: 'Manage accounts' },
    { to: '/admin/verifications', label: 'Verifications', desc: 'Review submissions', pending: stats?.pendingVerifications ?? 0 },
    { to: '/admin/documents',     label: 'Documents',     desc: 'Review uploads', pending: stats?.pendingDocuments ?? 0 },
    { to: '/admin/institutions',  label: 'Institutions',  desc: 'Manage institutions' },
  ];

  return (
    <AdminLayout variant="admin">
      <div className="admin-page">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Overview</h1>
          <p className="admin-page-subtitle">Platform stats, pending tasks, and inbox</p>
        </div>

        {error && <div className="admin-error">{error}</div>}

        {/* Stats */}
        {!stats && !error && <div className="admin-loading">Loading stats…</div>}
        {stats && (
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-label">Total Users</div>
              <div className="admin-stat-value blue">{stats.totalUsers}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Active</div>
              <div className="admin-stat-value green">{stats.activeUsers}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Institutions</div>
              <div className="admin-stat-value">{stats.totalInstitutions}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Pending Verif.</div>
              <div className="admin-stat-value yellow">{stats.pendingVerifications}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Pending Docs</div>
              <div className="admin-stat-value yellow">{stats.pendingDocuments}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Messages</div>
              <div className="admin-stat-value" style={{ color: unreadCount > 0 ? '#f87171' : '#e2e8f0' }}>
                {messages.length}
                {unreadCount > 0 && (
                  <span style={{ fontSize: '0.8rem', color: '#f87171', marginLeft: 6, fontWeight: 600 }}>
                    ({unreadCount} new)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Two-column layout: tasks + messages */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16, alignItems: 'start' }}>

          {/* Quick links */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Admin Tasks
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {QUICK_LINKS.map(item => (
                <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
                  <div
                    className="admin-detail-card"
                    style={{
                      cursor: 'pointer',
                      padding: '12px 16px',
                      marginBottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderColor: item.pending > 0 ? '#78350f' : '#1e2a3a',
                      background: item.pending > 0 ? 'linear-gradient(135deg, rgba(120,53,15,0.28), rgba(15,17,23,0.96))' : undefined,
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = item.pending > 0 ? '#78350f' : '#1e2a3a'}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.88rem' }}>{item.label}</div>
                        {item.pending > 0 && (
                          <span className="badge badge-pending">{item.pending} pending</span>
                        )}
                      </div>
                      <div style={{ color: item.pending > 0 ? '#fbbf24' : '#64748b', fontSize: '0.76rem', marginTop: 2 }}>
                        {item.pending > 0 ? `${item.desc} and clear the queue` : item.desc}
                      </div>
                    </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={item.pending > 0 ? '#fbbf24' : '#475569'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}

              {/* Pending task callouts */}
              {stats && (stats.pendingVerifications > 0 || stats.pendingDocuments > 0) && (
                <div style={{ background: '#3d2e00', border: '1px solid #78350f', borderRadius: 8, padding: '10px 14px', marginTop: 4 }}>
                  <div style={{ fontSize: '0.76rem', color: '#fbbf24', fontWeight: 600, marginBottom: 6 }}>
                    Action Required
                  </div>
                  {stats.pendingVerifications > 0 && (
                    <Link to="/admin/verifications" style={{ display: 'flex', justifyContent: 'space-between', textDecoration: 'none', color: '#fbbf24', fontSize: '0.78rem', marginBottom: 4 }}>
                      <span>Identity verifications pending</span>
                      <span style={{ fontWeight: 700 }}>{stats.pendingVerifications}</span>
                    </Link>
                  )}
                  {stats.pendingDocuments > 0 && (
                    <Link to="/admin/documents" style={{ display: 'flex', justifyContent: 'space-between', textDecoration: 'none', color: '#fbbf24', fontSize: '0.78rem' }}>
                      <span>Documents pending review</span>
                      <span style={{ fontWeight: 700 }}>{stats.pendingDocuments}</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Inbox */}
          <div className="admin-table-wrap" style={{ minHeight: 200 }}>
            <div className="admin-table-toolbar" style={{ justifyContent: 'space-between' }}>
              <span className="admin-table-toolbar-title">
                Inbox
                {unreadCount > 0 && (
                  <span style={{ marginLeft: 8, background: '#dc2626', color: '#fff', borderRadius: 20, padding: '1px 7px', fontSize: '0.68rem', fontWeight: 700 }}>
                    {unreadCount}
                  </span>
                )}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#475569' }}>{messages.length} message{messages.length !== 1 ? 's' : ''}</span>
            </div>

            {messages.length === 0 ? (
              <div className="admin-empty" style={{ padding: '32px 24px' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8, opacity: 0.3 }}>✉</div>
                No messages yet
              </div>
            ) : (
              <div>
                {messages.slice(0, 8).map(msg => (
                  <div
                    key={msg.id}
                    onClick={() => openMessage(msg)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '10px 16px',
                      borderBottom: '1px solid #0f1117',
                      cursor: 'pointer',
                      background: msg.read ? 'transparent' : '#0d1b2e',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1e2a3a'}
                    onMouseLeave={e => e.currentTarget.style.background = msg.read ? 'transparent' : '#0d1b2e'}
                  >
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                      background: msg.read ? '#1e2a3a' : '#60a5fa',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: msg.read ? 400 : 600, color: msg.read ? '#94a3b8' : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {msg.from?.name || 'Unknown'}
                        </span>
                        {rolePill(msg.from?.role)}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: msg.read ? '#475569' : '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {msg.subject || '(No subject)'}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#475569', flexShrink: 0, marginTop: 2 }}>
                      {timeAgo(msg.sentAt)}
                    </div>
                  </div>
                ))}
                {messages.length > 8 && (
                  <div style={{ textAlign: 'center', padding: '10px', fontSize: '0.75rem', color: '#475569' }}>
                    +{messages.length - 8} older messages
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {openMsg && (
        <MessageModal
          msg={openMsg}
          onClose={() => setOpenMsg(null)}
          onDelete={handleDelete}
        />
      )}
    </AdminLayout>
  );
}
