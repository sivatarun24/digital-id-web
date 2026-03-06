import { Link } from 'react-router-dom';
import PublicNav from '../components/PublicNav';
import './PublicPage.css';

export default function Solutions() {
  const solutions = [
    {
      icon: '🏛️',
      title: 'Government Services',
      desc: 'Securely access federal, state, and local government services including the IRS, VA, SSA, and more with a single verified identity.',
    },
    {
      icon: '🏥',
      title: 'Healthcare',
      desc: 'Verify your identity to access telehealth, patient portals, prescription services, and health insurance marketplaces.',
    },
    {
      icon: '🎓',
      title: 'Education',
      desc: 'Unlock student discounts, access university portals, and verify enrollment status for financial aid and benefits.',
    },
    {
      icon: '🎖️',
      title: 'Military & Veterans',
      desc: 'Verify active duty, veteran, or dependent status to access exclusive benefits, discounts, and VA services.',
    },
    {
      icon: '💰',
      title: 'Financial Services',
      desc: 'Meet KYC requirements, open accounts, and access financial platforms with a trusted verified identity.',
    },
    {
      icon: '💼',
      title: 'Employment',
      desc: 'Streamline background checks, verify work eligibility, and onboard faster with pre-verified credentials.',
    },
    {
      icon: '🛒',
      title: 'Retail & Commerce',
      desc: 'Offer verified group discounts to military, students, first responders, and other communities.',
    },
    {
      icon: '🔒',
      title: 'Cybersecurity',
      desc: 'Strengthen access controls with identity-proofed multi-factor authentication and zero-trust verification.',
    },
    {
      icon: '🚒',
      title: 'First Responders',
      desc: 'Verify EMT, firefighter, and law enforcement credentials for exclusive benefits and rapid-access programs.',
    },
  ];

  return (
    <div className="public-page">
      <PublicNav />
      <div className="public-content">
        <div className="pub-hero">
          <h1>Identity Solutions for Every Industry</h1>
          <p>
            Digital ID provides secure identity verification and group affiliation
            services for government agencies, enterprises, and organizations of
            all sizes.
          </p>
        </div>

        <div className="pub-grid">
          {solutions.map((s) => (
            <div className="pub-card" key={s.title}>
              <span className="pub-card-icon">{s.icon}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="pub-cta">
          <h2>Ready to Get Started?</h2>
          <p>Create your Digital ID and verify your identity in minutes.</p>
          <Link to="/register" className="pub-cta-btn">Create Your Digital ID</Link>
        </div>
      </div>

      <footer className="pub-footer">
        <p>© {new Date().getFullYear()} Digital ID. All rights reserved.</p>
      </footer>
    </div>
  );
}
