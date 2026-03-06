import { Link } from 'react-router-dom';
import PublicNav from '../../components/layout/PublicNav';
import '../../styles/public.css';

export default function About() {
  const values = [
    {
      icon: '🔐',
      title: 'Security First',
      desc: 'We use bank-grade encryption, biometric verification, and strict data protection standards to keep your information safe.',
    },
    {
      icon: '🤝',
      title: 'Privacy by Design',
      desc: 'You control what information is shared and with whom. We never sell your data to third parties.',
    },
    {
      icon: '⚡',
      title: 'Simplicity',
      desc: 'Verifying your identity should be easy. Our streamlined process takes minutes, not days.',
    },
    {
      icon: '🌍',
      title: 'Inclusion',
      desc: 'We design for accessibility and work to ensure that everyone can prove who they are, regardless of background.',
    },
    {
      icon: '✅',
      title: 'Trust & Transparency',
      desc: 'We are certified and compliant with federal identity standards including NIST 800-63-3 IAL2.',
    },
    {
      icon: '💡',
      title: 'Innovation',
      desc: 'We continuously invest in AI, biometrics, and fraud detection to stay ahead of evolving threats.',
    },
  ];

  return (
    <div className="public-page">
      <PublicNav />
      <div className="public-content">
        <div className="pub-hero">
          <h1>Trusted by Millions to Prove Who They Are</h1>
          <p>
            Digital ID is a secure digital identity platform that makes it easy
            for people to verify their identity online and for organizations to
            ensure they're interacting with real people.
          </p>
        </div>

        <div className="pub-stats">
          <div className="pub-stat">
            <span className="pub-stat-number">100M+</span>
            <span className="pub-stat-label">Verified Users</span>
          </div>
          <div className="pub-stat">
            <span className="pub-stat-number">600+</span>
            <span className="pub-stat-label">Partner Organizations</span>
          </div>
          <div className="pub-stat">
            <span className="pub-stat-number">30+</span>
            <span className="pub-stat-label">Government Agencies</span>
          </div>
        </div>

        <h2 className="pub-section-title">Our Mission</h2>
        <p className="pub-section-subtitle" style={{ maxWidth: 640, margin: '0 auto 2.5rem' }}>
          We believe everyone deserves a simple, secure way to prove their
          identity. Our mission is to make the digital world safer by providing
          trusted identity verification that protects people and organizations
          from fraud while removing barriers to access.
        </p>

        <h2 className="pub-section-title">Our Values</h2>
        <p className="pub-section-subtitle">The principles that guide everything we build.</p>
        <div className="pub-values">
          {values.map((v) => (
            <div className="pub-value" key={v.title}>
              <span className="pub-value-icon">{v.icon}</span>
              <div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pub-cta">
          <h2>Join the Trust Network</h2>
          <p>Create your verified digital identity and access services with confidence.</p>
          <Link to="/register" className="pub-cta-btn">Get Started</Link>
        </div>
      </div>

      <footer className="pub-footer">
        <p>© {new Date().getFullYear()} Digital ID. All rights reserved.</p>
      </footer>
    </div>
  );
}
