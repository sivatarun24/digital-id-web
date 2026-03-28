import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCredentials, startCredentialVerification, submitCredentialDocument, requestCredentialEmailVerification } from '../../api/credentials';
import { openDocumentFile } from '../../api/documents';
import { fetchVerificationStatus } from '../../api/verifyIdentity';
import './Credentials.css';

// ── Icons ──────────────────────────────────────────────────────────────────────

const Icon = {
  Military:       () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>),
  Student:        () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>),
  FirstResponder: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="10" y1="10" x2="14" y2="10" /></svg>),
  Teacher:        () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>),
  Healthcare:     () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>),
  Government:     () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14" /><path d="M9 21v-4h6v4" /></svg>),
  Senior:         () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4" /><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /></svg>),
  Nonprofit:      () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>),
  Lock:           () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>),
  Upload:         () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>),
  Check:          () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>),
  ArrowLeft:      () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>),
  FileText:       () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" /></svg>),
  RefreshCw:      () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>),
  ExternalLink:   () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3h7v7" /><path d="M10 14L21 3" /><path d="M21 14v7H3V3h7" /></svg>),
  Email:         () => (<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent, #059669)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>),
};

const CREDENTIAL_ICON_MAP = {
  military:       Icon.Military,
  student:        Icon.Student,
  first_responder:Icon.FirstResponder,
  teacher:        Icon.Teacher,
  healthcare:     Icon.Healthcare,
  government:     Icon.Government,
  senior:         Icon.Senior,
  nonprofit:      Icon.Nonprofit,
};

// ── Constants ──────────────────────────────────────────────────────────────────

const CREDENTIAL_CATEGORIES = [
  { id: 'military',       label: 'Military',           desc: 'Active duty, veterans, reservists, and military dependents',      docHint: 'Upload your military ID, DD-214, or VA card.', emailRequired: true,  emailSuffix: '.mil or .gov' },
  { id: 'student',        label: 'Student',            desc: 'Currently enrolled college or university students',               docHint: 'Upload your student ID or current enrollment letter.', emailRequired: true,  emailSuffix: '.edu' },
  { id: 'first_responder',label: 'First Responder',    desc: 'EMTs, firefighters, law enforcement, and 911 dispatchers',        docHint: 'Upload your official badge, ID, or employment letter.', emailRequired: true,  emailSuffix: '.gov or department domain' },
  { id: 'teacher',        label: 'Teacher',            desc: 'K–12 educators and higher education faculty',                    docHint: 'Upload your school-issued ID or employment verification letter.', emailRequired: true,  emailSuffix: '.edu or .org' },
  { id: 'healthcare',     label: 'Healthcare Worker',  desc: 'Nurses, doctors, pharmacists, and medical staff',                docHint: 'Upload your medical license, hospital ID, or employment letter.', emailRequired: true,  emailSuffix: '.gov, .edu or hospital domain' },
  { id: 'government',     label: 'Government Employee',desc: 'Federal, state, and local government employees',                 docHint: 'Upload your government-issued employee ID or pay stub.', emailRequired: true,  emailSuffix: '.gov or .mil' },
  { id: 'senior',         label: 'Senior (55+)',        desc: 'Age 55 and older verification',                                  docHint: 'Upload a government-issued ID showing your date of birth.', emailRequired: false },
  { id: 'nonprofit',      label: 'Nonprofit Worker',   desc: 'Employees of registered nonprofit organizations',                docHint: 'Upload your employee ID or a letter from your organization.', emailRequired: true,  emailSuffix: '.org' },
];

