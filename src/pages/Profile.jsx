import './Profile.css';

export default function Profile({ user }) {
  const fields = [
    { label: 'Name', value: user?.name },
    { label: 'Username', value: user?.username },
    { label: 'Email', value: user?.email },
    { label: 'Phone', value: user?.phoneNo },
    { label: 'Date of birth', value: user?.dateOfBirth },
    { label: 'Gender', value: user?.gender },
    { label: 'Role', value: user?.role },
    { label: 'Status', value: user?.accountStatus, className: 'profile-status' },
    { label: 'Last login', value: user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : null },
  ];

  return (
    <div className="profile-page">
      <h2>Profile</h2>
      <div className="profile-card">
        <div className="profile-avatar">
          {(user?.name || user?.username || 'U')
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()}
        </div>
        <div className="profile-rows">
          {fields.map(
            (f) =>
              f.value != null && (
                <div className="profile-row" key={f.label}>
                  <span className="profile-label">{f.label}</span>
                  <span className={`profile-value ${f.className || ''}`}>{f.value}</span>
                </div>
              ),
          )}
        </div>
      </div>
    </div>
  );
}
