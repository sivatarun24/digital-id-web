import { useEffect } from 'react';

const TERMS_CONTENT = (
  <>
    <p className="legal-date">Last updated: March 22, 2026</p>

    <h3>1. Acceptance of Terms</h3>
    <p>By creating a Digital ID account and using our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use our services.</p>

    <h3>2. Account Creation & Security</h3>
    <p>You must provide accurate, complete, and current information during registration. You are responsible for maintaining the confidentiality of your password and for all activities that occur under your account. You must notify us immediately of any unauthorised use of your account.</p>

    <h3>3. Identity Verification</h3>
    <p>Our platform provides identity verification services. You agree to submit only genuine documents that belong to you. Submitting false or fraudulent documents is strictly prohibited and may result in permanent account suspension and referral to appropriate authorities.</p>

    <h3>4. Acceptable Use</h3>
    <p>You agree not to use our services to:</p>
    <ul>
      <li>Violate any applicable laws or regulations</li>
      <li>Submit fraudulent identity documents</li>
      <li>Impersonate any person or entity</li>
      <li>Attempt to gain unauthorised access to our systems</li>
      <li>Interfere with the proper functioning of the platform</li>
    </ul>

    <h3>5. Data Retention</h3>
    <p>Uploaded documents and personal data are retained in accordance with applicable data protection laws. You may request deletion of your data at any time by contacting our support team, subject to legal retention requirements.</p>

    <h3>6. Limitation of Liability</h3>
    <p>Digital ID and its affiliates shall not be liable for any indirect, incidental, special, or consequential damages arising out of or related to your use of our services, to the maximum extent permitted by applicable law.</p>

    <h3>7. Changes to Terms</h3>
    <p>We reserve the right to modify these terms at any time. We will notify you of significant changes via email or through the platform. Continued use of our services after such changes constitutes your acceptance of the new terms.</p>

    <h3>8. Governing Law</h3>
    <p>These terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration or in the competent courts of the relevant jurisdiction.</p>

    <h3>9. Contact</h3>
    <p>For questions about these Terms of Service, please contact us at <strong>legal@digitalid.example.com</strong>.</p>
  </>
);

const PRIVACY_CONTENT = (
  <>
    <p className="legal-date">Last updated: March 22, 2026</p>

    <h3>1. Information We Collect</h3>
    <p>We collect the following categories of information:</p>
    <ul>
      <li><strong>Account data:</strong> Name, username, email address, phone number, date of birth, gender</li>
      <li><strong>Identity documents:</strong> Government-issued ID images (front/back) submitted for verification</li>
      <li><strong>Biometric data:</strong> Selfie images used for identity verification comparison</li>
      <li><strong>Usage data:</strong> Login history, activity logs, connected services</li>
      <li><strong>Device data:</strong> IP address, browser type, operating system</li>
    </ul>

    <h3>2. How We Use Your Information</h3>
    <p>Your information is used to:</p>
    <ul>
      <li>Create and manage your Digital ID account</li>
      <li>Verify your identity against submitted documents</li>
      <li>Provide access to connected third-party services</li>
      <li>Detect and prevent fraud and security threats</li>
      <li>Send transactional emails (verification, password reset, notifications)</li>
      <li>Comply with legal and regulatory obligations</li>
    </ul>

    <h3>3. Data Sharing</h3>
    <p>We do not sell your personal data. We may share data with:</p>
    <ul>
      <li><strong>Verification partners:</strong> To process identity verification requests</li>
      <li><strong>Connected services:</strong> Only with your explicit consent when you connect a service</li>
      <li><strong>Law enforcement:</strong> When required by law or to protect legal rights</li>
    </ul>

    <h3>4. Data Security</h3>
    <p>We implement industry-standard security measures including encryption in transit (TLS), encrypted storage for sensitive documents, JWT-based stateless authentication, and regular security audits. However, no method of transmission over the internet is 100% secure.</p>

    <h3>5. Your Rights</h3>
    <p>You have the right to:</p>
    <ul>
      <li>Access the personal data we hold about you</li>
      <li>Request correction of inaccurate data</li>
      <li>Request deletion of your data (subject to legal retention requirements)</li>
      <li>Withdraw consent for data processing where consent is the legal basis</li>
      <li>Data portability — receive your data in a structured, machine-readable format</li>
    </ul>

    <h3>6. Cookies & Tracking</h3>
    <p>We use essential session tokens stored in localStorage for authentication. We do not use third-party advertising cookies or cross-site tracking technologies.</p>

    <h3>7. Data Retention</h3>
    <p>Account data is retained for the lifetime of your account. Identity documents are retained for the minimum period required by applicable law. Activity logs are retained for 12 months.</p>

    <h3>8. Changes to This Policy</h3>
    <p>We may update this Privacy Policy periodically. We will notify you of material changes via email or a prominent notice on our platform. Your continued use of our services constitutes acceptance of the updated policy.</p>

    <h3>9. Contact</h3>
    <p>For privacy-related enquiries or to exercise your rights, contact our Data Protection Officer at <strong>privacy@digitalid.example.com</strong>.</p>
  </>
);

export default function LegalModal({ type, onClose }) {
  const isTerms = type === 'terms';
  const title = isTerms ? 'Terms of Service' : 'Privacy Policy';
  const content = isTerms ? TERMS_CONTENT : PRIVACY_CONTENT;

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="legal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="legal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="legal-modal-header">
          <h2 className="legal-modal-title">{title}</h2>
          <button className="legal-modal-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="legal-modal-body">
          {content}
        </div>
        <div className="legal-modal-footer">
          <button className="auth-btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
