import { Link } from 'react-router-dom';
import PublicNav from '../../components/layout/PublicNav';
import PublicFooter from '../../components/layout/PublicFooter';
import '../../styles/public.css';

const ICON_PALETTE = [
  { bg: '#ecfdf5', border: '#a7f3d0', color: '#059669' },
  { bg: '#eff6ff', border: '#bfdbfe', color: '#2563eb' },
  { bg: '#faf5ff', border: '#ddd6fe', color: '#7c3aed' },
  { bg: '#fff7ed', border: '#fed7aa', color: '#ea580c' },
  { bg: '#f0fdfa', border: '#99f6e4', color: '#0d9488' },
  { bg: '#fff1f2', border: '#fecdd3', color: '#e11d48' },
];

const steps = [
  {
    num: 1,
    title: 'Create Account',
    desc: 'Sign up with your email, phone number, and a secure password.',
  },
  {
    num: 2,
    title: 'Upload Documents',
    desc: "Upload a government-issued ID such as a driver's license or passport.",
  },
  {
    num: 3,
    title: 'Selfie Verification',
    desc: 'Take a quick selfie to confirm your identity matches your document.',
  },
  {
    num: 4,
    title: "You're Verified!",
    desc: 'Access hundreds of services with your verified Digital ID.',
  },
];

const verificationTypes = [
  {
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="8" cy="12" r="2" /><path d="M14 10h4M14 14h3" />
      </svg>
    ),
    title: 'Identity Verification',
    desc: 'Verify your legal identity using government-issued documents. Required for accessing government services, financial platforms, and more.',
  },
  {
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
    title: 'Military Verification',
    desc: 'Prove active duty, veteran, reserve, or military dependent status through official records to unlock exclusive benefits.',
  },
  {
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    title: 'Student Verification',
    desc: 'Confirm your enrollment at an accredited college or university to access student discounts and educational resources.',
  },
  {
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="10" y1="10" x2="14" y2="10" />
      </svg>
    ),
    title: 'First Responder Verification',
    desc: 'Verify your status as an EMT, firefighter, paramedic, or law enforcement officer for special programs.',
  },
  {
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><circle cx="11" cy="11" r="2" />
      </svg>
    ),
    title: 'Teacher Verification',
    desc: 'Confirm your employment as an educator at a K–12 school or higher education institution.',
  },
  {
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: 'Healthcare Worker Verification',
    desc: 'Verify your credentials as a nurse, doctor, or medical professional for healthcare-specific benefits.',
  },
];

export default function Verify() {
  return (
    <div className="public-page">
      <PublicNav />

      <div className="pub-hero-grad">
        <h1>Verify Your Identity in Minutes</h1>
        <p>
          Our secure verification process uses advanced technology to confirm your
          identity quickly, so you can access the services and benefits you need.
        </p>
      </div>

      <div className="public-content">

        <div className="pub-shield-section">
          <div className="pub-section-head">
            <h2>How It Works</h2>
            <p>Four simple steps to a verified digital identity.</p>
          </div>
          <div className="pub-shield-outer">
            <div className="pub-shield-body">
              <p className="pub-shield-title">Your path to verification</p>
              <div className="pub-shield-grid">
                {steps.map((s) => (
                  <div className="pub-shield-step" key={s.num}>
                    <div className="pub-shield-step-num">{s.num}</div>
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pub-section-head">
          <h2>Types of Verification</h2>
          <p>Choose the verification that fits your needs.</p>
        </div>

        <div className="pub-features" style={{ marginBottom: '64px' }}>
          {verificationTypes.map((v, i) => {
            const palette = ICON_PALETTE[i % ICON_PALETTE.length];
            return (
              <div className="pub-feature" key={v.title}>
                <div
                  className="pub-feature-icon"
                  style={{ background: palette.bg, border: `1px solid ${palette.border}`, color: palette.color }}
                >
                  <v.Icon />
                </div>
                <div className="pub-feature-text">
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pub-cta">
          <h2>Start Your Verification Today</h2>
          <p>Join millions of users who trust Digital ID for secure identity verification.</p>
          <Link to="/register" className="pub-cta-btn">Get Verified Now</Link>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
