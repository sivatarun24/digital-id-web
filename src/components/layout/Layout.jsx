import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { HEADER_NAV, ACCOUNT_NAV } from '../../constants/navigation';
import './Layout.css';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpenPath, setMobileNavOpenPath] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const mobileNavOpen = mobileNavOpenPath === location.pathname;

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate('/login');
  }

  const initials = (user?.name || user?.username || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-inner">

          {/* Logo */}
          <Link to="/home" className="layout-logo">
            <span className="layout-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            Digital ID
          </Link>

          {/* Desktop nav */}
          <nav className="layout-header-nav">
            {HEADER_NAV.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={'layout-header-link' + (location.pathname === item.path ? ' active' : '')}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="layout-header-right">
            {/* Notification bell */}
            <Link
              to="/notifications"
              className={'layout-notif-btn' + (location.pathname === '/notifications' ? ' active' : '')}
              aria-label="Notifications"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </Link>

            {/* Avatar / dropdown */}
            <div className="layout-user-menu" ref={menuRef}>
              <button
                type="button"
                className="layout-avatar"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="User menu"
              >
                {initials}
              </button>

              {menuOpen && (
                <div className="layout-dropdown">
                  <div className="layout-dropdown-header">
                    <span className="layout-dropdown-name">{user?.name || user?.username}</span>
                    <span className="layout-dropdown-email">{user?.email}</span>
                  </div>
                  <div className="layout-dropdown-divider" />
                  {ACCOUNT_NAV.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={'layout-dropdown-item' + (location.pathname === item.path ? ' active' : '')}
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="layout-dropdown-divider" />
                  <button
                    type="button"
                    className="layout-dropdown-item layout-dropdown-logout"
                    onClick={handleLogout}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="layout-mobile-toggle"
              onClick={() => setMobileNavOpenPath((p) => p === location.pathname ? null : location.pathname)}
              aria-label="Toggle menu"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileNavOpen
                  ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                  : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileNavOpen && (
          <nav className="layout-mobile-nav">
            {[...HEADER_NAV, ...ACCOUNT_NAV].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={'layout-mobile-link' + (location.pathname === item.path ? ' active' : '')}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="layout-main">{children}</main>

      <footer className="layout-footer">
        <div className="layout-footer-inner">

          {/* Brand */}
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

          {/* Features */}
          <div className="layout-footer-col">
            <span className="layout-footer-col-title">Features</span>
            {HEADER_NAV.map((item) => (
              <Link key={item.path} to={item.path} className="layout-footer-link">{item.label}</Link>
            ))}
          </div>

          {/* Account */}
          <div className="layout-footer-col">
            <span className="layout-footer-col-title">Account</span>
            {ACCOUNT_NAV.map((item) => (
              <Link key={item.path} to={item.path} className="layout-footer-link">{item.label}</Link>
            ))}
          </div>

          {/* Security */}
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
    </div>
  );
}
