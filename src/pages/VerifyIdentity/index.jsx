import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { fetchVerificationStatus, submitVerification } from '../../api/verifyIdentity';
import './VerifyIdentity.css';

const Icon = {
  IdCard:     () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="8" cy="12" r="2" /><path d="M14 10h4M14 14h3" /></svg>),
  Book:       () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>),
  Building:   () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14" /><path d="M9 21v-4h6v4" /></svg>),
  Award:      () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>),
  CreditCard: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>),
  Camera:     () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>),
  User:       () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5" /><path d="M3 21v-2a7 7 0 0 1 14 0v2" /></svg>),
  Check:      () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>),
  CheckLg:    () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>),
  Party:      () => (<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5.8 11.3L2 22l10.7-3.79" /><path d="M4 3h.01" /><path d="M22 8h.01" /><path d="M15 2h.01" /><path d="M22 20h.01" /><path d="M22 2l-2.24 2.24" /><path d="M19.76 4.24a5 5 0 0 1 0 7.08L12 19l-7-7 7.76-7.76a5 5 0 0 1 7.08 0z" /></svg>),
};

const STEPS = [
  { id: 'type',   label: 'ID Type' },
  { id: 'upload', label: 'Upload' },
  { id: 'selfie', label: 'Selfie' },
  { id: 'review', label: 'Review' },
];

const ID_TYPES = [
  { id: 'drivers_license', IconComp: Icon.IdCard,     label: "Driver's License", desc: "State-issued driver's license" },
  { id: 'passport',        IconComp: Icon.Book,       label: 'Passport',         desc: 'U.S. or international passport' },
  { id: 'state_id',        IconComp: Icon.Building,   label: 'State ID',         desc: 'Non-driver government-issued ID' },
  { id: 'military_id',     IconComp: Icon.Award,      label: 'Military ID',      desc: 'Active duty, veteran, or dependent' },
  { id: 'passport_card',   IconComp: Icon.CreditCard, label: 'Passport Card',    desc: 'U.S. passport card' },
];

const ID_TYPE_LABELS = Object.fromEntries(ID_TYPES.map((t) => [t.id, t.label]));

