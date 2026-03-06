import { Link, useLocation } from 'react-router-dom';

export default function PublicNav() {
  const { pathname } = useLocation();

  const links = [
    { to: '/solutions', label: 'Solutions' },
    { to: '/verify', label: 'Verify' },
    { to: '/about', label: 'About' },
    { to: '/help', label: 'Help' },
  ];

  return (
    <nav className="auth-nav">
      <Link to="/" className="auth-logo">Digital ID</Link>
      <div className="auth-nav-links">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={pathname === l.to ? 'active' : ''}
          >
            {l.label}
          </Link>
        ))}
        <Link to="/login" className="pub-nav-signin">Sign In</Link>
      </div>
    </nav>
  );
}
