import { useState } from 'react';
import './VerifyIdentity.css';

const STEPS = [
  { id: 'type', label: 'ID Type' },
  { id: 'upload', label: 'Upload' },
  { id: 'selfie', label: 'Selfie' },
  { id: 'review', label: 'Review' },
];

const ID_TYPES = [
  { id: 'drivers_license', icon: '🪪', label: "Driver's License", desc: 'State-issued driver\'s license' },
  { id: 'passport', icon: '📘', label: 'Passport', desc: 'U.S. or international passport' },
  { id: 'state_id', icon: '🏛️', label: 'State ID', desc: 'Non-driver government-issued ID' },
  { id: 'military_id', icon: '🎖️', label: 'Military ID', desc: 'Active duty, veteran, or dependent' },
  { id: 'passport_card', icon: '💳', label: 'Passport Card', desc: 'U.S. passport card' },
];

export default function VerifyIdentity({ user }) {
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const isVerified = user?.accountStatus === 'ACTIVE';

  function handleNext() {
    if (step < STEPS.length - 1) setStep(step + 1);
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  function canProceed() {
    if (step === 0) return !!selectedType;
    if (step === 1) return !!frontFile;
    if (step === 2) return !!selfieFile;
    return true;
  }

  if (isVerified) {
    return (
      <div className="vi-page">
        <h2>Identity Verification</h2>
        <div className="vi-verified-banner">
          <span className="vi-verified-icon">✓</span>
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
              <span className="vi-detail-label">Verified On</span>
              <span className="vi-detail-value">
                {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="vi-detail-row">
              <span className="vi-detail-label">Document Used</span>
              <span className="vi-detail-value">Driver's License</span>
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

  if (submitted) {
    return (
      <div className="vi-page">
        <h2>Identity Verification</h2>
        <div className="vi-success-state">
          <div className="vi-success-icon-wrap">
            <span>🎉</span>
          </div>
          <h3>Verification Submitted</h3>
          <p>
            Your documents are being reviewed. This usually takes 5–10 minutes. You'll receive a
            notification once verification is complete.
          </p>
          <div className="vi-success-steps">
            <div className="vi-success-step done">
              <span className="vi-success-dot" />
              <span>Documents uploaded</span>
            </div>
            <div className="vi-success-step done">
              <span className="vi-success-dot" />
              <span>Selfie captured</span>
            </div>
            <div className="vi-success-step active">
              <span className="vi-success-dot" />
              <span>Under review</span>
            </div>
            <div className="vi-success-step">
              <span className="vi-success-dot" />
              <span>Verification complete</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vi-page">
      <h2>Verify Your Identity</h2>
      <p className="vi-subtitle">
        Complete identity verification to unlock full access to government and commercial services.
      </p>

      <div className="vi-stepper">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={'vi-step' + (i === step ? ' active' : '') + (i < step ? ' done' : '')}
          >
            <span className="vi-step-number">
              {i < step ? '✓' : i + 1}
            </span>
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
                  <span className="vi-id-type-icon">{t.icon}</span>
                  <div className="vi-id-type-text">
                    <span className="vi-id-type-label">{t.label}</span>
                    <span className="vi-id-type-desc">{t.desc}</span>
                  </div>
                  {selectedType === t.id && <span className="vi-id-type-check">✓</span>}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h3 className="vi-card-title">Upload Your Document</h3>
            <p className="vi-card-desc">
              Take a clear photo or upload a scan of your {ID_TYPES.find((t) => t.id === selectedType)?.label || 'ID'}.
            </p>
            <div className="vi-upload-areas">
              <div className="vi-upload-box">
                <span className="vi-upload-icon">📷</span>
                <span className="vi-upload-label">Front of Document</span>
                <label className="vi-upload-btn">
                  {frontFile ? frontFile.name : 'Choose File'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFrontFile(e.target.files[0] || null)}
                    hidden
                  />
                </label>
                {frontFile && <span className="vi-upload-check">✓ Uploaded</span>}
              </div>
              <div className="vi-upload-box">
                <span className="vi-upload-icon">📷</span>
                <span className="vi-upload-label">Back of Document</span>
                <label className="vi-upload-btn">
                  {backFile ? backFile.name : 'Choose File'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBackFile(e.target.files[0] || null)}
                    hidden
                  />
                </label>
                {backFile && <span className="vi-upload-check">✓ Uploaded</span>}
                <span className="vi-upload-optional">Optional for passports</span>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="vi-card-title">Take a Selfie</h3>
            <p className="vi-card-desc">
              We'll compare your selfie to the photo on your ID to confirm your identity.
            </p>
            <div className="vi-selfie-area">
              <div className="vi-selfie-frame">
                {selfieFile ? (
                  <img
                    src={URL.createObjectURL(selfieFile)}
                    alt="Selfie preview"
                    className="vi-selfie-preview"
                  />
                ) : (
                  <>
                    <span className="vi-selfie-icon">🤳</span>
                    <span className="vi-selfie-hint">Position your face in the frame</span>
                  </>
                )}
              </div>
              <label className="vi-selfie-btn">
                {selfieFile ? 'Retake Selfie' : 'Capture Selfie'}
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={(e) => setSelfieFile(e.target.files[0] || null)}
                  hidden
                />
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
                <span className="vi-review-value">
                  {ID_TYPES.find((t) => t.id === selectedType)?.label}
                </span>
              </div>
              <div className="vi-review-item">
                <span className="vi-review-label">Front Image</span>
                <span className="vi-review-value vi-review-check">
                  {frontFile ? '✓ ' + frontFile.name : '—'}
                </span>
              </div>
              <div className="vi-review-item">
                <span className="vi-review-label">Back Image</span>
                <span className="vi-review-value">
                  {backFile ? '✓ ' + backFile.name : 'Not provided'}
                </span>
              </div>
              <div className="vi-review-item">
                <span className="vi-review-label">Selfie</span>
                <span className="vi-review-value vi-review-check">
                  {selfieFile ? '✓ Captured' : '—'}
                </span>
              </div>
            </div>
            <div className="vi-consent">
              <p>
                By submitting, you consent to Digital ID processing your biometric data and identity
                documents for verification purposes in accordance with our Privacy Policy.
              </p>
            </div>
          </>
        )}
      </div>

      <div className="vi-actions">
        {step > 0 && (
          <button type="button" className="vi-btn-outline" onClick={handleBack}>
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            className="vi-btn-primary"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Continue
          </button>
        ) : (
          <button type="button" className="vi-btn-primary" onClick={handleSubmit}>
            Submit Verification
          </button>
        )}
      </div>
    </div>
  );
}
