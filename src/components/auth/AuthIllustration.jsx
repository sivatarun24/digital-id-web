import { useEffect, useState } from 'react';

const LABELS = [
  'Identity Verification',
  'Military Status',
  'Student Enrollment',
  'Healthcare Worker',
  'First Responder',
];

export default function AuthIllustration() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % LABELS.length);
        setVisible(true);
      }, 350);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="auth-panel">
      <div className="auth-panel-orb auth-panel-orb-1" />
      <div className="auth-panel-orb auth-panel-orb-2" />

      {/* Floating glass cards */}
      <div className="auth-float-card auth-float-card-1">
        <span className="auth-float-dot" style={{ background: '#34d399' }} />
        <div>
          <div className="auth-float-title">Identity Verified</div>
          <div className="auth-float-sub">Gov. ID confirmed</div>
        </div>
      </div>

      <div className="auth-float-card auth-float-card-2">
        <span className="auth-float-dot" style={{ background: '#60a5fa' }} />
        <div>
          <div className="auth-float-title">AES-256 Encrypted</div>
          <div className="auth-float-sub">Bank-grade security</div>
        </div>
      </div>

      <div className="auth-float-card auth-float-card-3">
        <span className="auth-float-dot" style={{ background: '#a78bfa' }} />
        <div>
          <div className="auth-float-title">600+ Partners</div>
          <div className="auth-float-sub">Trusted network</div>
        </div>
      </div>

      {/* Center */}
      <div className="auth-panel-center">
        <div className="auth-shield-wrap">
          <div className="auth-shield-ring auth-shield-ring-1" />
          <div className="auth-shield-ring auth-shield-ring-2" />

          <svg className="auth-shield-svg" width="118" height="138" viewBox="0 0 118 138" fill="none" aria-hidden="true">
            <defs>
              <clipPath id="shield-clip">
                <path d="M59 20 L100 36 L100 72 Q100 110 59 130 Q18 110 18 72 L18 36 Z" />
              </clipPath>
            </defs>
            {/* Outer shield */}
            <path
              d="M59 6 L110 26 L110 74 Q110 118 59 136 Q8 118 8 74 L8 26 Z"
              fill="rgba(255,255,255,0.07)"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
            />
            {/* Inner shield */}
            <path
              d="M59 20 L100 36 L100 72 Q100 110 59 130 Q18 110 18 72 L18 36 Z"
              fill="rgba(255,255,255,0.05)"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="1"
            />
            {/* Scan line — clipped to inner shield */}
            <rect
              className="auth-scan-line"
              x="18" y="36" width="82" height="2" rx="1"
              fill="rgba(110,231,183,0.75)"
              clipPath="url(#shield-clip)"
            />
            {/* Checkmark */}
            <path
              d="M42 72 L54 84 L78 55"
              stroke="rgba(255,255,255,0.95)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="auth-panel-label-wrap">
          <p className="auth-panel-label" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(7px)' }}>
            {LABELS[idx]}
          </p>
          <p className="auth-panel-sublabel">Trusted verification platform</p>
        </div>

        <div className="auth-trust-badges">
          <span className="auth-trust-badge">SOC 2</span>
          <span className="auth-trust-badge">IAL2</span>
          <span className="auth-trust-badge">NIST 800-63</span>
        </div>
      </div>
    </div>
  );
}
