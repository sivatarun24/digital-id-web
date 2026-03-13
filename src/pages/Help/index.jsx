import { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicNav from '../../components/layout/PublicNav';
import '../../styles/public.css';

const FAQ_DATA = [
  {
    q: 'What is Digital ID?',
    a: 'Digital ID is a secure identity verification platform that lets you prove who you are online. Once verified, you can use your Digital ID to access government services, unlock exclusive discounts, and sign in to partner websites — all with a single trusted account.',
  },
  {
    q: 'How do I verify my identity?',
    a: 'Create an account, then follow the verification prompts: upload a photo of your government-issued ID (driver\'s license, passport, or state ID) and take a quick selfie. Our system matches the two in real time. The process typically takes under 5 minutes.',
  },
  {
    q: 'What documents are accepted for verification?',
    a: 'We accept U.S. driver\'s licenses, state-issued ID cards, U.S. passports, and passport cards. For military verification, we use official Department of Defense records. Student verification is done through enrollment databases.',
  },
  {
    q: 'Is my personal information safe?',
    a: 'Yes. We use bank-grade AES-256 encryption for data at rest and TLS 1.3 for data in transit. We are SOC 2 Type II certified and comply with federal identity proofing standards (NIST 800-63-3 IAL2). We never sell your personal data.',
  },
  {
    q: 'How long does verification take?',
    a: 'Most verifications are completed in under 5 minutes. In some cases, manual review may be needed, which can take up to 24 hours. You\'ll receive an email notification once your verification is complete.',
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
    q: 'I\'m having trouble verifying. What should I do?',
    a: 'Make sure your ID photo is clear and well-lit, and that your selfie matches the photo on your document. If you continue to have issues, contact our support team at digitalidastr@gmail.com and we\'ll help you through the process.',
  },
  {
    q: 'How do I delete my account?',
    a: 'You can request account deletion from the Settings page after signing in. Go to Settings → Danger Zone → Delete Account. Once confirmed, your data will be permanently removed within 30 days in accordance with our privacy policy.',
  },
];

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={'pub-faq-item' + (open ? ' open' : '')}>
      <button
        type="button"
        className="pub-faq-question"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{item.q}</span>
        <span className="pub-faq-chevron">▾</span>
      </button>
      {open && <div className="pub-faq-answer">{item.a}</div>}
    </div>
  );
}

export default function Help() {
  return (
    <div className="public-page">
      <PublicNav />
      <div className="public-content">
        <div className="pub-hero">
          <h1>How Can We Help?</h1>
          <p>
            Find answers to common questions about Digital ID, identity
            verification, and your account.
          </p>
        </div>

        <h2 className="pub-section-title">Frequently Asked Questions</h2>
        <p className="pub-section-subtitle">Click a question to expand the answer.</p>
        <div className="pub-faq">
          {FAQ_DATA.map((item) => (
            <FaqItem key={item.q} item={item} />
          ))}
        </div>

        <div className="pub-cta">
          <h2>Still Need Help?</h2>
          <p>Our support team is available 24/7 to assist you.</p>
          <a href="mailto:digitalidastr@gmail.com" className="pub-cta-btn">
            Contact Support
          </a>
        </div>
      </div>

      <footer className="pub-footer">
        <p>© {new Date().getFullYear()} Digital ID. All rights reserved.</p>
      </footer>
    </div>
  );
}
