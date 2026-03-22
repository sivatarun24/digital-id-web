import { useState, useEffect, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import { fetchCredentials, startCredentialVerification, submitCredentialDocument } from '../../api/credentials';
import './Credentials.css';

const Icon = {
  Military:      () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>),
  Student:       () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>),
  FirstResponder:() => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="10" y1="10" x2="14" y2="10" /></svg>),
  Teacher:       () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>),
  Healthcare:    () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>),
  Government:    () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14" /><path d="M9 21v-4h6v4" /></svg>),
  Senior:        () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4" /><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /></svg>),
  Nonprofit:     () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>),
  Warning:       () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>),
  Chevron:       () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>),
};

const CREDENTIAL_CATEGORIES = [
  { id: 'military',       Icon: Icon.Military,       label: 'Military',          desc: 'Active duty, veterans, reservists, and military dependents', status: 'available' },
  { id: 'student',        Icon: Icon.Student,        label: 'Student',           desc: 'Currently enrolled college or university students',          status: 'available' },
  { id: 'first_responder',Icon: Icon.FirstResponder, label: 'First Responder',   desc: 'EMTs, firefighters, law enforcement, and 911 dispatchers',   status: 'available' },
  { id: 'teacher',        Icon: Icon.Teacher,        label: 'Teacher',           desc: 'K–12 educators and higher education faculty',               status: 'available' },
  { id: 'healthcare',     Icon: Icon.Healthcare,     label: 'Healthcare Worker', desc: 'Nurses, doctors, pharmacists, and medical staff',           status: 'available' },
  { id: 'government',     Icon: Icon.Government,     label: 'Government Employee',desc:'Federal, state, and local government employees',            status: 'available' },
  { id: 'senior',         Icon: Icon.Senior,         label: 'Senior',            desc: 'Age 55 and older verification',                            status: 'available' },
  { id: 'nonprofit',      Icon: Icon.Nonprofit,      label: 'Nonprofit Worker',  desc: 'Employees of registered nonprofit organizations',           status: 'available' },
];

