import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyCredentialEmailToken } from '../../api/credentials';
import './VerifyCredential.css';

const Icon = {
  CheckCircle: () => (<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>),
  ErrorCircle: () => (<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>),
  Loader:      () => (<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="vc-spinner"><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></svg>),
};

export default function VerifyCredential() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState(token ? 'verifying' : 'error');
  const [error, setError] = useState(token ? null : 'Missing verification token.');

  useEffect(() => {
    if (!token) return;

    verifyCredentialEmailToken(token)
      .then(() => {
        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        setError(err.message || 'Verification failed. The link may be expired.');
      });
  }, [token]);

  return (
    <div className="vc-page">
      <div className="vc-card">
        {status === 'verifying' && (
          <div className="vc-content">
            <Icon.Loader />
            <h2>Verifying your credential…</h2>
            <p>Please wait while we secure your record.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="vc-content">
            <Icon.CheckCircle />
            <h2>Verification Successful!</h2>
            <p>Your professional/educational affiliation has been confirmed. You can now access exclusive benefits.</p>
            <button className="vc-btn-primary" onClick={() => navigate('/credentials')}>
              Go to My Credentials
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="vc-content">
            <Icon.ErrorCircle />
            <h2>Verification Failed</h2>
            <p className="vc-error-msg">{error}</p>
            <button className="vc-btn-outline" onClick={() => navigate('/credentials')}>
              Return to Credentials
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
