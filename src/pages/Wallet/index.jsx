import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { fetchWallet } from '../../api/home';
import { fetchCredentials } from '../../api/credentials';
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
  X:         () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
};

const CRED_CARD_CONFIG = {
  military:       { type: 'Military Affiliation',    gradient: 'linear-gradient(135deg, #059669, #047857, #065f46)', CardIcon: Icon.Award },
  student:        { type: 'Student Credential',      gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8, #1e40af)', CardIcon: Icon.Book },
  first_responder:{ type: 'First Responder',         gradient: 'linear-gradient(135deg, #dc2626, #b91c1c, #991b1b)', CardIcon: Icon.Zap },
  teacher:        { type: 'Teacher',                 gradient: 'linear-gradient(135deg, #d97706, #b45309, #92400e)', CardIcon: Icon.Book },
  healthcare:     { type: 'Healthcare Worker',       gradient: 'linear-gradient(135deg, #0891b2, #0e7490, #155e75)', CardIcon: Icon.Award },
  government:     { type: 'Government Employee',     gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9, #5b21b6)', CardIcon: Icon.Shield },
  senior:         { type: 'Senior',                  gradient: 'linear-gradient(135deg, #475569, #334155, #1e293b)', CardIcon: Icon.User },
  nonprofit:      { type: 'Nonprofit Worker',        gradient: 'linear-gradient(135deg, #0d9488, #0f766e, #115e59)', CardIcon: Icon.Award },
};

const CRED_FIELD_LABELS = {
  branch:           'Branch of Service',
  rank:             'Rank / Rate',
  serviceStartDate: 'Service Start Date',
  serviceEndDate:   'Separation Date',
  dischargeType:    'Discharge Type',
  currentlyServing: 'Currently Serving',
  schoolName:       'School / University',
  enrollmentStatus: 'Enrollment Status',
  major:            'Major / Field of Study',
  studentId:        'Student ID',
  graduationDate:   'Expected Graduation',
  agencyName:       'Agency / Department',
  role:             'Role',
  badgeNumber:      'Badge / ID Number',
  teachingLevel:    'Teaching Level',
  employer:         'Employer',
  subject:          'Subject / Grade Level',
  licenseNumber:    'License Number',
  issuingState:     'Issuing State',
  employeeId:       'Employee ID',
  position:         'Position',
  level:            'Government Level',
  dateOfBirth:      'Date of Birth',
  orgName:          'Organization',
  ein:              'EIN',
  orgType:          'Organization Type',
  employmentStartDate:'Employment Start Date',
};

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusPill(status) {
  const s = (status || '').toLowerCase();
  const color = s === 'verified' ? '#4ade80' : s === 'rejected' ? '#f87171' : '#fbbf24';
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: '0.75rem',
      fontWeight: 700,
      background: color + '22',
      color,
      border: `1px solid ${color}44`,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    }}>
      {status}
    </span>
  );
}

function buildFieldRows(fields = {}) {
  return Object.entries(fields)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => ({
      key: k,
      label: CRED_FIELD_LABELS[k] || k.replace(/([A-Z])/g, ' $1').trim(),
      value: typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v),
    }));
}

function buildCardPersonalization(cardId, detail) {
  const fields = detail?.fields || {};
  const map = {
    military: [fields.branch, fields.rank].filter(Boolean),
    student: [fields.schoolName, fields.enrollmentStatus].filter(Boolean),
    first_responder: [fields.agencyName, fields.role].filter(Boolean),
    teacher: [fields.schoolName, fields.teachingLevel].filter(Boolean),
    healthcare: [fields.licenseType, fields.employer].filter(Boolean),
    government: [fields.agencyName, fields.position].filter(Boolean),
    senior: [fields.dateOfBirth].filter(Boolean),
    nonprofit: [fields.orgName, fields.position].filter(Boolean),
  };
  const values = map[cardId] || [];
  return {
    headline: values[0] || 'Verified Holder',
    subline: values[1] || detail?.documentName || 'Tap to flip',
  };
}

