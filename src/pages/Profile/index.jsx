import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { updateProfile } from '../../api/auth';
import Skeleton from '../../components/common/Skeleton';
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
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
};

const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'];

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const isVerified = user?.accountStatus === 'ACTIVE';

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  function startEditing() {
    setEditName(user?.name || '');
    setEditDob(user?.dateOfBirth || '');
    setEditGender(user?.gender || '');
    setEditError('');
    setEditSuccess('');
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setEditError('');
    setEditSuccess('');
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!editName.trim()) {
      setEditError('Full name is required.');
      return;
    }
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    try {
      const payload = {
        name: editName.trim(),
        dateOfBirth: editDob || null,
        gender: editGender || null,
      };
      await updateProfile(payload);
      await refreshUser();
      setEditSuccess('Profile updated successfully.');
      setEditing(false);
    } catch (err) {
      setEditError(err.message || 'Something went wrong');
    } finally {
      setEditLoading(false);
    }
  }

  function formatFieldValue(label, value) {
    if (value == null || value === '') return 'Not provided';
    if (label === 'Gender') return String(value).replace(/_/g, ' ');
    return value;
  }

  const personalFields = [
    { label: 'Full Name', value: user?.name, editable: true },
    { label: 'Username', value: user?.username, editable: false },
    { label: 'Email', value: user?.email, editable: false },
    { label: 'Phone', value: user?.phoneNo, editable: false },
    { label: 'Date of Birth', value: user?.dateOfBirth, editable: true },
    { label: 'Gender', value: user?.gender, editable: true },
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

  if (!user) {
    return (
      <div className="profile-page">
        <h2>My Identity</h2>
        <div className="profile-card">
          <div className="profile-card-header">
            <Skeleton variant="circle" width={56} height={56} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Skeleton width="40%" height={18} />
              <Skeleton width="55%" height={14} />
            </div>
          </div>
          <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton width="30%" height={13} />
                <Skeleton width="45%" height={13} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
        <div className="profile-section-header">
          <h3 className="profile-section-title">Personal Information</h3>
          <button type="button" className="profile-edit-btn" onClick={startEditing}>
            <Icon.Edit /> Edit
          </button>
        </div>

        {editSuccess && (
          <p className="profile-success-msg">{editSuccess}</p>
        )}

        <div className="profile-card">
          <div className="profile-rows">
            {personalFields.map((f) => (
              <div className="profile-row" key={f.label}>
                <span className="profile-label">{f.label}</span>
                <div className="profile-value-group">
                  <span
                    className={
                      'profile-value ' +
                      (f.className || '') +
                      ' ' +
                      (f.editable ? 'profile-value-editable' : 'profile-value-readonly')
                    }
                  >
                    {formatFieldValue(f.label, f.value)}
                  </span>
                </div>
              </div>
            ))}
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

      {editing && (
        <div className="profile-modal-backdrop" onClick={cancelEditing}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <div>
                <h3 className="profile-modal-title">Edit Profile</h3>
                <p className="profile-modal-subtitle">
                  Update the fields you can manage here: full name, date of birth, and gender.
                </p>
              </div>
              <button
                type="button"
                className="profile-modal-close"
                onClick={cancelEditing}
                disabled={editLoading}
                aria-label="Close edit profile modal"
              >
                ×
              </button>
            </div>

            <form className="profile-edit-form" onSubmit={handleSave}>
              <div className="profile-edit-field">
                <label htmlFor="edit-name">Full Name</label>
                <input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="profile-edit-field">
                <label htmlFor="edit-dob">Date of Birth</label>
                <input
                  id="edit-dob"
                  type="date"
                  value={editDob}
                  onChange={(e) => setEditDob(e.target.value)}
                />
              </div>
              <div className="profile-edit-field">
                <label htmlFor="edit-gender">Gender</label>
                <select
                  id="edit-gender"
                  value={editGender}
                  onChange={(e) => setEditGender(e.target.value)}
                >
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              {editError && <p className="profile-edit-error">{editError}</p>}
              <div className="profile-edit-actions">
                <button type="submit" className="profile-edit-save" disabled={editLoading}>
                  {editLoading ? 'Saving…' : 'Save changes'}
                </button>
                <button type="button" className="profile-edit-cancel" onClick={cancelEditing} disabled={editLoading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
