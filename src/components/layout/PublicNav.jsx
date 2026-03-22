import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const HamburgerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6"  x2="21" y2="6"  />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6"  x2="6"  y2="18" />
    <line x1="6"  y1="6"  x2="18" y2="18" />
  </svg>
);

export default function PublicNav() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);

  const links = [
    { to: '/solutions', label: 'Solutions' },
    { to: '/verify',    label: 'Verify'    },
    { to: '/about',     label: 'About'     },
    { to: '/help',      label: 'Help'      },
  ];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Close on route change — derived state pattern (useState comparison during render)
  const [trackedPath, setTrackedPath] = useState(pathname);
  if (trackedPath !== pathname) {
    setTrackedPath(pathname);
    setOpen(false);
  }

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <nav className="auth-nav" ref={navRef}>
      <Link to="/" className="auth-logo">Digital ID</Link>

      {/* Desktop links */}
      <div className="auth-nav-links">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className={pathname === l.to ? 'active' : ''}>
            {l.label}
          </Link>
        ))}
        <Link to="/login" className="pub-nav-signin">Sign in</Link>
      </div>

      {/* Mobile hamburger */}
      <button
        className="pub-nav-hamburger"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        {open ? <CloseIcon /> : <HamburgerIcon />}
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="pub-nav-mobile-menu">
          <div className="pub-nav-mobile-links">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={'pub-nav-mobile-link' + (pathname === l.to ? ' active' : '')}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="pub-nav-mobile-divider" />
          <Link to="/login" className="pub-nav-mobile-signin" onClick={() => setOpen(false)}>
            Sign in
          </Link>
        </div>
      )}
    </nav>
  );
}