export default function Credentials() {
  const { user } = useAuth();
  const [userCredentials, setUserCredentials] = useState([]);
  const [activeTab, setActiveTab]             = useState('all');
  const [expandedId, setExpandedId]           = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [starting, setStarting]               = useState(null);
  const [submitting, setSubmitting]           = useState(null); // credentialType being submitted
  const [submitError, setSubmitError]         = useState({});  // { [credentialType]: errorMsg }
  const [submitSuccess, setSubmitSuccess]     = useState({});  // { [credentialType]: true }

  const isVerified = user?.accountStatus === 'ACTIVE';

  const load = useCallback(() => {
    setLoading(true);
    fetchCredentials()
      .then(setUserCredentials)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Map credential type → user credential record
  const credMap = Object.fromEntries(userCredentials.map((c) => [c.credentialType, c]));
  const verifiedCount = userCredentials.filter((c) => c.status === 'verified').length;

  const filtered = activeTab === 'all'
    ? CREDENTIAL_CATEGORIES
    : CREDENTIAL_CATEGORIES.filter((c) => c.status === activeTab);

  async function handleSubmitDoc(credentialType, file) {
    if (!file) return;
    setSubmitting(credentialType);
    setSubmitError((prev) => ({ ...prev, [credentialType]: null }));
    setSubmitSuccess((prev) => ({ ...prev, [credentialType]: false }));
    try {
      await submitCredentialDocument(credentialType, file);
      setSubmitSuccess((prev) => ({ ...prev, [credentialType]: true }));
    } catch (err) {
      setSubmitError((prev) => ({ ...prev, [credentialType]: err.message }));
    } finally {
      setSubmitting(null);
    }
  }

  async function handleStart(credentialType) {
    setStarting(credentialType);
    try {
      const result = await startCredentialVerification(credentialType);
      setUserCredentials((prev) => [...prev, result]);
    } catch (err) {
      alert(err.message);
    } finally {
      setStarting(null);
    }
  }

  function statusLabel(status) {
    if (status === 'verified') return '✓ Verified';
    if (status === 'pending') return '○ Pending';
    if (status === 'rejected') return '✕ Rejected';
    return status;
  }

  return (
    <div className="cred-page">
      <div className="cred-header">
        <div>
          <h2>Credentials</h2>
          <p className="cred-subtitle">
            Verify your group affiliations to unlock exclusive discounts and benefits.
          </p>
        </div>
        <div className="cred-header-stat">
          <span className="cred-stat-number">{loading ? '—' : verifiedCount}</span>
          <span className="cred-stat-label">Verified</span>
        </div>
      </div>

      {!isVerified && (
        <div className="cred-notice">
          <span className="cred-notice-icon"><Icon.Warning /></span>
          <div>
            <span className="cred-notice-title">Identity Verification Required</span>
            <span className="cred-notice-desc">
              You must verify your identity before you can add group credentials.
            </span>
          </div>
        </div>
      )}

      <div className="cred-tabs">
        {[
          { id: 'all', label: 'All' },
          { id: 'available', label: 'Available' },
          { id: 'coming_soon', label: 'Coming Soon' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={'cred-tab' + (activeTab === tab.id ? ' active' : '')}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="cred-list">
        {filtered.map((cred) => {
          const userCred = credMap[cred.id];
          const isExpanded = expandedId === cred.id;
          return (
            <div key={cred.id} className={'cred-item' + (isExpanded ? ' expanded' : '')}>
              <button
                type="button"
                className="cred-item-header"
                onClick={() => setExpandedId(isExpanded ? null : cred.id)}
              >
                <span className="cred-item-icon"><cred.Icon /></span>
                <div className="cred-item-info">
                  <span className="cred-item-label">{cred.label}</span>
                  <span className="cred-item-desc">{cred.desc}</span>
                </div>
                {userCred ? (
                  <span className={`cred-badge user-status ${userCred.status}`}>
                    {statusLabel(userCred.status)}
                  </span>
                ) : cred.status === 'coming_soon' ? (
                  <span className="cred-badge coming-soon">Coming Soon</span>
                ) : (
                  <span className="cred-badge available">Available</span>
                )}
                <span className={'cred-chevron' + (isExpanded ? ' open' : '')}>
                  <Icon.Chevron />
                </span>
              </button>

              {isExpanded && (
                <div className="cred-item-body">
                  <div className="cred-item-details">
                    {userCred ? (
                      <>
                        <h4>Verification Status</h4>
                        <p>Status: <strong>{statusLabel(userCred.status)}</strong></p>
                        {userCred.startedAt && <p>Started: {userCred.startedAt}</p>}
                        {userCred.verifiedAt && <p>Verified: {userCred.verifiedAt}</p>}
                        {userCred.status === 'pending' && !submitSuccess[cred.id] && (
                          <div className="cred-upload-section">
                            <h4>Upload Supporting Document</h4>
                            <p>Provide proof of your affiliation (JPEG, PNG, WebP, or PDF, max 10 MB).</p>
                            <label className="cred-upload-label">
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                className="cred-upload-input"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleSubmitDoc(cred.id, file);
                                }}
                                disabled={submitting === cred.id}
                              />
                              {submitting === cred.id ? 'Uploading…' : 'Choose file'}
                            </label>
                            {submitError[cred.id] && (
                              <p className="cred-upload-error">{submitError[cred.id]}</p>
                            )}
                          </div>
                        )}
                        {submitSuccess[cred.id] && (
                          <p className="cred-upload-success">Document submitted. Your credential is under review.</p>
                        )}
                      </>
                    ) : (
                      <>
                        <h4>How to verify</h4>
                        <ol>
                          <li>Click "Start Verification" below</li>
                          <li>Provide your affiliation details</li>
                          <li>Upload supporting documentation if required</li>
                          <li>Verification typically completes in minutes</li>
                        </ol>
                        <h4>Benefits</h4>
                        <ul>
                          <li>Exclusive discounts from 100+ partner brands</li>
                          <li>Priority access to government services</li>
                          <li>One-click verification at checkout</li>
                        </ul>
                      </>
                    )}
                  </div>
                  {!userCred && (
                    <button
                      type="button"
                      className="cred-verify-btn"
                      disabled={!isVerified || cred.status === 'coming_soon' || starting === cred.id}
                      onClick={() => handleStart(cred.id)}
                    >
                      {starting === cred.id ? 'Starting…'
                        : cred.status === 'coming_soon' ? 'Not Yet Available'
                        : 'Start Verification'}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
