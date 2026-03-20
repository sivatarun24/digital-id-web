import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { fetchWallet } from '../../api/dashboard';
import './Wallet.css';

const Icon = {
  Shield:    () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>),
  Award:     () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>),
  Book:      () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>),
  Zap:       () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>),
  ZapFeature:() => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>),
  Lock:      () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>),
  Globe:     () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>),
  RefreshCw: () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>),
  User:      () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5" /><path d="M3 21v-2a7 7 0 0 1 14 0v2" /></svg>),
};

const CRED_CARD_CONFIG = {
  military:       { type: 'Military Affiliation',    gradient: 'linear-gradient(135deg, #059669, #047857, #065f46)', CardIcon: Icon.Award },
  student:        { type: 'Student Credential',      gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8, #1e40af)', CardIcon: Icon.Book },
  first_responder:{ type: 'First Responder',         gradient: 'linear-gradient(135deg, #dc2626, #b91c1c, #991b1b)', CardIcon: Icon.Zap },
  teacher:        { type: 'Teacher',                 gradient: 'linear-gradient(135deg, #d97706, #b45309, #92400e)', CardIcon: Icon.Book },
  healthcare:     { type: 'Healthcare Worker',       gradient: 'linear-gradient(135deg, #0891b2, #0e7490, #155e75)', CardIcon: Icon.Award },
  government:     { type: 'Government Employee',     gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9, #5b21b6)', CardIcon: Icon.Shield },
  senior:         { type: 'Senior',                  gradient: 'linear-gradient(135deg, #475569, #334155, #1e293b)', CardIcon: Icon.User },
};

export default function Wallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallet()
      .then(setWallet)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const initials = (user?.name || user?.username || 'U')
    .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const identityVerified = wallet?.identityVerified ?? false;
  const credentials = wallet?.credentials ?? [];
  const name = wallet?.name || user?.name || user?.username || '—';
  const userId = wallet?.userId || user?.id;

  const digitalIdCard = {
    id: 'digital_id',
    type: 'Digital ID Card',
    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5, #3730a3)',
    CardIcon: Icon.Shield,
    fields: [
      { label: 'Name', value: name },
      { label: 'ID Number', value: 'DID-' + (userId || '000000').toString().padStart(6, '0') },
      { label: 'Status', value: identityVerified ? 'Verified' : 'Pending', highlight: identityVerified },
    ],
    active: true,
  };

  const credentialCards = credentials.map((c) => {
    const config = CRED_CARD_CONFIG[c.credentialType] || { type: c.credentialType, gradient: 'linear-gradient(135deg,#374151,#1f2937)', CardIcon: Icon.Award };
    return {
      id: c.credentialType,
      type: config.type,
      gradient: config.gradient,
      CardIcon: config.CardIcon,
      fields: [
        { label: 'Status', value: c.status.charAt(0).toUpperCase() + c.status.slice(1), highlight: c.status === 'verified' },
        { label: 'Since', value: c.startedAt || '—' },
      ],
      active: c.status === 'verified',
    };
  });

  const allCards = [digitalIdCard, ...credentialCards];

  return (
    <div className="wallet-page">
      <div className="wallet-header">
        <h2>Digital Wallet</h2>
        <p className="wallet-subtitle">
          Your verified credentials and digital ID cards — accessible anywhere, anytime.
        </p>
      </div>

      {loading ? (
        <div className="wallet-loading"><div className="wallet-spinner" /><span>Loading wallet…</span></div>
      ) : (
        <div className="wallet-grid">
          {allCards.map((card) => (
            <div key={card.id} className={'wallet-card' + (card.active ? '' : ' inactive')}>
              <div className="wallet-card-face" style={{ background: card.gradient }}>
                <div className="wallet-card-header">
                  <span className="wallet-card-logo"><card.CardIcon /></span>
                  <span className="wallet-card-type">{card.type}</span>
                </div>
                {card.id === 'digital_id' && (
                  <div className="wallet-card-avatar">{initials}</div>
                )}
                <div className="wallet-card-fields">
                  {card.fields.map((f) => (
                    <div key={f.label} className="wallet-card-field">
                      <span className="wallet-card-field-label">{f.label}</span>
                      <span className={'wallet-card-field-value' + (f.highlight ? ' highlight' : '')}>
                        {f.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="wallet-card-footer">
                  <span className="wallet-card-brand">Digital ID</span>
                  {card.active && <span className="wallet-card-chip">◇</span>}
                </div>
                {!card.active && (
                  <div className="wallet-card-overlay"><span>Not Yet Verified</span></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="wallet-section">
        <h3 className="wallet-section-title">Wallet Features</h3>
        <div className="wallet-features">
          <div className="wallet-feature">
            <span className="wallet-feature-icon"><Icon.ZapFeature /></span>
            <div>
              <span className="wallet-feature-title">Instant Verification</span>
              <span className="wallet-feature-desc">Share your verified status with one tap at supported retailers.</span>
            </div>
          </div>
          <div className="wallet-feature">
            <span className="wallet-feature-icon"><Icon.Lock /></span>
            <div>
              <span className="wallet-feature-title">Privacy Controls</span>
              <span className="wallet-feature-desc">Choose exactly what information to share — only what's needed.</span>
            </div>
          </div>
          <div className="wallet-feature">
            <span className="wallet-feature-icon"><Icon.Globe /></span>
            <div>
              <span className="wallet-feature-title">Works Everywhere</span>
              <span className="wallet-feature-desc">Accepted at 500+ online retailers, government agencies, and apps.</span>
            </div>
          </div>
          <div className="wallet-feature">
            <span className="wallet-feature-icon"><Icon.RefreshCw /></span>
            <div>
              <span className="wallet-feature-title">Auto-Renewal</span>
              <span className="wallet-feature-desc">Credentials are automatically re-verified when they approach expiry.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
