import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Layout.css';

const NAV_ITEMS = [
  { path: '/home', label: 'Home', icon: '🏠' },
  { path: '/verify-identity', label: 'Verify Identity', icon: '🪪' },
  { path: '/credentials', label: 'Credentials', icon: '🎖️' },
  { path: '/wallet', label: 'Wallet', icon: '💳' },
  { path: '/documents', label: 'Documents', icon: '📄' },
  { path: '/services', label: 'Services', icon: '🔗' },
  { path: '/activity', label: 'Activity', icon: '📊' },
  { path: '/notifications', label: 'Notifications', icon: '🔔' },
  { path: '/profile', label: 'Profile', icon: '👤' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Layout({ user, onLogout, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

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
          <div className="layout-header-left">
            <button
              type="button"
              className="layout-mobile-toggle"
              onClick={() => setMobileSidebarOpen((v) => !v)}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <Link to="/home" className="layout-logo">Digital ID</Link>
          </div>

          <nav className="layout-header-nav">
            {NAV_ITEMS.slice(0, 5).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={'layout-header-link' + (location.pathname === item.path ? ' active' : '')}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="layout-header-right">
            <Link
              to="/notifications"
              className={'layout-notif-btn' + (location.pathname === '/notifications' ? ' active' : '')}
              aria-label="Notifications"
            >
              🔔
            </Link>

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
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={'layout-dropdown-item' + (location.pathname === item.path ? ' active' : '')}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="layout-dropdown-item-icon">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                  <div className="layout-dropdown-divider" />
                  <button type="button" className="layout-dropdown-item layout-dropdown-logout" onClick={handleLogout}>
                    <span className="layout-dropdown-item-icon">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="layout-body">
        <aside className={'layout-sidebar' + (sidebarCollapsed ? ' collapsed' : '') + (mobileSidebarOpen ? ' mobile-open' : '')}>
          <button
            type="button"
            className="layout-sidebar-toggle"
            onClick={() => setSidebarCollapsed((v) => !v)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '›' : '‹'}
          </button>
          <nav className="layout-sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={'layout-sidebar-link' + (location.pathname === item.path ? ' active' : '')}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className="layout-sidebar-icon">{item.icon}</span>
                {!sidebarCollapsed && <span className="layout-sidebar-label">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </aside>

        {mobileSidebarOpen && (
          <div
            className="layout-sidebar-backdrop"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <main className="layout-main">{children}</main>
      </div>

      <footer className="layout-footer">
        <div className="layout-footer-inner">
          <p>© {new Date().getFullYear()} Digital ID. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
