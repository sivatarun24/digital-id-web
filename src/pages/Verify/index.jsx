import { Link } from 'react-router-dom';
import PublicNav from '../../components/layout/PublicNav';
import '../../styles/public.css';

export default function Verify() {
  const steps = [
    {
      num: 1,
      title: 'Create Account',
      desc: 'Sign up with your email, phone number, and a secure password.',
    },
    {
      num: 2,
      title: 'Upload Documents',
      desc: 'Upload a government-issued ID such as a driver\'s license or passport.',
    },
    {
      num: 3,
      title: 'Selfie Verification',
      desc: 'Take a quick selfie to confirm your identity matches your document.',
    },
    {
      num: 4,
      title: 'You\'re Verified!',
      desc: 'Access hundreds of services with your verified Digital ID.',
    },
  ];

  const verificationTypes = [
    {
      icon: '🪪',
      title: 'Identity Verification',
      desc: 'Verify your legal identity using government-issued documents. Required for accessing government services, financial platforms, and more.',
    },
    {
      icon: '🎖️',
      title: 'Military Verification',
      desc: 'Prove active duty, veteran, reserve, or military dependent status through official records to unlock exclusive benefits.',
    },
    {
      icon: '🎓',
      title: 'Student Verification',
      desc: 'Confirm your enrollment at an accredited college or university to access student discounts and educational resources.',
    },
    {
      icon: '🚒',
      title: 'First Responder Verification',
      desc: 'Verify your status as an EMT, firefighter, paramedic, or law enforcement officer for special programs.',
    },
    {
      icon: '👩‍🏫',
      title: 'Teacher Verification',
      desc: 'Confirm your employment as an educator at a K–12 school or higher education institution.',
    },
    {
      icon: '🏥',
      title: 'Healthcare Worker Verification',
      desc: 'Verify your credentials as a nurse, doctor, or medical professional for healthcare-specific benefits.',
    },
  ];

  return (
    <div className="public-page">
      <PublicNav />
      <div className="public-content">
        <div className="pub-hero">
          <h1>Verify Your Identity in Minutes</h1>
          <p>
            Our secure verification process uses advanced technology to confirm
            your identity quickly, so you can access the services and benefits
            you need.
          </p>
        </div>

        <h2 className="pub-section-title">How It Works</h2>
        <p className="pub-section-subtitle">Four simple steps to a verified digital identity.</p>
        <div className="pub-steps">
          {steps.map((s) => (
            <div className="pub-step" key={s.num}>
              <div className="pub-step-number">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="pub-section-title">Types of Verification</h2>
        <p className="pub-section-subtitle">Choose the verification that fits your needs.</p>
        <div className="pub-grid">
          {verificationTypes.map((v) => (
            <div className="pub-card" key={v.title}>
              <span className="pub-card-icon">{v.icon}</span>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="pub-cta">
          <h2>Start Your Verification Today</h2>
          <p>Join millions of users who trust Digital ID for secure identity verification.</p>
          <Link to="/register" className="pub-cta-btn">Get Verified Now</Link>
        </div>
      </div>

      <footer className="pub-footer">
        <p>© {new Date().getFullYear()} Digital ID. All rights reserved.</p>
      </footer>
    </div>
  );
}
