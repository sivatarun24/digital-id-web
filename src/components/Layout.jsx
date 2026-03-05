import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Layout.css';

export default function Layout({ user, onLogout, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

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
    onLogout();
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
          <Link to="/home" className="layout-logo">My App</Link>

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
                <Link to="/home" className="layout-dropdown-item" onClick={() => setMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/profile" className="layout-dropdown-item" onClick={() => setMenuOpen(false)}>
                  Profile
                </Link>
                <Link to="/settings" className="layout-dropdown-item" onClick={() => setMenuOpen(false)}>
                  Settings
                </Link>
                <div className="layout-dropdown-divider" />
                <button type="button" className="layout-dropdown-item layout-dropdown-logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="layout-main">{children}</main>

      <footer className="layout-footer">
        <div className="layout-footer-inner">
          <p>© {new Date().getFullYear()} My App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
