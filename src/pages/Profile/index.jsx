import useAuth from '../../hooks/useAuth';
import './Profile.css';

const Icon = {
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Circle: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  Clipboard: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
    </svg>
  ),
};

export default function Profile() {
  const { user } = useAuth();
  const isVerified = user?.accountStatus === 'ACTIVE';

  const personalFields = [
    { label: 'Full Name', value: user?.name },
    { label: 'Username', value: user?.username },
    { label: 'Email', value: user?.email },
    { label: 'Phone', value: user?.phoneNo },
    { label: 'Date of Birth', value: user?.dateOfBirth },
    { label: 'Gender', value: user?.gender },
  ];

  const accountFields = [
    { label: 'Role', value: user?.role },
    {
      label: 'Account Status',
      value: user?.accountStatus,
      className: 'profile-status',
    },
    {
      label: 'Last Sign In',
      value: user?.lastLoginAt
        ? new Date(user.lastLoginAt).toLocaleString()
        : null,
    },
  ];

  return (
    <div className="profile-page">
      <h2>My Identity</h2>

      <div className="profile-card">
        <div className="profile-card-header">
          <div className="profile-avatar">
            {(user?.name || user?.username || 'U')
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </div>
          <div className="profile-header-info">
            <span className="profile-header-name">{user?.name || user?.username}</span>
            <span className="profile-header-email">{user?.email}</span>
          </div>
          <div className={'profile-verification-badge ' + (isVerified ? 'verified' : 'pending')}>
            <span className="profile-badge-icon">
              {isVerified ? <Icon.Check /> : <Icon.Circle />}
            </span>
            <span>{isVerified ? 'Verified' : 'Unverified'}</span>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">Personal Information</h3>
        <div className="profile-card">
          <div className="profile-rows">
            {personalFields.map(
              (f) =>
                f.value != null && (
                  <div className="profile-row" key={f.label}>
                    <span className="profile-label">{f.label}</span>
                    <span className={'profile-value ' + (f.className || '')}>
                      {f.value}
                    </span>
                  </div>
                ),
            )}
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">Account Details</h3>
        <div className="profile-card">
          <div className="profile-rows">
            {accountFields.map(
              (f) =>
                f.value != null && (
                  <div className="profile-row" key={f.label}>
                    <span className="profile-label">{f.label}</span>
                    <span className={'profile-value ' + (f.className || '')}>
                      {f.value}
                    </span>
                  </div>
                ),
            )}
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">Verified Credentials</h3>
        <div className="profile-card">
          <div className="profile-empty-state">
            <span className="profile-empty-icon"><Icon.Clipboard /></span>
            <p>No verified credentials yet.</p>
            <span className="profile-empty-hint">
              Complete identity verification to unlock credentials like military,
              student, first responder, and more.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
