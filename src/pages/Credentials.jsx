import { useState } from 'react';
import './Credentials.css';

const CREDENTIAL_CATEGORIES = [
  {
    id: 'military',
    icon: '🎖️',
    label: 'Military',
    desc: 'Active duty, veterans, reservists, and military dependents',
    status: 'available',
  },
  {
    id: 'student',
    icon: '🎓',
    label: 'Student',
    desc: 'Currently enrolled college or university students',
    status: 'available',
  },
  {
    id: 'first_responder',
    icon: '🚒',
    label: 'First Responder',
    desc: 'EMTs, firefighters, law enforcement, and 911 dispatchers',
    status: 'available',
  },
  {
    id: 'teacher',
    icon: '👩‍🏫',
    label: 'Teacher',
    desc: 'K–12 educators and higher education faculty',
    status: 'available',
  },
  {
    id: 'healthcare',
    icon: '🏥',
    label: 'Healthcare Worker',
    desc: 'Nurses, doctors, pharmacists, and medical staff',
    status: 'available',
  },
  {
    id: 'government',
    icon: '🏛️',
    label: 'Government Employee',
    desc: 'Federal, state, and local government employees',
    status: 'available',
  },
  {
    id: 'senior',
    icon: '👴',
    label: 'Senior',
    desc: 'Age 55 and older verification',
    status: 'available',
  },
  {
    id: 'nonprofit',
    icon: '🤝',
    label: 'Nonprofit Worker',
    desc: 'Employees of registered nonprofit organizations',
    status: 'coming_soon',
  },
];

export default function Credentials({ user }) {
  const [activeTab, setActiveTab] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const isVerified = user?.accountStatus === 'ACTIVE';

  const filteredCredentials =
    activeTab === 'all'
      ? CREDENTIAL_CATEGORIES
      : CREDENTIAL_CATEGORIES.filter((c) => c.status === activeTab);

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
          <span className="cred-stat-number">0</span>
          <span className="cred-stat-label">Verified</span>
        </div>
      </div>

      {!isVerified && (
        <div className="cred-notice">
          <span className="cred-notice-icon">⚠️</span>
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
        {filteredCredentials.map((cred) => (
          <div
            key={cred.id}
            className={'cred-item' + (expandedId === cred.id ? ' expanded' : '')}
          >
            <button
              type="button"
              className="cred-item-header"
              onClick={() => setExpandedId(expandedId === cred.id ? null : cred.id)}
            >
              <span className="cred-item-icon">{cred.icon}</span>
              <div className="cred-item-info">
                <span className="cred-item-label">{cred.label}</span>
                <span className="cred-item-desc">{cred.desc}</span>
              </div>
              {cred.status === 'coming_soon' ? (
                <span className="cred-badge coming-soon">Coming Soon</span>
              ) : (
                <span className="cred-badge available">Available</span>
              )}
              <span className={'cred-chevron' + (expandedId === cred.id ? ' open' : '')}>
                ›
              </span>
            </button>

            {expandedId === cred.id && (
              <div className="cred-item-body">
                <div className="cred-item-details">
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
                </div>
                <button
                  type="button"
                  className="cred-verify-btn"
                  disabled={!isVerified || cred.status === 'coming_soon'}
                >
                  {cred.status === 'coming_soon' ? 'Not Yet Available' : 'Start Verification'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
