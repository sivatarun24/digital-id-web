import { useState, useEffect, useRef, useCallback } from 'react';
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
  X:          () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
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
  const [step, setStep]               = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [frontFile, setFrontFile]     = useState(null);
  const [backFile, setBackFile]       = useState(null);
  const [selfieFile, setSelfieFile]   = useState(null);
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [verification, setVerification] = useState(null); // null = loading, {status} = loaded
  const [statusLoading, setStatusLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [cameraActive, setCameraActive]   = useState(false);
  const [cameraError, setCameraError]     = useState(null);
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      setCameraError('Camera access denied. Please allow camera permission and try again.');
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
        setSelfieFile(file);
        stopCamera();
      }
    }, 'image/jpeg', 0.92);
  }, [stopCamera]);

  // Assign stream to video element after it mounts (cameraActive triggers the render)
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  // Stop camera if user navigates away from selfie step
  useEffect(() => {
    if (step !== 2) stopCamera();
  }, [step, stopCamera]);

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
    setIsAnalyzing(true);
    try {
      const result = await submitVerification({
        idType: selectedType,
        frontFile,
        backFile,
        selfieFile,
      });
      setVerification(result);
      
      // If result is pending, start polling for completion
      if (result.status === 'pending') {
        const pollInterval = setInterval(async () => {
          try {
            const statusUpdate = await fetchVerificationStatus();
            if (statusUpdate.status !== 'pending') {
              setVerification(statusUpdate);
              setIsAnalyzing(false);
              clearInterval(pollInterval);
            }
          } catch (pollErr) {
            console.error('Error polling verification status:', pollErr);
          }
        }, 3000); // Poll every 3 seconds
      } else {
        setIsAnalyzing(false);
      }
    } catch (err) {
      setSubmitError(err.message);
      setIsAnalyzing(false);
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
        {verification?.status === 'verified' ? (
          <div className="vi-verified-wrap" style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="vi-verified-icon-lg"><Icon.CheckLg /></div>
            <h3 className="vi-card-title">Identity Verified</h3>
            <p className="vi-card-desc">Your identity has been successfully verified. You now have full access to all Digital ID services.</p>
            <div className="vi-verified-details" style={{ marginTop: '24px', textAlign: 'left' }}>
              <div className="vi-detail-row">
                <span className="vi-detail-label">Verification Level</span>
                <span className="vi-detail-value vi-detail-highlight">IAL2 — Strong Identity</span>
              </div>
              <div className="vi-detail-row">
                <span className="vi-detail-label">Submitted On</span>
                <span className="vi-detail-value">{verification.submittedAt || new Date().toLocaleDateString()}</span>
              </div>
              <div className="vi-detail-row">
                <span className="vi-detail-label">Biometric Match</span>
                <span className="vi-detail-value vi-detail-highlight">Confirmed ✅</span>
              </div>
            </div>
            <button type="button" className="vi-btn-primary" style={{ marginTop: '30px', width: '100%' }} onClick={() => window.location.href = '/dashboard'}>
              Return to Dashboard
            </button>
          </div>
        ) : verification?.status === 'rejected' ? (
          <div className="vi-rejected-wrap" style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="vi-rejected-icon-lg"><Icon.X /></div>
            <h3 className="vi-card-title">Verification Failed</h3>
            <p className="vi-card-desc" style={{ color: 'var(--error)' }}>
              {verification.reviewerNotes || 'Documents or selfie did not meet the requirements.'}
            </p>
            <div className="vi-tips" style={{ marginTop: '24px', textAlign: 'left' }}>
              <h4>Common Rejection Reasons</h4>
              <ul style={{ fontSize: '0.85rem' }}>
                <li>Blurry or low-resolution images</li>
                <li>Mismatched names (use your legal name)</li>
                <li>Selfie and ID photo do not match</li>
              </ul>
            </div>
            <button type="button" className="vi-btn-primary" style={{ marginTop: '30px', width: '100%' }} onClick={() => setVerification({ status: 'none' })}>
              Try Again
            </button>
          </div>
        ) : (isAnalyzing || (verification?.status === 'pending')) ? (
          <div className="vi-analyzing-wrap">
            <div className="vi-spinner"></div>
            <h3>{isAnalyzing ? 'Analyzing Your Identity' : 'Under Review'}</h3>
            <p>
              {isAnalyzing 
                ? "Our automated system is currently verifying your documents and matching your biometrics." 
                : "Your identity is currently being finalized. This usually takes just a few more seconds."}
            </p>
            <div className="vi-tips" style={{ marginTop: '20px' }}>
              <div className="vi-success-steps">
                <div className="vi-success-step done"><span className="vi-success-dot"></span> Documents Uploaded</div>
                <div className="vi-success-step done"><span className="vi-success-dot"></span> Face Matching...</div>
                <div className={'vi-success-step' + (isAnalyzing ? ' active' : ' done')}><span className="vi-success-dot"></span> {isAnalyzing ? 'AI Verification...' : 'Processing Final Result'}</div>
              </div>
            </div>
          </div>
        ) : (
          <>
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
                      onClick={() => { if (selectedType !== t.id) { setSelectedType(t.id); setFrontFile(null); setBackFile(null); } }}
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
                    {frontFile ? (
                      <div className="vi-upload-file-row">
                        <span className="vi-upload-check"><Icon.Check /> {frontFile.name}</span>
                        <button type="button" className="vi-upload-remove" onClick={() => setFrontFile(null)} title="Remove"><Icon.X /></button>
                      </div>
                    ) : (
                      <label className="vi-upload-btn">
                        Choose File
                        <input type="file" accept="image/*" onChange={(e) => setFrontFile(e.target.files[0] || null)} hidden />
                      </label>
                    )}
                  </div>
                  <div className="vi-upload-box">
                    <span className="vi-upload-icon"><Icon.Camera /></span>
                    <span className="vi-upload-label">Back of Document</span>
                    {backFile ? (
                      <div className="vi-upload-file-row">
                        <span className="vi-upload-check"><Icon.Check /> {backFile.name}</span>
                        <button type="button" className="vi-upload-remove" onClick={() => setBackFile(null)} title="Remove"><Icon.X /></button>
                      </div>
                    ) : (
                      <label className="vi-upload-btn">
                        Choose File
                        <input type="file" accept="image/*" onChange={(e) => setBackFile(e.target.files[0] || null)} hidden />
                      </label>
                    )}
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
                    {cameraActive ? (
                      <>
                        <video ref={videoRef} autoPlay playsInline muted className="vi-selfie-preview" />
                        <div className="vi-selfie-face-guide" />
                      </>
                    ) : selfieFile ? (
                      <img src={URL.createObjectURL(selfieFile)} alt="Selfie preview" className="vi-selfie-preview" />
                    ) : (
                      <>
                        <span className="vi-selfie-icon"><Icon.User /></span>
                        <span className="vi-selfie-hint">Position your face in the frame</span>
                      </>
                    )}
                  </div>
                  <canvas ref={canvasRef} hidden />
                  {cameraError && <p className="vi-camera-error">{cameraError}</p>}
                  <div className="vi-selfie-actions">
                    {cameraActive ? (
                      <>
                        <button type="button" className="vi-selfie-btn vi-selfie-btn-capture" onClick={capturePhoto}>
                          Take Photo
                        </button>
                        <button type="button" className="vi-btn-outline vi-selfie-btn-cancel" onClick={stopCamera}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button type="button" className="vi-selfie-btn" onClick={startCamera}>
                        {selfieFile ? 'Retake Selfie' : 'Open Camera'}
                      </button>
                    )}
                  </div>
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
          </>
        )}
      </div>

      {verification?.status === 'none' && !isAnalyzing && (
        <div className="vi-actions">
          {step > 0 && (
            <button type="button" className="vi-btn-outline" onClick={handleBack} disabled={submitting}>Back</button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" className="vi-btn-primary" onClick={handleNext} disabled={!canProceed()}>Continue</button>
          ) : (
            <button type="button" className="vi-btn-primary" onClick={handleSubmit} disabled={submitting || isAnalyzing}>
              {submitting || isAnalyzing ? 'Processing…' : 'Submit Verification'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
