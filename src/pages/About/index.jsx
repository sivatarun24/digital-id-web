import { Link } from 'react-router-dom';
import PublicNav from '../../components/layout/PublicNav';
import PublicFooter from '../../components/layout/PublicFooter';
import '../../styles/public.css';

const VALUE_PALETTE = [
  { bg: '#ecfdf5', border: '#a7f3d0', color: '#059669' },
  { bg: '#eff6ff', border: '#bfdbfe', color: '#2563eb' },
  { bg: '#faf5ff', border: '#ddd6fe', color: '#7c3aed' },
  { bg: '#fff7ed', border: '#fed7aa', color: '#ea580c' },
  { bg: '#f0fdfa', border: '#99f6e4', color: '#0d9488' },
  { bg: '#fffbeb', border: '#fde68a', color: '#d97706' },
];

const values = [
  {
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Security First',
    desc: 'We use bank-grade encryption, biometric verification, and strict data protection standards to keep your information safe.',
  },
  {
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Privacy by Design',
    desc: 'You control what information is shared and with whom. We never sell your data to third parties.',
  },
  {
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: 'Simplicity',
    desc: 'Verifying your identity should be easy. Our streamlined process takes minutes, not days.',
  },
  {
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Inclusion',
    desc: 'We design for accessibility and work to ensure that everyone can prove who they are, regardless of background.',
  },
  {
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    title: 'Trust & Transparency',
    desc: 'We are certified and compliant with federal identity standards including NIST 800-63-3 IAL2.',
  },
  {
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="9" y1="18" x2="15" y2="18" /><line x1="10" y1="22" x2="14" y2="22" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
      </svg>
    ),
    title: 'Innovation',
    desc: 'We continuously invest in AI, biometrics, and fraud detection to stay ahead of evolving threats.',
  },
];

export default function About() {
  return (
    <div className="public-page">
      <PublicNav />

      <div className="pub-hero-grad">
        <h1>Trusted by Millions to Prove Who They Are</h1>
        <p>
          Digital ID is a secure digital identity platform that makes it easy for people
          to verify their identity online and for organizations to ensure they're interacting
          with real people.
        </p>
      </div>

      <div className="public-content">

        <div className="pub-stat-band">
          <div className="pub-stat-band-item">
            <span className="pub-stat-num">100M+</span>
            <span className="pub-stat-lbl">Verified Users</span>
          </div>
          <div className="pub-stat-band-item">
            <span className="pub-stat-num">600+</span>
            <span className="pub-stat-lbl">Partner Organizations</span>
          </div>
          <div className="pub-stat-band-item">
            <span className="pub-stat-num">30+</span>
            <span className="pub-stat-lbl">Government Agencies</span>
          </div>
        </div>

        <div className="pub-section-head">
          <h2>Our Mission</h2>
        </div>
        <div className="pub-mission">
          <p>
            We believe everyone deserves a simple, secure way to prove their identity.
            Our mission is to make the digital world safer by providing trusted identity
            verification that protects people and organizations from fraud while removing
            barriers to access.
          </p>
        </div>

        <div className="pub-section-head">
          <h2>Our Values</h2>
          <p>The principles that guide everything we build.</p>
        </div>

        <div className="pub-values-list">
          {values.map((v, i) => {
            const palette = VALUE_PALETTE[i % VALUE_PALETTE.length];
            return (
              <div className="pub-value-row" key={v.title}>
                <div
                  className="pub-value-icon"
                  style={{ background: palette.bg, border: `1px solid ${palette.border}`, color: palette.color }}
                >
                  <v.Icon />
                </div>
                <div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pub-cta">
          <h2>Join the Trust Network</h2>
          <p>Create your verified digital identity and access services with confidence.</p>
          <Link to="/register" className="pub-cta-btn">Get Started</Link>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
