import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home({ user }) {
  const navigate = useNavigate();
  const verificationStatus = user?.accountStatus === 'ACTIVE' ? 'verified' : 'pending';
  const isVerified = verificationStatus === 'verified';

  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="home-hero-text">
          <h2>Welcome{user?.name ? `, ${user.name}` : ''}!</h2>
          <p className="home-greeting">
            Manage your digital identity, verify your credentials, and securely
            access services — all from one place.
          </p>
        </div>
        <div className={'home-id-badge ' + (isVerified ? 'verified' : 'pending')}>
          <span className="home-id-badge-icon">{isVerified ? '✓' : '○'}</span>
          <div>
            <span className="home-id-badge-label">Identity Status</span>
            <span className="home-id-badge-value">
              {isVerified ? 'Verified' : 'Pending Verification'}
            </span>
          </div>
        </div>
      </div>

      <div className="home-stats">
        <div className="home-stat-card">
          <span className="home-stat-icon">🛡️</span>
          <span className="home-stat-number">{isVerified ? '1' : '0'}</span>
          <span className="home-stat-label">Verified IDs</span>
        </div>
        <div className="home-stat-card">
          <span className="home-stat-icon">🔗</span>
          <span className="home-stat-number">0</span>
          <span className="home-stat-label">Connected Services</span>
        </div>
        <div className="home-stat-card">
          <span className="home-stat-icon">📋</span>
          <span className="home-stat-number">0</span>
          <span className="home-stat-label">Credentials</span>
        </div>
      </div>

      <h3 className="home-section-title">Quick Actions</h3>
      <div className="home-actions">
        <div className="home-action-card" onClick={() => navigate('/verify-identity')}>
          <div className="home-action-icon-wrap verify">
            <span>🪪</span>
          </div>
          <div className="home-action-text">
            <span className="home-action-title">Verify Identity</span>
            <span className="home-action-desc">
              Upload documents and verify your identity to unlock full access.
            </span>
          </div>
        </div>
        <div className="home-action-card" onClick={() => navigate('/credentials')}>
          <div className="home-action-icon-wrap credentials">
            <span>📄</span>
          </div>
          <div className="home-action-text">
            <span className="home-action-title">Manage Credentials</span>
            <span className="home-action-desc">
              View and manage your verified credentials and group affiliations.
            </span>
          </div>
        </div>
        <div className="home-action-card" onClick={() => navigate('/settings')}>
          <div className="home-action-icon-wrap security">
            <span>🔒</span>
          </div>
          <div className="home-action-text">
            <span className="home-action-title">Security Settings</span>
            <span className="home-action-desc">
              Set up multi-factor authentication and manage security preferences.
            </span>
          </div>
        </div>
        <div className="home-action-card" onClick={() => navigate('/services')}>
          <div className="home-action-icon-wrap services">
            <span>🌐</span>
          </div>
          <div className="home-action-text">
            <span className="home-action-title">Connected Services</span>
            <span className="home-action-desc">
              View government and commercial services connected to your identity.
            </span>
          </div>
        </div>
        <div className="home-action-card" onClick={() => navigate('/wallet')}>
          <div className="home-action-icon-wrap wallet">
            <span>💳</span>
          </div>
          <div className="home-action-text">
            <span className="home-action-title">Digital Wallet</span>
            <span className="home-action-desc">
              Access your digital ID cards and verified credentials on the go.
            </span>
          </div>
        </div>
        <div className="home-action-card" onClick={() => navigate('/documents')}>
          <div className="home-action-icon-wrap documents">
            <span>📁</span>
          </div>
          <div className="home-action-text">
            <span className="home-action-title">Documents</span>
            <span className="home-action-desc">
              Upload and manage your identity documents and certifications.
            </span>
          </div>
        </div>
      </div>

      <h3 className="home-section-title">Supported Verifications</h3>
      <div className="home-verifications">
        {[
          { icon: '🎖️', label: 'Military', desc: 'Active duty, veterans, and dependents' },
          { icon: '🎓', label: 'Students', desc: 'College and university students' },
          { icon: '🚒', label: 'First Responders', desc: 'EMT, firefighters, and police' },
          { icon: '👩‍🏫', label: 'Teachers', desc: 'K–12 and higher education educators' },
          { icon: '🏥', label: 'Healthcare', desc: 'Nurses, doctors, and medical staff' },
          { icon: '🏛️', label: 'Government', desc: 'Federal, state, and local employees' },
        ].map((v) => (
          <div key={v.label} className="home-verification-chip">
            <span className="home-verification-icon">{v.icon}</span>
            <div>
              <span className="home-verification-label">{v.label}</span>
              <span className="home-verification-desc">{v.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
