import './Wallet.css';

export default function Wallet({ user }) {
  const isVerified = user?.accountStatus === 'ACTIVE';
  const initials = (user?.name || user?.username || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const cards = [
    {
      id: 'digital_id',
      type: 'Digital ID Card',
      gradient: 'linear-gradient(135deg, #6366f1, #4f46e5, #3730a3)',
      logo: '🛡️',
      fields: [
        { label: 'Name', value: user?.name || '—' },
        { label: 'ID Number', value: 'DID-' + (user?.id || '000000').toString().padStart(6, '0') },
        { label: 'Status', value: isVerified ? 'Verified' : 'Pending', highlight: isVerified },
      ],
      active: true,
    },
    {
      id: 'military',
      type: 'Military Affiliation',
      gradient: 'linear-gradient(135deg, #059669, #047857, #065f46)',
      logo: '🎖️',
      fields: [
        { label: 'Branch', value: 'Not verified' },
        { label: 'Status', value: 'Unverified' },
      ],
      active: false,
    },
    {
      id: 'student',
      type: 'Student Credential',
      gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8, #1e40af)',
      logo: '🎓',
      fields: [
        { label: 'Institution', value: 'Not verified' },
        { label: 'Status', value: 'Unverified' },
      ],
      active: false,
    },
    {
      id: 'first_responder',
      type: 'First Responder',
      gradient: 'linear-gradient(135deg, #dc2626, #b91c1c, #991b1b)',
      logo: '🚒',
      fields: [
        { label: 'Department', value: 'Not verified' },
        { label: 'Status', value: 'Unverified' },
      ],
      active: false,
    },
  ];

  return (
    <div className="wallet-page">
      <div className="wallet-header">
        <h2>Digital Wallet</h2>
        <p className="wallet-subtitle">
          Your verified credentials and digital ID cards — accessible anywhere, anytime.
        </p>
      </div>

      <div className="wallet-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className={'wallet-card' + (card.active ? '' : ' inactive')}
          >
            <div className="wallet-card-face" style={{ background: card.gradient }}>
              <div className="wallet-card-header">
                <span className="wallet-card-logo">{card.logo}</span>
                <span className="wallet-card-type">{card.type}</span>
              </div>

              {card.active && (
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
                <div className="wallet-card-overlay">
                  <span>Not Yet Verified</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="wallet-section">
        <h3 className="wallet-section-title">Wallet Features</h3>
        <div className="wallet-features">
          <div className="wallet-feature">
            <span className="wallet-feature-icon">📲</span>
            <div>
              <span className="wallet-feature-title">Instant Verification</span>
              <span className="wallet-feature-desc">
                Share your verified status with one tap at supported retailers.
              </span>
            </div>
          </div>
          <div className="wallet-feature">
            <span className="wallet-feature-icon">🔐</span>
            <div>
              <span className="wallet-feature-title">Privacy Controls</span>
              <span className="wallet-feature-desc">
                Choose exactly what information to share — only what's needed.
              </span>
            </div>
          </div>
          <div className="wallet-feature">
            <span className="wallet-feature-icon">🌐</span>
            <div>
              <span className="wallet-feature-title">Works Everywhere</span>
              <span className="wallet-feature-desc">
                Accepted at 500+ online retailers, government agencies, and apps.
              </span>
            </div>
          </div>
          <div className="wallet-feature">
            <span className="wallet-feature-icon">🔄</span>
            <div>
              <span className="wallet-feature-title">Auto-Renewal</span>
              <span className="wallet-feature-desc">
                Credentials are automatically re-verified when they approach expiry.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