function CredentialDetailModal({ card, credDetail, onClose }) {
  const config = CRED_CARD_CONFIG[card.id] || {};

  // Build field rows from credDetail.fields (API-returned object) or card fields
  const fieldRows = [];
  if (credDetail?.fields) {
    Object.entries(credDetail.fields).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '') return;
      const label = CRED_FIELD_LABELS[k] || k.replace(/([A-Z])/g, ' $1').trim();
      const display = typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v);
      fieldRows.push({ label, value: display });
    });
  }

  const status = credDetail?.status || card.fields.find(f => f.label === 'Status')?.value || '—';
  const startedAt = credDetail?.startedAt || card.fields.find(f => f.label === 'Since')?.value;
  const reviewedAt = credDetail?.reviewedAt;
  const reviewNotes = credDetail?.reviewerNotes;

  return (
    <div className="wallet-detail-backdrop" onClick={onClose}>
      <div className="wallet-detail-modal" onClick={e => e.stopPropagation()}>
        {/* Card mini-preview header */}
        <div className="wallet-detail-top" style={{ background: config.gradient || 'linear-gradient(135deg,#374151,#1f2937)' }}>
          <span className="wallet-detail-icon">
            {config.CardIcon ? <config.CardIcon /> : <Icon.Award />}
          </span>
          <div className="wallet-detail-heading">
            <div className="wallet-detail-title">{config.type || card.type}</div>
            <div style={{ marginTop: 4 }}>{statusPill(status)}</div>
          </div>
          <button onClick={onClose} className="wallet-detail-close">
            <Icon.X />
          </button>
        </div>

        {/* Body */}
        <div className="wallet-detail-body">
          {/* Timestamps */}
          <div className="wallet-detail-meta">
            {startedAt && (
              <div>
                <div className="wallet-detail-kicker">Submitted</div>
                <div className="wallet-detail-meta-value">{fmtDate(startedAt)}</div>
              </div>
            )}
            {reviewedAt && (
              <div>
                <div className="wallet-detail-kicker">Reviewed</div>
                <div className="wallet-detail-meta-value">{fmtDate(reviewedAt)}</div>
              </div>
            )}
          </div>

          {fieldRows.length > 0 && (
            <>
              <div className="wallet-detail-kicker" style={{ marginBottom: 12 }}>Submitted Information</div>
              <div className="wallet-detail-fields">
                {fieldRows.map(row => (
                  <div key={row.label} className="wallet-detail-field">
                    <span className="wallet-detail-field-label">{row.label}</span>
                    <span className="wallet-detail-field-value">{row.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {reviewNotes && (
            <div className="wallet-review-note">
              <div className="wallet-detail-kicker" style={{ color: '#fbbf24', marginBottom: 6 }}>Reviewer Note</div>
              <div className="wallet-review-note-text">{reviewNotes}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="wallet-detail-footer">
          <button onClick={onClose} className="wallet-detail-footer-btn">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function Wallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [credDetails, setCredDetails] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [expandedCardId, setExpandedCardId] = useState(null);

  useEffect(() => {
    fetchWallet()
      .then(setWallet)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCredentials()
      .then(data => setCredDetails(Array.isArray(data) ? data : []))
      .catch(() => {});
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
    clickable: false,
  };

  const credentialCards = credentials.map((c) => {
    const config = CRED_CARD_CONFIG[c.credentialType] || { type: c.credentialType, gradient: 'linear-gradient(135deg,#374151,#1f2937)', CardIcon: Icon.Award };
    const detail = credDetails.find(d => d.credentialType === c.credentialType);
    const personalization = buildCardPersonalization(c.credentialType, detail);
    const detailRows = buildFieldRows(detail?.fields).slice(0, 3);
    return {
      id: c.credentialType,
      type: config.type,
      gradient: config.gradient,
      CardIcon: config.CardIcon,
      fields: [
        { label: 'Status', value: c.status.charAt(0).toUpperCase() + c.status.slice(1), highlight: c.status === 'verified' },
        { label: 'Since', value: c.startedAt || '—' },
      ],
      personalization,
      detailRows,
      detail,
      active: c.status === 'verified',
      clickable: true,
    };
  });

  const allCards = [digitalIdCard, ...credentialCards];

  function handleCardClick(card) {
    if (!card.clickable) return;
    setExpandedCardId((prev) => prev === card.id ? null : card.id);
  }

  function openCardDetail(card, event) {
    event?.stopPropagation();
    const detail = credDetails.find(d => d.credentialType === card.id);
    setSelectedCard({ card, detail: detail || null });
  }

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
          {allCards.map((card) => {
            const isExpanded = expandedCardId === card.id;
            return (
              <div key={card.id} className="wallet-card-wrap">
                <div
                  className={'wallet-card-face' + (card.active ? '' : ' inactive') + (card.clickable ? ' clickable' : '')}
                  style={{ background: card.gradient }}
                  onClick={() => handleCardClick(card)}
                  title={card.clickable ? 'Click to expand details' : undefined}
                >
                  <div className="wallet-card-header">
                    <span className="wallet-card-logo"><card.CardIcon /></span>
                    <span className="wallet-card-type">{card.type}</span>
                    {card.clickable && (
                      <span className="wallet-card-expand-hint">{isExpanded ? '↑' : '↓'}</span>
                    )}
                  </div>
                  {card.id === 'digital_id' && (
                    <div className="wallet-card-avatar">{initials}</div>
                  )}
                  {card.personalization && (
                    <div className="wallet-card-persona">
                      <div className="wallet-card-persona-title">{card.personalization.headline}</div>
                      <div className="wallet-card-persona-sub">{card.personalization.subline}</div>
                    </div>
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

                {card.clickable && (
                  <div className={'wallet-card-panel' + (isExpanded ? ' open' : '')}>
                    <div className="wallet-card-panel-rows">
                      {(card.detailRows?.length
                        ? card.detailRows
                        : [{ label: 'Status', value: 'No details yet' }]
                      ).map((row) => (
                        <div key={row.label} className="wallet-panel-row">
                          <span className="wallet-panel-label">{row.label}</span>
                          <span className="wallet-panel-value">{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="wallet-panel-detail-btn"
                      onClick={(e) => openCardDetail(card, e)}
                    >
                      View full details
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
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

      {selectedCard && (
        <CredentialDetailModal
          card={selectedCard.card}
          credDetail={selectedCard.detail}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}
