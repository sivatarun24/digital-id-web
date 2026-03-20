import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Solutions', path: '/solutions' },
  { label: 'How It Works', path: '/verify' },
  { label: 'About', path: '/about' },
  { label: 'Help', path: '/help' },
];

const ACCOUNT_LINKS = [
  { label: 'Sign In', path: '/login' },
  { label: 'Create Account', path: '/register' },
];

export default function PublicFooter() {
  return (
    <footer className="layout-footer">
      <div className="layout-footer-inner">

        <div className="layout-footer-brand">
          <div className="layout-footer-logo">
            <span className="layout-footer-logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            Digital ID
          </div>
          <p className="layout-footer-tagline">
            Secure, verified digital identity<br />for everyone.
          </p>
          <div className="layout-footer-badges">
            <span className="layout-footer-badge">SOC 2</span>
            <span className="layout-footer-badge">IAL2</span>
            <span className="layout-footer-badge">256-bit AES</span>
          </div>
        </div>

        <div className="layout-footer-col">
          <span className="layout-footer-col-title">Product</span>
          {NAV_LINKS.map((item) => (
            <Link key={item.path} to={item.path} className="layout-footer-link">{item.label}</Link>
          ))}
        </div>

        <div className="layout-footer-col">
          <span className="layout-footer-col-title">Account</span>
          {ACCOUNT_LINKS.map((item) => (
            <Link key={item.path} to={item.path} className="layout-footer-link">{item.label}</Link>
          ))}
        </div>

        <div className="layout-footer-col">
          <span className="layout-footer-col-title">Security</span>
          <span className="layout-footer-text">End-to-end encrypted</span>
          <span className="layout-footer-text">Zero-knowledge storage</span>
          <span className="layout-footer-text">Auto-delete after verify</span>
          <span className="layout-footer-text">NIST 800-63 compliant</span>
        </div>

      </div>

      <div className="layout-footer-bottom">
        <span>© {new Date().getFullYear()} Digital ID. All rights reserved.</span>
        <div className="layout-footer-bottom-links">
          <span className="layout-footer-bottom-link">Privacy Policy</span>
          <span className="layout-footer-bottom-link">Terms of Service</span>
          <span className="layout-footer-bottom-link">Contact</span>
        </div>
      </div>
    </footer>
  );
}
