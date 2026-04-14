import { useState } from 'react';
import { registerDevApp } from '../../../api/developer';
import './Register.css';

const CREDENTIAL_TYPES = [
  { id: 'student',       label: 'Student' },
  { id: 'military',      label: 'Military' },
  { id: 'teacher',       label: 'Teacher' },
  { id: 'government',    label: 'Government' },
  { id: 'healthcare',    label: 'Healthcare' },
  { id: 'firstresponder',label: 'First Responder' },
  { id: 'nonprofit',     label: 'Non-profit' },
  { id: 'senior',        label: 'Senior' },
];

export default function DeveloperRegister() {
  const [form, setForm] = useState({
    name: '', website: '', description: '',
    callbackUrl: '', ownerEmail: '', allowedCredentialTypes: [],
  });
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null); // { apiKey, appId }
  const [copied, setCopied]     = useState('');
  const [error, setError]       = useState('');

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const toggleType = (id) => {
    setForm(f => ({
      ...f,
      allowedCredentialTypes: f.allowedCredentialTypes.includes(id)
        ? f.allowedCredentialTypes.filter(t => t !== id)
        : [...f.allowedCredentialTypes, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.ownerEmail || !form.callbackUrl) {
      setError('App name, owner email, and callback URL are required.');
      return;
    }
    if (form.allowedCredentialTypes.length === 0) {
      setError('Select at least one credential type your app will verify.');
      return;
    }
    setLoading(true);
    try {
      const data = await registerDevApp({
        ...form,
        allowedCredentialTypes: form.allowedCredentialTypes.join(','),
      });
      setResult({ apiKey: data.apiKey, appId: data.id });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  if (result) {
    return (
      <div className="dev-page">
        <div className="dev-page-header">
          <h1>App Registered</h1>
          <p>Save the credentials below — you'll need both to use the API.</p>
        </div>

        <div className="dev-success-card">
          <div className="dev-success-icon">✓</div>
          <h2>Your Credentials</h2>

          <div className="dev-warning-banner">
            ⚠️ The API key will not be shown again. Copy it now and store it securely.
          </div>

          {/* App ID */}
          <div style={{ width: '100%', textAlign: 'left' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.07em', color: 'var(--text-3)', marginBottom: 6 }}>App ID</p>
            <div className="dev-key-box">
              <code className="dev-key-text" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                {result.appId}
              </code>
              <button
                className={`dev-copy-btn${copied === 'id' ? ' copied' : ''}`}
                onClick={() => handleCopy(String(result.appId), 'id')}>
                {copied === 'id' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 6 }}>
              Use this in your redirect URL: <code>/authorize?app_id=<strong>{result.appId}</strong>&amp;credential_type=...</code>
            </p>
          </div>

          {/* API Key */}
          <div style={{ width: '100%', textAlign: 'left' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.07em', color: 'var(--text-3)', marginBottom: 6 }}>API Key</p>
            <div className="dev-key-box">
              <code className="dev-key-text">{result.apiKey}</code>
              <button
                className={`dev-copy-btn${copied === 'key' ? ' copied' : ''}`}
                onClick={() => handleCopy(result.apiKey, 'key')}>
                {copied === 'key' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 6 }}>
              Send as <code>X-API-Key</code> header when calling <code>POST /api/verify</code>.
            </p>
          </div>

          <a href="/" className="dev-done-btn">Back to Digital ID</a>
        </div>
      </div>
    );
  }

  // ── Registration form ─────────────────────────────────────────
  return (
    <div className="dev-page">
      <div className="dev-page-header">
        <h1>Register Your App</h1>
        <p>Integrate with Digital ID to verify user credentials in your application.</p>
      </div>

      <div className="dev-form-card">
        <form onSubmit={handleSubmit} className="dev-form-inner">
          {error && <div className="dev-error">{error}</div>}

          <div className="dev-field">
            <label>App Name *</label>
            <input name="name" value={form.name} onChange={handle} placeholder="My Application" />
          </div>

          <div className="dev-field">
            <label>Website</label>
            <input name="website" value={form.website} onChange={handle} placeholder="https://myapp.com" />
          </div>

          <div className="dev-field">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handle}
              placeholder="Briefly describe what your app does" rows={3} />
          </div>

          <div className="dev-field">
            <label>
              Callback URL *{' '}
              <span className="dev-field-hint">— where we redirect after user consent</span>
            </label>
            <input name="callbackUrl" value={form.callbackUrl} onChange={handle}
              placeholder="https://myapp.com/callback" />
          </div>

          <div className="dev-field">
            <label>Owner Email *</label>
            <input name="ownerEmail" type="email" value={form.ownerEmail} onChange={handle}
              placeholder="dev@myapp.com" />
          </div>

          <div className="dev-form-divider" />

          <div className="dev-field">
            <label>Credential Types to Verify *</label>
            <div className="dev-cred-grid">
              {CREDENTIAL_TYPES.map(t => (
                <label
                  key={t.id}
                  className={`dev-cred-chip${form.allowedCredentialTypes.includes(t.id) ? ' selected' : ''}`}
                >
                  <input type="checkbox" hidden
                    checked={form.allowedCredentialTypes.includes(t.id)}
                    onChange={() => toggleType(t.id)}
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="dev-submit-btn" disabled={loading}>
            {loading ? 'Registering…' : 'Register App & Get API Key'}
          </button>
        </form>
      </div>
    </div>
  );
}