const CREDENTIAL_FIELDS = {
  military: [
    { id: 'branch', label: 'Branch of Service', type: 'select', required: true, options: ['Army', 'Navy', 'Air Force', 'Marine Corps', 'Coast Guard', 'Space Force'] },
    { id: 'rank', label: 'Rank / Rate', type: 'text', required: true, placeholder: 'e.g. Sergeant, Lieutenant, Petty Officer' },
    { id: 'serviceStartDate', label: 'Service Start Date', type: 'date', required: true },
    { id: 'currentlyServing', label: 'Currently Serving', type: 'checkbox', required: false },
    { id: 'serviceEndDate', label: 'Separation / Discharge Date', type: 'date', required: false },
    { id: 'dischargeType', label: 'Discharge Type', type: 'select', required: false, options: ['Honorable', 'General (Under Honorable Conditions)', 'Other than Honorable', 'Bad Conduct', 'Dishonorable', 'N/A — Currently Serving'] },
  ],
  student: [
    { id: 'schoolName', label: 'School / University Name', type: 'text', required: true, placeholder: 'e.g. University of California, Los Angeles' },
    { id: 'enrollmentStatus', label: 'Enrollment Status', type: 'select', required: true, options: ['Full-time', 'Part-time'] },
    { id: 'major', label: 'Major / Field of Study', type: 'text', required: false, placeholder: 'e.g. Computer Science' },
    { id: 'studentId', label: 'Student ID Number', type: 'text', required: false, placeholder: 'e.g. STU-123456' },
    { id: 'graduationDate', label: 'Expected Graduation Date', type: 'month', required: false },
  ],
  first_responder: [
    { id: 'agencyName', label: 'Agency / Department Name', type: 'text', required: true, placeholder: 'e.g. FDNY, Los Angeles Police Department' },
    { id: 'role', label: 'Role / Position', type: 'select', required: true, options: ['Firefighter', 'EMT', 'Paramedic', 'Police Officer', 'Sheriff Deputy', '911 Dispatcher', 'Search & Rescue', 'Corrections Officer', 'Other'] },
    { id: 'badgeNumber', label: 'Badge / ID Number', type: 'text', required: false, placeholder: 'e.g. 4821' },
    { id: 'employmentStartDate', label: 'Employment Start Date', type: 'date', required: false },
  ],
  teacher: [
    { id: 'schoolName', label: 'School / Institution Name', type: 'text', required: true, placeholder: 'e.g. Lincoln High School' },
    { id: 'teachingLevel', label: 'Teaching Level', type: 'select', required: true, options: ['Elementary (K–5)', 'Middle School (6–8)', 'High School (9–12)', 'Higher Education', 'Special Education', 'Adult Education', 'Other'] },
    { id: 'subject', label: 'Subject(s) Taught', type: 'text', required: false, placeholder: 'e.g. Mathematics, Biology' },
    { id: 'employeeId', label: 'Employee ID', type: 'text', required: false, placeholder: 'e.g. EMP-00234' },
    { id: 'employmentStartDate', label: 'Employment Start Date', type: 'date', required: false },
  ],
  healthcare: [
    { id: 'licenseType', label: 'License / Role Type', type: 'select', required: true, options: ['Physician (MD/DO)', 'Registered Nurse (RN)', 'Licensed Practical Nurse (LPN)', 'Nurse Practitioner (NP)', 'Physician Assistant (PA)', 'Pharmacist', 'Physical Therapist', 'Dentist', 'Dental Hygienist', 'Paramedic', 'Medical Technician', 'Other'] },
    { id: 'licenseNumber', label: 'License / Certification Number', type: 'text', required: false, placeholder: 'e.g. RN-123456' },
    { id: 'issuingState', label: 'Issuing State', type: 'text', required: false, placeholder: 'e.g. California' },
    { id: 'employer', label: 'Current Employer / Hospital', type: 'text', required: false, placeholder: 'e.g. Mayo Clinic, VA Medical Center' },
  ],
  government: [
    { id: 'agencyName', label: 'Agency / Department', type: 'text', required: true, placeholder: 'e.g. Department of Veterans Affairs' },
    { id: 'position', label: 'Position / Title', type: 'text', required: true, placeholder: 'e.g. Program Analyst, Police Officer' },
    { id: 'level', label: 'Government Level', type: 'select', required: true, options: ['Federal', 'State', 'County', 'Municipal / City'] },
    { id: 'employeeId', label: 'Employee ID / Badge Number', type: 'text', required: false, placeholder: 'e.g. GS-12-000001' },
  ],
  senior: [
    { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, note: 'Must be 55 or older to qualify.' },
  ],
  nonprofit: [
    { id: 'orgName', label: 'Organization Name', type: 'text', required: true, placeholder: 'e.g. Habitat for Humanity' },
    { id: 'ein', label: 'EIN (Employer Identification Number)', type: 'text', required: false, placeholder: 'e.g. 12-3456789' },
    { id: 'position', label: 'Your Position / Title', type: 'text', required: true, placeholder: 'e.g. Program Coordinator' },
    { id: 'orgType', label: 'Organization Type', type: 'select', required: false, options: ['501(c)(3) Charitable', '501(c)(4) Civic League', '501(c)(6) Business League', 'Religious Organization', 'Other'] },
    { id: 'employmentStartDate', label: 'Employment Start Date', type: 'date', required: false },
  ],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const getDetailedReason = (reason, credLabel = 'credential') => {
  if (!reason) return "We were unable to verify your credential. Please check your submission details and try again.";
  
  const r = reason.toLowerCase();
  if (r.includes('name mismatch')) {
    return "The name found on the document does not match your profile name. Please provide a document that clearly displays your full legal name and is not obscured.";
  }
  if (r.includes('inconclusive document type')) {
    return `We found your name, but the document does not appear to be an official ${credLabel}. Please provide a standard identification card or certificate specifically for this category.`;
  }
  if (r.includes('no text found')) {
    return "Our validation system was unable to read any text from the image. Please upload a clearer, high-resolution photo with better lighting and no glare.";
  }
  if (r.includes('email verified')) {
    const sub = reason.split(':').pop().trim();
    return `Email verified! However, document check failed: ${getDetailedReason(sub, credLabel)}`;
  }
  
  return reason;
};

const WIZARD_STEPS = [
  { id: 'info',     label: 'Information' },
  { id: 'document', label: 'Document' },
  { id: 'review',   label: 'Review' },
  { id: 'success',  label: 'Done' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function statusNormalized(s) {
  if (!s) return 'not-started';
  return s.toLowerCase();
}

function StatusBadge({ status }) {
  const s = statusNormalized(status);
  if (s === 'verified')    return <span className="cp-badge-verified">Verified</span>;
  if (s === 'pending')     return <span className="cp-badge-pending">Pending</span>;
  if (s === 'rejected')    return <span className="cp-badge-rejected">Rejected</span>;
  return <span className="cp-badge-inactive">Not Started</span>;
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── CredentialWizard ───────────────────────────────────────────────────────────

function CredentialWizard({ cred, onCancel, onSubmitted }) {
  const [step, setStep]               = useState(0);
  const [fieldValues, setFieldValues] = useState({});
  const [file, setFile]               = useState(null);
  const [dragOver, setDragOver]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [result, setResult] = useState(null);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [polledStatus, setPolledStatus] = useState('PENDING');
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const dropRef = useRef(null);

  const handleRestart = () => {
    setStep(0);
    setFile(null);
    setVerificationEmail('');
    setPolledStatus('PENDING');
    setEmailConfirmed(false);
    setRejectionReason('');
    setSubmitError(null);
  };

  useEffect(() => {
    if (step !== 3 || polledStatus !== 'PENDING') return;

    const interval = setInterval(async () => {
      try {
        const credentials = await fetchCredentials();
        const current = credentials.find(c => 
          c.credentialType.toLowerCase() === cred.id.toLowerCase()
        );
        const status = current?.status?.toLowerCase();
        
        if (current?.verifiedAt && !emailConfirmed) {
          setEmailConfirmed(true);
        }

        if (status === 'verified' || status === 'rejected') {
          setPolledStatus(status);
          if (current) {
            setResult(prev => ({ ...prev, credential: current }));
          }
          if (status === 'rejected') {
            setRejectionReason(current?.reviewerNotes || '');
          }
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [step, polledStatus, cred.id, emailConfirmed]);

  const fields = CREDENTIAL_FIELDS[cred.id] || [];

  function setField(id, value) {
    setFieldValues((prev) => ({ ...prev, [id]: value }));
  }

  function isInfoValid() {
    return fields.every((f) => {
      if (!f.required) return true;
      if (f.type === 'checkbox') return true;
      const v = fieldValues[f.id];
      return v !== undefined && v !== null && String(v).trim() !== '';
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    setIsAnalyzing(true);
    
    try {
      // Step 1: Start the verification with form fields
      await startCredentialVerification(cred.id, fieldValues);
      
      // Step 2: Submit document and verification email
      const res = await submitCredentialDocument(cred.id, file, verificationEmail);
      setResult(res);
      if (res.autoVerified) {
        setPolledStatus(res.credential.status);
      }
      setStep(3);
    } catch (err) {
      setSubmitError(err.message);
      setSubmitting(false);
      setIsAnalyzing(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }

  // ── Step 0: Information ────────────────────────────────────────────────────

  function renderInfo() {
    return (
      <div className="cp-wizard-body">
        <h3 className="cp-wizard-step-title">Tell us about your {cred.label} affiliation</h3>
        <p className="cp-wizard-step-desc">Fill in the details below. Required fields are marked with *.</p>
        <div className="cp-fields">
          {fields.map((f) => (
            <div key={f.id} className="cp-field">
              <label className="cp-field-label">
                {f.label}
                {f.required && <span className="cp-field-required"> *</span>}
              </label>
              {f.note && <div className="cp-field-note">{f.note}</div>}
              {f.type === 'select' ? (
                <select
                  className="cp-field-input"
                  value={fieldValues[f.id] ?? ''}
                  onChange={(e) => setField(f.id, e.target.value)}
                >
                  <option value="">Select…</option>
                  {f.options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : f.type === 'checkbox' ? (
                <label className="cp-field-checkbox-label">
                  <input
                    type="checkbox"
                    className="cp-field-checkbox"
                    checked={!!fieldValues[f.id]}
                    onChange={(e) => setField(f.id, e.target.checked)}
                  />
                  <span className="cp-field-checkbox-text">{f.label}</span>
                </label>
              ) : (
                <input
                  className="cp-field-input"
                  type={f.type}
                  placeholder={f.placeholder ?? ''}
                  value={fieldValues[f.id] ?? ''}
                  onChange={(e) => setField(f.id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <div className="cp-actions">
          <button type="button" className="cp-btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="cp-btn-primary"
            disabled={!isInfoValid()}
            onClick={() => setStep(1)}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ── Step 1: Document ───────────────────────────────────────────────────────

  function renderDocument() {
    return (
      <div className="cp-wizard-body">
        <h3 className="cp-wizard-step-title">Upload supporting document</h3>
        <p className="cp-wizard-step-desc">{cred.docHint}</p>
        
        {cred.emailRequired && (
          <div className="cp-field" style={{ marginBottom: '24px' }}>
            <label className="cp-field-label">
              Professional / Official Email
              <span className="cp-field-required"> *</span>
            </label>
            <input
              className="cp-field-input"
              type="email"
              placeholder={cred.emailSuffix ? `e.g. name@institutional${cred.emailSuffix}` : "e.g. name@agency.gov"}
              value={verificationEmail}
              onChange={(e) => setVerificationEmail(e.target.value)}
              required
            />
            <div className="cp-field-note">
              Please use your official email {cred.emailSuffix ? `ending in ${cred.emailSuffix}` : ''}.
              We will send a verification link to this address after you upload your documents.
            </div>
          </div>
        )}

        <div
          ref={dropRef}
          className={'cp-drop-zone' + (dragOver ? ' drag-over' : '') + (file ? ' has-file' : '')}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {file ? (
            <>
              <span className="cp-drop-icon"><Icon.FileText /></span>
              <div className="cp-drop-text">{file.name}</div>
              <div className="cp-drop-hint">{(file.size / 1024).toFixed(0)} KB — click to replace</div>
              <label className="cp-choose-btn">
                Replace file
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
                />
              </label>
            </>
          ) : (
            <>
              <span className="cp-drop-icon"><Icon.Upload /></span>
              <div className="cp-drop-text">Drag & drop your file here</div>
              <div className="cp-drop-hint">JPEG, PNG, WebP, or PDF — max 10 MB</div>
              <label className="cp-choose-btn">
                Choose file
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
                />
              </label>
            </>
          )}
        </div>
        <p className="cp-drop-skip-note">You can skip this step and upload a document later.</p>
        <div className="cp-actions">
          <button type="button" className="cp-btn-outline" onClick={() => setStep(0)}>
            Back
          </button>
          <button
            type="button"
            className="cp-btn-primary"
            onClick={() => setStep(2)}
            disabled={cred.id !== 'senior' && (!verificationEmail || !verificationEmail.includes('@'))}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ── Step 2: Review ─────────────────────────────────────────────────────────

  function renderReview() {
    return (
      <div className="cp-wizard-body">
        <h3 className="cp-wizard-step-title">Review your submission</h3>
        <p className="cp-wizard-step-desc">Please review the details below before submitting.</p>
        <div className="cp-review-items">
          {fields.map((f) => {
            const v = fieldValues[f.id];
            if (v === undefined || v === null || v === '') return null;
            const display = typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v);
            return (
              <div key={f.id} className="cp-review-item">
                <span className="cp-review-label">{f.label}</span>
                <span className="cp-review-value">{display}</span>
              </div>
            );
          })}
          <div className="cp-review-item">
            <span className="cp-review-label">Professional Email</span>
            <span className="cp-review-value">{verificationEmail || 'None'}</span>
          </div>
          <div className="cp-review-item">
            <span className="cp-review-label">Supporting document</span>
            <span className="cp-review-value">{file ? file.name : 'Required'}</span>
          </div>
        </div>
        {submitError && <div className="cp-error-text">{submitError}</div>}
        <div className="cp-actions">
          <button type="button" className="cp-btn-outline" onClick={() => setStep(1)} disabled={submitting}>
            Back
          </button>
          <button type="button" className="cp-btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>
    );
  }

  // ── Step 3: Success ────────────────────────────────────────────────────────

  function renderSuccess() {
    const isVerified = polledStatus.toLowerCase() === 'verified';
    const isRejected = polledStatus.toLowerCase() === 'rejected';

    return (
      <div className="cp-wizard-body" style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ marginBottom: 24 }}>
          {isVerified ? (
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          ) : isRejected ? (
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          ) : (
            cred.emailRequired ? <Icon.Email /> : <div className="cp-analyze-icon"><Icon.FileText /><div className="cp-scan-line"></div></div>
          )}
        </div>
        
        <h3 className="cp-wizard-step-title" style={{ fontSize: '1.5rem' }}>
          {isVerified ? 'Verification Successful!' : isRejected ? 'Verification Failed' : emailConfirmed ? 'Email Confirmed!' : (cred.emailRequired ? 'Submission Received!' : 'Analyzing Document...')}
        </h3>

        <p className="cp-wizard-step-desc" style={{ maxWidth: 400, margin: '12px auto 24px' }}>
          {isVerified ? (
            "Congratulations! Your credential has been verified. You now have full access to associated benefits."
          ) : isRejected ? (
            <div style={{ color: '#ef4444', background: '#fef2f2', padding: '16px', borderRadius: '8px', border: '1px solid #fee2e2' }}>
              <p style={{ fontWeight: '600', marginBottom: '8px' }}>Validation Feedback:</p>
              <span>{getDetailedReason(rejectionReason, cred.label)}</span>
            </div>
          ) : emailConfirmed ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div className="cp-loading-dots">
                <span></span><span></span><span></span>
              </div>
              <p style={{ fontSize: '0.95rem', color: '#4b5563', lineHeight: '1.6' }}>
                Email confirmed! <b>Further credential verification is now in progress.</b><br/>
                We are validating your documents to finalize your status.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <p style={{ fontSize: '0.95rem', color: '#4b5563', lineHeight: '1.6' }}>
                {cred.emailRequired ? (
                  <>
                    We've received your {cred.label} verification request.<br/>
                    <b>Please check your institutional email ({verificationEmail}) and click the verification link to proceed.</b>
                  </>
                ) : (
                  <>
                    We've received your {cred.label} verification request.<br/>
                    <b>Our automated system is currently analyzing your document.</b>
                  </>
                )}
              </p>
              <div className="cp-loading-dots">
                <span></span><span></span><span></span>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                {cred.emailRequired ? 'Waiting for email verification...' : 'Processing document analysis...'}
              </span>
            </div>
          )}
        </p>

        {(isVerified || isRejected) && (
          <div className="cp-actions" style={{ justifyContent: 'center' }}>
            {isRejected ? (
              <button type="button" className="cp-btn-primary" style={{ minWidth: 220 }} onClick={handleRestart}>
                Resubmit Credentials
              </button>
            ) : (
              <button type="button" className="cp-btn-primary" style={{ minWidth: 200 }} onClick={() => onSubmitted(result)}>
                Done
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="cp-wizard">
      <div className="cp-wizard-header">
        <button type="button" className="cp-wizard-back-btn" onClick={onCancel}>
          <Icon.ArrowLeft /> Back to Credentials
        </button>
        <h2 className="cp-wizard-title">{cred.label} Verification</h2>
      </div>

      <div className="cp-stepper">
        {WIZARD_STEPS.map((s, i) => (
          <div key={s.id} className={'cp-step' + (i === step ? ' active' : '') + (i < step ? ' done' : '')}>
            <span className="cp-step-circle">
              {i < step ? <Icon.Check /> : i + 1}
            </span>
            <span className="cp-step-label">{s.label}</span>
            {i < WIZARD_STEPS.length - 1 && <span className="cp-step-line" />}
          </div>
        ))}
      </div>
      
      {step === 0 && renderInfo()}
      {step === 1 && renderDocument()}
      {step === 2 && renderReview()}
      {step === 3 && renderSuccess()}
    </div>
  );
}

// ── CredentialDetail ───────────────────────────────────────────────────────────

function CredentialDetail({ cred, userCred, onBack, onRestart }) {
  const s = statusNormalized(userCred.status);
  const fields = CREDENTIAL_FIELDS[cred.id] || [];
  const submittedFields = userCred.fields || {};
  const [openingDoc, setOpeningDoc] = useState(false);

  async function handleOpenDocument() {
    if (!userCred.documentId) return;
    setOpeningDoc(true);
    try {
      await openDocumentFile(userCred.documentId);
    } catch (err) {
      alert(err.message);
    } finally {
      setOpeningDoc(false);
    }
  }

  return (
    <div className="cp-detail">
      <div className="cp-wizard-header">
        <button type="button" className="cp-wizard-back-btn" onClick={onBack}>
          <Icon.ArrowLeft /> Back to Credentials
        </button>
        <h2 className="cp-wizard-title">{cred.label} Credential</h2>
      </div>

      <div className="cp-detail-header">
        <div className="cp-detail-status-row">
          <StatusBadge status={userCred.status} />
          {userCred.submittedAt && (
            <span className="cp-detail-date">Submitted {fmtDate(userCred.submittedAt)}</span>
          )}
          {userCred.reviewedAt && (
            <span className="cp-detail-date">Reviewed {fmtDate(userCred.reviewedAt)}</span>
          )}
        </div>

        {s === 'verified' && (
          <div className="cp-success-banner">
            <Icon.Check /> Your {cred.label} credential has been verified.
          </div>
        )}

        {s === 'rejected' && userCred.reviewerNotes && (
          <div className="cp-rejected-banner" style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '16px', borderRadius: '8px', color: '#ef4444', marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '8px' }}>Validation Feedback:</div>
            <div style={{ fontSize: '0.95rem' }}>{getDetailedReason(userCred.reviewerNotes, cred.label)}</div>
          </div>
        )}

        {s === 'pending' && (
          <div className="cp-pending-banner">
            Your credential is under review. You will be notified once it is processed.
          </div>
        )}
      </div>

      <div className="cp-detail-sections">
        <div className="cp-detail-fields">
          <div className="cp-detail-section-title">Submission Info</div>
          <div className="cp-detail-row">
            <span className="cp-detail-row-label">Status</span>
            <span className="cp-detail-row-value"><StatusBadge status={userCred.status} /></span>
          </div>
          <div className="cp-detail-row">
            <span className="cp-detail-row-label">Credential Type</span>
            <span className="cp-detail-row-value">{cred.label}</span>
          </div>
          <div className="cp-detail-row">
            <span className="cp-detail-row-label">Submitted On</span>
            <span className="cp-detail-row-value">{userCred.submittedAt ? fmtDate(userCred.submittedAt) : '—'}</span>
          </div>
          <div className="cp-detail-row">
            <span className="cp-detail-row-label">Reviewed On</span>
            <span className="cp-detail-row-value">{userCred.reviewedAt ? fmtDate(userCred.reviewedAt) : '—'}</span>
          </div>
          {userCred.reviewerNotes && (
            <div className="cp-review-note-block" style={{ background: '#fffaf0', border: '1px solid #feebc8', padding: '16px', borderRadius: '8px', color: '#744210', marginTop: '20px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reviewer Note</div>
              <div style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>{getDetailedReason(userCred.reviewerNotes, cred.label)}</div>
            </div>
          )}
        </div>

        <div className="cp-detail-fields">
          <div className="cp-detail-section-title">Submitted Information</div>
          {fields.length === 0 ? (
            <div className="cp-empty">No field data.</div>
          ) : (
            fields.map((f) => {
              const v = submittedFields[f.id];
              if (v === undefined || v === null || v === '') return null;
              const display = typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v);
              return (
                <div key={f.id} className="cp-detail-row">
                  <span className="cp-detail-row-label">{f.label}</span>
                  <span className="cp-detail-row-value">{display}</span>
                </div>
              );
            })
          )}
          {userCred.verificationEmail && (
            <div className="cp-detail-row">
              <span className="cp-detail-row-label">Professional Email</span>
              <span className="cp-detail-row-value">{userCred.verificationEmail}</span>
            </div>
          )}
          <div className="cp-detail-row">
            <span className="cp-detail-row-label">Uploaded Document</span>
            <span className="cp-detail-row-value">
              {userCred.documentId ? (
                <button type="button" className="cp-detail-link" onClick={handleOpenDocument} disabled={openingDoc}>
                  <Icon.ExternalLink /> {openingDoc ? 'Opening…' : (userCred.documentName || 'View uploaded document')}
                </button>
              ) : (
                <span className="cp-empty-inline">No document uploaded</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {s === 'rejected' && (
        <div className="cp-actions" style={{ marginTop: 24 }}>
          <button type="button" className="cp-btn-primary" onClick={onRestart}>
            <Icon.RefreshCw /> Resubmit Credential
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function Credentials() {
  const navigate = useNavigate();
  const [identityStatus, setIdentityStatus] = useState(null);
  const [statusLoading, setStatusLoading]   = useState(true);
  const [credentials, setCredentials]       = useState([]);
  const [credsLoading, setCredsLoading]     = useState(true);
  const [activeView, setActiveView]         = useState(null); // { type: 'wizard'|'detail', cred, userCred? }

  const loadIdentityStatus = useCallback(() => {
    fetchVerificationStatus()
      .then(setIdentityStatus)
      .catch(() => setIdentityStatus({ status: 'none' }))
      .finally(() => setStatusLoading(false));
  }, []);

  const loadCredentials = useCallback(() => {
    console.log('STUCK_DEBUG: Starting loadCredentials at', new Date().toLocaleTimeString());
    setCredsLoading(true);
    fetchCredentials()
      .then(data => {
        console.log('STUCK_DEBUG: Successfully fetched credentials:', data);
        setCredentials(data);
      })
      .catch((err) => {
        console.error('STUCK_DEBUG: Failed to fetch credentials:', err);
      })
      .finally(() => {
        console.log('STUCK_DEBUG: loadCredentials finally at', new Date().toLocaleTimeString());
        setCredsLoading(false);
      });
  }, []);

  useEffect(() => {
    const run = async () => {
      loadIdentityStatus();
      loadCredentials();
    };
    run();
  }, [loadIdentityStatus, loadCredentials]);

  const identityVerified =
    identityStatus?.status === 'VERIFIED' || identityStatus?.status === 'verified';

  const credMap = Object.fromEntries(credentials.map((c) => [c.credentialType, c]));

  const verifiedCount = credentials.filter(
    (c) => c.status === 'verified' || c.status === 'VERIFIED'
  ).length;

  const pendingCount = credentials.filter(
    (c) => c.status === 'pending' || c.status === 'PENDING'
  ).length;

  function handleCardClick(cat) {
    const userCred = credMap[cat.id];
    if (userCred) {
      setActiveView({ type: 'detail', cred: cat, userCred });
    } else {
      setActiveView({ type: 'wizard', cred: cat });
    }
  }

  function handleWizardSubmitted(credential) {
    if (credential) {
      setCredentials((prev) => {
        const exists = prev.some((c) => c.credentialType === credential.credentialType);
        return exists
          ? prev.map((c) => c.credentialType === credential.credentialType ? credential : c)
          : [...prev, credential];
      });
    }
    setTimeout(() => {
      console.log('STUCK_DEBUG: Delayed loadCredentials triggering...');
      loadCredentials();
    }, 500);
    setActiveView(null);
  }

  // ── Inline full-page views ─────────────────────────────────────────────────

  if (activeView?.type === 'wizard') {
    return (
      <div className="cp-page">
        <CredentialWizard
          cred={activeView.cred}
          onCancel={() => setActiveView(null)}
          onSubmitted={handleWizardSubmitted}
        />
      </div>
    );
  }

  if (activeView?.type === 'detail') {
    return (
      <div className="cp-page">
        <CredentialDetail
          cred={activeView.cred}
          userCred={activeView.userCred}
          onBack={() => setActiveView(null)}
          onRestart={() => setActiveView({ type: 'wizard', cred: activeView.cred })}
        />
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (statusLoading || credsLoading) {
    return (
      <div className="cp-page">
        <div className="cp-loading">
          <div className="cp-spinner" />
          <span>Loading credentials…</span>
        </div>
      </div>
    );
  }

  // ── Main page ──────────────────────────────────────────────────────────────

  return (
    <div className="cp-page">

      {/* Header */}
      <div className="cp-header">
        <div className="cp-header-content">
          <h2>Credential Verifications</h2>
          <p className="cp-header-sub">Verify your group affiliations to unlock exclusive discounts and benefits.</p>
        </div>
        <div className="cp-header-stats">
          <div className="cp-header-stat">
            <span className="cp-header-stat-value">{verifiedCount}/{CREDENTIAL_CATEGORIES.length}</span>
            <span className="cp-header-stat-label">verified</span>
          </div>
          {pendingCount > 0 && (
            <div className="cp-header-stat">
              <span className="cp-header-stat-value">{pendingCount}</span>
              <span className="cp-header-stat-label">pending</span>
            </div>
          )}
        </div>
      </div>

      {/* Lock gate */}
      {!identityVerified && (
        <div className="cp-lock-banner">
          <span className="cp-lock-icon"><Icon.Lock /></span>
          <div className="cp-lock-text">
            <div className="cp-lock-title">Identity Verification Required</div>
            <div className="cp-lock-desc">
              You must verify your identity before you can submit credential verifications.
              Credentials are available after your Digital ID verification is approved.
            </div>
          </div>
          <button
            type="button"
            className="cp-btn-primary cp-lock-cta"
            onClick={() => navigate('/verification')}
          >
            Verify Your Identity
          </button>
        </div>
      )}

      {/* Stats row */}
      {identityVerified && (
        <div className="cp-stats">
          <div className="cp-stat">
            <span className="cp-stat-value">{verifiedCount}</span>
            <span className="cp-stat-label">Verified</span>
          </div>
          <div className="cp-stat">
            <span className="cp-stat-value">{pendingCount}</span>
            <span className="cp-stat-label">Pending</span>
          </div>
          <div className="cp-stat">
            <span className="cp-stat-value">{CREDENTIAL_CATEGORIES.length - verifiedCount - pendingCount}</span>
            <span className="cp-stat-label">Available</span>
          </div>
        </div>
      )}

      {/* Credential grid */}
      <div className={'cp-grid' + (!identityVerified ? ' cp-grid-dimmed' : '')}>
        {CREDENTIAL_CATEGORIES.map((cat) => {
          const userCred = credMap[cat.id];
          const s = userCred ? statusNormalized(userCred.status) : 'not-started';
          const CardIcon = CREDENTIAL_ICON_MAP[cat.id] || Icon.FileText;
          return (
            <button
              key={cat.id}
              type="button"
              className={'cp-card' + (s !== 'not-started' ? ` ${s}` : '')}
              disabled={!identityVerified}
              onClick={() => identityVerified && handleCardClick(cat)}
            >
              <span className="cp-card-icon"><CardIcon /></span>
              <div className="cp-card-body">
                <span className="cp-card-label">{cat.label}</span>
                <span className="cp-card-desc">{cat.desc}</span>
              </div>
              <span className="cp-card-status">
                <StatusBadge status={userCred?.status ?? null} />
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
