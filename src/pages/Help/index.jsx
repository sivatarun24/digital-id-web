import { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicNav from '../../components/layout/PublicNav';
import PublicFooter from '../../components/layout/PublicFooter';
import '../../styles/public.css';

const FAQ_DATA = [
  {
    q: 'What is Digital ID?',
    a: 'Digital ID is a secure identity verification platform that lets you prove who you are online. Once verified, you can use your Digital ID to access government services, unlock exclusive discounts, and sign in to partner websites — all with a single trusted account.',
  },
  {
    q: 'How do I verify my identity?',
    a: "Create an account, then follow the verification prompts: upload a photo of your government-issued ID (driver's license, passport, or state ID) and take a quick selfie. Our system matches the two in real time. The process typically takes under 5 minutes.",
  },
  {
    q: 'What documents are accepted for verification?',
    a: "We accept U.S. driver's licenses, state-issued ID cards, U.S. passports, and passport cards. For military verification, we use official Department of Defense records. Student verification is done through enrollment databases.",
  },
  {
    q: 'Is my personal information safe?',
    a: 'Yes. We use bank-grade AES-256 encryption for data at rest and TLS 1.3 for data in transit. We are SOC 2 Type II certified and comply with federal identity proofing standards (NIST 800-63-3 IAL2). We never sell your personal data.',
  },
  {
    q: 'How long does verification take?',
    a: "Most verifications are completed in under 5 minutes. In some cases, manual review may be needed, which can take up to 24 hours. You'll receive an email notification once your verification is complete.",
  },
  {
    q: 'Can I use Digital ID for government services?',
    a: 'Yes. Digital ID is a trusted credential provider for over 30 federal and state agencies, including the IRS, Social Security Administration, and Veterans Affairs. Once verified, you can use your Digital ID to sign in to these services.',
  },
  {
    q: 'What are group verifications?',
    a: 'Group verifications let you prove affiliation with a specific community — such as military service, student enrollment, first responder status, or teaching credentials — to access exclusive benefits and discounts from our partners.',
  },
  {
    q: "I'm having trouble verifying. What should I do?",
    a: "Make sure your ID photo is clear and well-lit, and that your selfie matches the photo on your document. If you continue to have issues, contact our support team at digitalid80@gmail.com and we'll help you through the process.",
  },
  {
    q: 'How do I delete my account?',
    a: 'You can request account deletion from the Settings page after signing in. Go to Settings → Danger Zone → Delete Account. Once confirmed, your data will be permanently removed within 30 days in accordance with our privacy policy.',
  },
];

const HELP_CARDS = [
  {
    gradient: 'linear-gradient(135deg, #059669, #047857)',
    Icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="8" cy="12" r="2" /><path d="M14 10h4M14 14h3" />
      </svg>
    ),
    title: 'Identity Verification',
    desc: 'Step-by-step guide to uploading your documents and completing verification.',
  },
  {
    gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    Icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Account Security',
    desc: 'Learn about two-factor authentication, session management, and data protection.',
  },
  {
    gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    Icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    title: 'Connected Services',
    desc: 'Manage which services can access your Digital ID and revoke access anytime.',
  },
  {
    gradient: 'linear-gradient(135deg, #ea580c, #c2410c)',
    Icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
    title: 'Group Credentials',
    desc: 'Verify military, student, first responder, and other affiliations for exclusive benefits.',
  },
];

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={'pub-accord-item' + (open ? ' open' : '')}>
      <button type="button" className="pub-accord-btn" onClick={() => setOpen((v) => !v)}>
        <span className="pub-accord-q">{item.q}</span>
        <span className="pub-accord-icon"><PlusIcon /></span>
      </button>
      {open && <p className="pub-accord-answer">{item.a}</p>}
    </div>
  );
}

export default function Help() {
  return (
    <div className="public-page">
      <PublicNav />

      <div className="pub-hero-grad">
        <h1>How Can We Help?</h1>
        <p>
          Find answers to common questions about Digital ID, identity
          verification, and your account.
        </p>
      </div>

      <div className="public-content">

        <div className="pub-help-grid">
          {HELP_CARDS.map((c) => (
            <div className="pub-help-card" key={c.title} style={{ background: c.gradient }}>
              <div className="pub-help-card-icon"><c.Icon /></div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="pub-section-head">
          <h2>Frequently Asked Questions</h2>
          <p>Click any question to expand the answer.</p>
        </div>

        <div className="pub-accord">
          {FAQ_DATA.map((item) => (
            <FaqItem key={item.q} item={item} />
          ))}
        </div>

        <div className="pub-cta">
          <h2>Still Need Help?</h2>
          <p>Our support team is available 24/7 to assist you.</p>
          <a href="mailto:digitalid80@gmail.com" className="pub-cta-btn">
            Contact Support
          </a>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
