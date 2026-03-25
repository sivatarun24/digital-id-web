import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import { instAdminGetStats } from '../../../api/admin';
import {
  getInstMessages,
  markInstRead,
  deleteInstMessage,
  sendToAdmin,
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

function MessageModal({ msg, onClose, onDelete }) {
  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <p className="admin-modal-title" style={{ marginBottom: 8 }}>{msg.subject || '(No subject)'}</p>
        <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 14 }}>
          From: <span style={{ color: '#94a3b8' }}>{msg.from?.name || '—'}</span>
          {msg.from?.email && <> · <span style={{ color: '#64748b' }}>{msg.from.email}</span></>}
          <span style={{ float: 'right' }}>{timeAgo(msg.sentAt)}</span>
        </div>
        <div style={{
          background: '#0f1117', border: '1px solid #1e2a3a', borderRadius: 8,
          padding: '14px 16px', color: '#e2e8f0', fontSize: '0.84rem',
          lineHeight: 1.6, marginBottom: 20, whiteSpace: 'pre-wrap', minHeight: 80,
        }}>
          {msg.body || '(Empty message)'}
        </div>
        <div className="admin-modal-footer">
          <button className="btn btn-danger btn-sm" onClick={() => { onDelete(msg.id); onClose(); }}>Delete</button>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function SendToAdminModal({ onClose }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);

  function handleSend() {
    if (!body.trim()) return;
    sendToAdmin(subject.trim() || 'Message from Inst Admin', body.trim()).catch(() => {});
    setSent(true);
    setTimeout(onClose, 1200);
  }

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <p className="admin-modal-title">Message to Admin</p>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#4ade80', fontSize: '0.9rem' }}>
            Message sent successfully!
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 12 }}>
              <label className="admin-label">Subject</label>
              <input className="admin-input" style={{ width: '100%' }} placeholder="What is this about?"
                value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="admin-label">Message *</label>
              <textarea className="admin-input" style={{ width: '100%', resize: 'vertical', minHeight: 100 }}
                placeholder="Write your message…"
                value={body} onChange={e => setBody(e.target.value)} />
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSend} disabled={!body.trim()}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function InstAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [openMsg, setOpenMsg] = useState(null);
  const [showSendToAdmin, setShowSendToAdmin] = useState(false);

  function refreshMessages() {
    getInstMessages().then(setMessages).catch(() => {});
  }

  useEffect(() => {
    instAdminGetStats().then(setStats).catch(e => setError(e.message));
    refreshMessages();
  }, []);

  function openMessage(msg) {
    if (!msg.read) {
      markInstRead(msg.id).then(refreshMessages).catch(() => {});
    }
    setOpenMsg(msg);
  }

  function handleDelete(id) {
    deleteInstMessage(id).then(refreshMessages).catch(() => {});
  }

  const unreadCount = messages.filter(m => !m.read).length;

  const perms = stats?.permissions ?? {};

  const ALL_LINKS = [
    { to: '/inst-admin/users',         label: 'Members',       desc: 'View institution members',    enabled: perms.canViewUsers },
    { to: '/inst-admin/verifications', label: 'Verifications', desc: 'Review submissions',          enabled: perms.canViewVerifications, pending: stats?.pendingVerifications ?? 0 },
    { to: '/inst-admin/documents',     label: 'Documents',     desc: 'Review uploads',              enabled: perms.canViewDocuments, pending: stats?.pendingDocuments ?? 0 },
  ];
  const QUICK_LINKS = ALL_LINKS.filter(l => l.enabled);

  return (
    <AdminLayout variant="inst-admin">
      <div className="admin-page">
        <div className="admin-page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 className="admin-page-title">
              {stats?.institutionName || 'Institution Dashboard'}
            </h1>
            <p className="admin-page-subtitle">Overview of your institution</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowSendToAdmin(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
            </svg>
            Message Admin
          </button>
        </div>

        {error && <div className="admin-error">{error}</div>}
        {!stats && !error && <div className="admin-loading">Loading…</div>}

        {stats && (
          <>
            {/* Stats */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-label">Total Members</div>
                <div className="admin-stat-value blue">{stats.totalMembers}</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-label">Active</div>
                <div className="admin-stat-value green">{stats.activeMembers}</div>
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

            {/* Two-column: tasks + inbox */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16, alignItems: 'start' }}>

              {/* Quick links */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                  Tasks
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

                  {((perms.canViewVerifications && stats.pendingVerifications > 0) || (perms.canViewDocuments && stats.pendingDocuments > 0)) && (
                    <div style={{ background: '#3d2e00', border: '1px solid #78350f', borderRadius: 8, padding: '10px 14px', marginTop: 4 }}>
                      <div style={{ fontSize: '0.76rem', color: '#fbbf24', fontWeight: 600, marginBottom: 6 }}>Action Required</div>
                      {perms.canViewVerifications && stats.pendingVerifications > 0 && (
                        <Link to="/inst-admin/verifications" style={{ display: 'flex', justifyContent: 'space-between', textDecoration: 'none', color: '#fbbf24', fontSize: '0.78rem', marginBottom: 4 }}>
                          <span>Verifications pending</span>
                          <span style={{ fontWeight: 700 }}>{stats.pendingVerifications}</span>
                        </Link>
                      )}
                      {perms.canViewDocuments && stats.pendingDocuments > 0 && (
                        <Link to="/inst-admin/documents" style={{ display: 'flex', justifyContent: 'space-between', textDecoration: 'none', color: '#fbbf24', fontSize: '0.78rem' }}>
                          <span>Documents pending review</span>
                          <span style={{ fontWeight: 700 }}>{stats.pendingDocuments}</span>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Inbox — messages from institution members */}
              <div className="admin-table-wrap" style={{ minHeight: 200 }}>
                <div className="admin-table-toolbar" style={{ justifyContent: 'space-between' }}>
                  <span className="admin-table-toolbar-title">
                    Member Messages
                    {unreadCount > 0 && (
                      <span style={{ marginLeft: 8, background: '#dc2626', color: '#fff', borderRadius: 20, padding: '1px 7px', fontSize: '0.68rem', fontWeight: 700 }}>
                        {unreadCount}
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#475569' }}>{messages.length} total</span>
                </div>

                {messages.length === 0 ? (
                  <div className="admin-empty" style={{ padding: '32px 24px' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 8, opacity: 0.3 }}>✉</div>
                    No messages from members yet
                  </div>
                ) : (
                  <div>
                    {messages.slice(0, 8).map(msg => (
                      <div
                        key={msg.id}
                        onClick={() => openMessage(msg)}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 10,
                          padding: '10px 16px', borderBottom: '1px solid #0f1117',
                          cursor: 'pointer', background: msg.read ? 'transparent' : '#0d1b2e',
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
                          <div style={{ fontSize: '0.82rem', fontWeight: msg.read ? 400 : 600, color: msg.read ? '#94a3b8' : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                            {msg.from?.name || 'Unknown'}
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
          </>
        )}
      </div>

      {openMsg && (
        <MessageModal
          msg={openMsg}
          onClose={() => setOpenMsg(null)}
          onDelete={handleDelete}
        />
      )}

      {showSendToAdmin && (
        <SendToAdminModal
          onClose={() => setShowSendToAdmin(false)}
        />
      )}
    </AdminLayout>
  );
}
