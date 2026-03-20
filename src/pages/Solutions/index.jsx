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
  { bg: '#fffbeb', border: '#fde68a', color: '#d97706' },
  { bg: '#eef2ff', border: '#c7d2fe', color: '#4f46e5' },
  { bg: '#ecfeff', border: '#a5f3fc', color: '#0891b2' },
];

const solutions = [
  {
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M5 21V7l7-4 7 4v14" /><path d="M9 21v-4h6v4" />
      </svg>
    ),
    title: 'Government Services',
    desc: 'Securely access federal, state, and local government services including the IRS, VA, SSA, and more with a single verified identity.',
  },
  {
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: 'Healthcare',
    desc: 'Verify your identity to access telehealth, patient portals, prescription services, and health insurance marketplaces.',
  },
  {
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    title: 'Education',
    desc: 'Unlock student discounts, access university portals, and verify enrollment status for financial aid and benefits.',
  },
  {
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
    title: 'Military & Veterans',
    desc: 'Verify active duty, veteran, or dependent status to access exclusive benefits, discounts, and VA services.',
  },
  {
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    ),
    title: 'Financial Services',
    desc: 'Meet KYC requirements, open accounts, and access financial platforms with a trusted verified identity.',
  },
  {
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    title: 'Employment',
    desc: 'Streamline background checks, verify work eligibility, and onboard faster with pre-verified credentials.',
  },
  {
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    title: 'Retail & Commerce',
    desc: 'Offer verified group discounts to military, students, first responders, and other communities.',
  },
  {
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Cybersecurity',
    desc: 'Strengthen access controls with identity-proofed multi-factor authentication and zero-trust verification.',
  },
  {
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="10" y1="10" x2="14" y2="10" />
      </svg>
    ),
    title: 'First Responders',
    desc: 'Verify EMT, firefighter, and law enforcement credentials for exclusive benefits and rapid-access programs.',
  },
];

export default function Solutions() {
  return (
    <div className="public-page">
      <PublicNav />

      <div className="pub-hero-grad">
        <h1>Identity Solutions for Every Industry</h1>
        <p>
          Digital ID provides secure identity verification and group affiliation
          services for government agencies, enterprises, and organizations of all sizes.
        </p>
      </div>

      <div className="public-content">

        <div className="pub-section-head">
          <h2>Built for Every Sector</h2>
          <p>From government agencies to retail, Digital ID fits seamlessly into any workflow.</p>
        </div>

        <div className="pub-features">
          {solutions.map((s, i) => {
            const palette = ICON_PALETTE[i % ICON_PALETTE.length];
            return (
              <div className="pub-feature" key={s.title}>
                <div
                  className="pub-feature-icon"
                  style={{ background: palette.bg, border: `1px solid ${palette.border}`, color: palette.color }}
                >
                  <s.Icon />
                </div>
                <div className="pub-feature-text">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pub-cta">
          <h2>Ready to Get Started?</h2>
          <p>Create your Digital ID and verify your identity in minutes.</p>
          <Link to="/register" className="pub-cta-btn">Create Your Digital ID</Link>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