export default function VerifyIdentity() {
  const { user } = useAuth();
  const [step, setStep]               = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [frontFile, setFrontFile]     = useState(null);
  const [backFile, setBackFile]       = useState(null);
  const [selfieFile, setSelfieFile]   = useState(null);
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [verification, setVerification] = useState(null); // null = loading, {status} = loaded
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    fetchVerificationStatus()
      .then(setVerification)
      .catch(() => setVerification({ status: 'none' }))
      .finally(() => setStatusLoading(false));
  }, []);

  function handleNext() { if (step < STEPS.length - 1) setStep(step + 1); }
  function handleBack() { if (step > 0) setStep(step - 1); }

  function canProceed() {
    if (step === 0) return !!selectedType;
    if (step === 1) return !!frontFile;
    if (step === 2) return !!selfieFile;
    return true;
  }

  async function handleSubmit() {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const result = await submitVerification({
        idType: selectedType,
        frontFile,
        backFile,
        selfieFile,
      });
      setVerification(result);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (statusLoading) {
    return (
      <div className="vi-page">
        <div className="vi-page-header"><h2>Identity Verification</h2></div>
        <div className="vi-loading"><div className="vi-spinner" /><span>Checking status…</span></div>
      </div>
    );
  }

  if (verification?.status === 'verified') {
    return (
      <div className="vi-page">
        <div className="vi-page-header"><h2>Identity Verification</h2></div>
        <div className="vi-verified-banner">
          <span className="vi-verified-icon"><Icon.CheckLg /></span>
          <div>
            <span className="vi-verified-title">Identity Verified</span>
            <span className="vi-verified-desc">
              Your identity has been successfully verified. You have full access to all Digital ID services.
            </span>
          </div>
        </div>
        <div className="vi-card">
          <div className="vi-verified-details">
            <div className="vi-detail-row">
              <span className="vi-detail-label">Verification Level</span>
              <span className="vi-detail-value vi-detail-highlight">IAL2 — Strong Identity</span>
            </div>
            <div className="vi-detail-row">
              <span className="vi-detail-label">Submitted On</span>
              <span className="vi-detail-value">{verification.submittedAt || '—'}</span>
            </div>
            <div className="vi-detail-row">
              <span className="vi-detail-label">Document Used</span>
              <span className="vi-detail-value">{ID_TYPE_LABELS[verification.idType] || verification.idType || '—'}</span>
            </div>
            <div className="vi-detail-row">
              <span className="vi-detail-label">Biometric Match</span>
              <span className="vi-detail-value vi-detail-highlight">Confirmed</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verification?.status === 'pending') {
    return (
      <div className="vi-page">
        <div className="vi-page-header"><h2>Identity Verification</h2></div>
        <div className="vi-success-state">
          <div className="vi-success-icon-wrap"><Icon.Party /></div>
          <h3>Verification Under Review</h3>
          <p>Your documents are being reviewed. You'll receive a notification once verification is complete.</p>
          <div className="vi-success-steps">
            <div className="vi-success-step done"><span className="vi-success-dot" /><span>Documents uploaded</span></div>
            <div className="vi-success-step done"><span className="vi-success-dot" /><span>Selfie captured</span></div>
            <div className="vi-success-step active"><span className="vi-success-dot" /><span>Under review</span></div>
            <div className="vi-success-step"><span className="vi-success-dot" /><span>Verification complete</span></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vi-page">
      <div className="vi-page-header">
        <h2>Verify Your Identity</h2>
        <p className="vi-subtitle">
          Complete identity verification to unlock full access to government and commercial services.
        </p>
      </div>

      <div className="vi-stepper">
        {STEPS.map((s, i) => (
          <div key={s.id} className={'vi-step' + (i === step ? ' active' : '') + (i < step ? ' done' : '')}>
            <span className="vi-step-number">{i < step ? <Icon.Check /> : i + 1}</span>
            <span className="vi-step-label">{s.label}</span>
            {i < STEPS.length - 1 && <span className="vi-step-line" />}
          </div>
        ))}
      </div>

      <div className="vi-card vi-step-content">
        {step === 0 && (
          <>
            <h3 className="vi-card-title">Select Your Document Type</h3>
            <p className="vi-card-desc">Choose the government-issued ID you'd like to use for verification.</p>
            <div className="vi-id-types">
              {ID_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={'vi-id-type' + (selectedType === t.id ? ' selected' : '')}
                  onClick={() => setSelectedType(t.id)}
                >
                  <span className="vi-id-type-icon"><t.IconComp /></span>
                  <div className="vi-id-type-text">
                    <span className="vi-id-type-label">{t.label}</span>
                    <span className="vi-id-type-desc">{t.desc}</span>
                  </div>
                  {selectedType === t.id && <span className="vi-id-type-check"><Icon.Check /></span>}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h3 className="vi-card-title">Upload Your Document</h3>
            <p className="vi-card-desc">Take a clear photo or upload a scan of your {ID_TYPE_LABELS[selectedType] || 'ID'}.</p>
            <div className="vi-upload-areas">
              <div className="vi-upload-box">
                <span className="vi-upload-icon"><Icon.Camera /></span>
                <span className="vi-upload-label">Front of Document</span>
                <label className="vi-upload-btn">
                  {frontFile ? frontFile.name : 'Choose File'}
                  <input type="file" accept="image/*" onChange={(e) => setFrontFile(e.target.files[0] || null)} hidden />
                </label>
                {frontFile && <span className="vi-upload-check"><Icon.Check /> Uploaded</span>}
              </div>
              <div className="vi-upload-box">
                <span className="vi-upload-icon"><Icon.Camera /></span>
                <span className="vi-upload-label">Back of Document</span>
                <label className="vi-upload-btn">
                  {backFile ? backFile.name : 'Choose File'}
                  <input type="file" accept="image/*" onChange={(e) => setBackFile(e.target.files[0] || null)} hidden />
                </label>
                {backFile && <span className="vi-upload-check"><Icon.Check /> Uploaded</span>}
                <span className="vi-upload-optional">Optional for passports</span>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="vi-card-title">Take a Selfie</h3>
            <p className="vi-card-desc">We'll compare your selfie to the photo on your ID to confirm your identity.</p>
            <div className="vi-selfie-area">
              <div className="vi-selfie-frame">
                {selfieFile ? (
                  <img src={URL.createObjectURL(selfieFile)} alt="Selfie preview" className="vi-selfie-preview" />
                ) : (
                  <>
                    <span className="vi-selfie-icon"><Icon.User /></span>
                    <span className="vi-selfie-hint">Position your face in the frame</span>
                  </>
                )}
              </div>
              <label className="vi-selfie-btn">
                {selfieFile ? 'Retake Selfie' : 'Capture Selfie'}
                <input type="file" accept="image/*" capture="user" onChange={(e) => setSelfieFile(e.target.files[0] || null)} hidden />
              </label>
            </div>
            <div className="vi-tips">
              <h4>Tips for a good selfie</h4>
              <ul>
                <li>Ensure good lighting on your face</li>
                <li>Remove hats, glasses, or face coverings</li>
                <li>Look directly at the camera</li>
                <li>Keep a neutral expression</li>
              </ul>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h3 className="vi-card-title">Review & Submit</h3>
            <p className="vi-card-desc">Please review your information before submitting.</p>
            <div className="vi-review-items">
              <div className="vi-review-item">
                <span className="vi-review-label">Document Type</span>
                <span className="vi-review-value">{ID_TYPE_LABELS[selectedType]}</span>
              </div>
              <div className="vi-review-item">
                <span className="vi-review-label">Front Image</span>
                <span className="vi-review-value vi-review-check">{frontFile ? frontFile.name : '—'}</span>
              </div>
              <div className="vi-review-item">
                <span className="vi-review-label">Back Image</span>
                <span className="vi-review-value">{backFile ? backFile.name : 'Not provided'}</span>
              </div>
              <div className="vi-review-item">
                <span className="vi-review-label">Selfie</span>
                <span className="vi-review-value vi-review-check">{selfieFile ? 'Captured' : '—'}</span>
              </div>
            </div>
            <div className="vi-consent">
              <p>By submitting, you consent to Digital ID processing your biometric data and identity documents for verification purposes in accordance with our Privacy Policy.</p>
            </div>
            {submitError && <p className="vi-submit-error">{submitError}</p>}
          </>
        )}
      </div>

      <div className="vi-actions">
        {step > 0 && (
          <button type="button" className="vi-btn-outline" onClick={handleBack} disabled={submitting}>Back</button>
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" className="vi-btn-primary" onClick={handleNext} disabled={!canProceed()}>Continue</button>
        ) : (
          <button type="button" className="vi-btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Verification'}
          </button>
        )}
      </div>
    </div>
  );
}
