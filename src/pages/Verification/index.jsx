import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchDocuments, uploadDocument, replaceDocument, deleteDocument, openDocumentFile, fetchDocumentFile } from '../../api/documents';
import { fetchVerificationStatus, submitVerification, openVerificationFile } from '../../api/verifyIdentity';
import { getMyInfoRequests, respondToInfoRequest } from '../../api/infoRequests';
import './Verification.css';

const cleanReviewerNotes = (notes) => {
  if (!notes) return '';
  // Remove legacy or technical prefixes
  return notes.replace(/^(AI|Automated system|Check Failed|Verification Failed):?\s*/i, '').trim();
};

// ── Icons ─────────────────────────────────────────────────────────────────────

const Icon = {
  IdCard: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="8" cy="12" r="2" /><path d="M14 10h4M14 14h3" /></svg>),
  Passport: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" /><circle cx="12" cy="11" r="3" /><path d="M8 18h8" /></svg>),
  Building: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14" /><path d="M9 21v-4h6v4" /></svg>),
  Shield: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>),
  Scroll: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" /></svg>),
  CreditCard: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>),
  Home: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" /><path d="M9 21V12h6v9" /></svg>),
  BarChart: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 16v-4M12 16V8M16 16v-6" /></svg>),
  File: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>),
  Upload: () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>),
  Lock: () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>),
  Trash: () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>),
  CheckShield: () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>),
  Check: () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>),
  CheckLg: () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>),
  X: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
  XSmall: () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
  Folder: () => (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>),
  Chevron: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>),
  Party: () => (<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5.8 11.3L2 22l10.7-3.79" /><path d="M4 3h.01M22 8h.01M15 2h.01M22 20h.01" /><path d="M22 2l-2.24 2.24" /><path d="M19.76 4.24a5 5 0 0 1 0 7.08L12 19l-7-7 7.76-7.76a5 5 0 0 1 7.08 0z" /></svg>),
  Camera: () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>),
  User: () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5" /><path d="M3 21v-2a7 7 0 0 1 14 0v2" /></svg>),
  ExternalDoc: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><polyline points="9 12 11 14 15 10" /></svg>),
  Plus: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>),
  Send: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>),

};

// ── Constants ─────────────────────────────────────────────────────────────────

const DOCUMENT_TYPES = [
  { id: 'drivers_license', Icon: Icon.IdCard, label: "Driver's License" },
  { id: 'passport', Icon: Icon.Passport, label: 'Passport' },
  { id: 'state_id', Icon: Icon.Building, label: 'State ID Card' },
  { id: 'military_id', Icon: Icon.Shield, label: 'Military ID' },
  { id: 'birth_cert', Icon: Icon.Scroll, label: 'Birth Certificate' },
  { id: 'ssn_card', Icon: Icon.CreditCard, label: 'Social Security Card' },
  { id: 'utility_bill', Icon: Icon.Home, label: 'Utility Bill' },
  { id: 'tax_return', Icon: Icon.BarChart, label: 'Tax Return' },
];

const TYPE_MAP = Object.fromEntries(DOCUMENT_TYPES.map((t) => [t.id, t]));

const DOC_TYPE_FIELDS = {
  drivers_license: { issuerLabel: 'State', issuerPlaceholder: 'e.g. California', showExpiry: true, expiryLabel: 'Expiry date' },
  passport: { issuerLabel: 'Country', issuerPlaceholder: 'e.g. United States', showExpiry: true, expiryLabel: 'Expiry date' },
  state_id: { issuerLabel: 'State', issuerPlaceholder: 'e.g. Texas', showExpiry: true, expiryLabel: 'Expiry date' },
  military_id: { issuerLabel: 'Branch', issuerPlaceholder: 'e.g. U.S. Army', showExpiry: true, expiryLabel: 'Expiry date' },
  passport_card: { issuerLabel: 'Country', issuerPlaceholder: 'e.g. United States', showExpiry: true, expiryLabel: 'Expiry date' },
  birth_cert: { issuerLabel: 'State / County', issuerPlaceholder: 'e.g. Cook County, IL', showExpiry: false },
  ssn_card: { issuerLabel: null, showExpiry: false },
  utility_bill: { issuerLabel: 'Provider', issuerPlaceholder: 'e.g. PG&E', showExpiry: true, expiryLabel: 'Bill date' },
  tax_return: { issuerLabel: 'Tax year', issuerPlaceholder: 'e.g. 2023', showExpiry: false },
};

const ID_TYPES = [
  { id: 'drivers_license', label: "Driver's License", desc: "State-issued driver's license", docType: 'drivers_license' },
  { id: 'passport', label: 'Passport', desc: 'U.S. or international passport', docType: 'passport' },
  { id: 'state_id', label: 'State ID', desc: 'Non-driver government-issued ID', docType: 'state_id' },
  { id: 'military_id', label: 'Military ID', desc: 'Active duty, veteran, or dependent', docType: 'military_id' },
  { id: 'passport_card', label: 'Passport Card', desc: 'U.S. passport card', docType: 'passport' },
];

const ID_TYPE_LABELS = Object.fromEntries(ID_TYPES.map((t) => [t.id, t.label]));

const WIZARD_STEPS = [
  { id: 'type', label: 'ID Type' },
  { id: 'upload', label: 'Upload' },
  { id: 'selfie', label: 'Selfie' },
  { id: 'review', label: 'Review' },
];

const SIDE_LABELS = ['Front', 'Back', 'Page 1', 'Page 2', 'Other'];

const STATUS_LABEL = { verified: '✓ Verified', pending: '○ Pending', rejected: '✕ Rejected' };



function getDocLabel(t) { return TYPE_MAP[t]?.label ?? t; }
function getDocIcon(t) { return TYPE_MAP[t]?.Icon ?? Icon.File; }

function groupStatus(docs) {
  if (docs.some((d) => d.status === 'rejected')) return 'rejected';
  if (docs.some((d) => d.status === 'pending')) return 'pending';
  return 'verified';
}

// ── Upload Modal (Documents section) ─────────────────────────────────────────

function UploadModal({
  onClose,
  onSubmit,
  existingByType,
  onViewExisting,
  onReplaceExisting,
  onDeleteExisting,
  replacingId,
  deletingId,
  viewingId,
}) {
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [files, setFiles] = useState([]);
  const [issuer, setIssuer] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [showReplaceWarn, setShowReplaceWarn] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(true);

  const typeFields = selectedDocType
    ? (DOC_TYPE_FIELDS[selectedDocType] ?? { issuerLabel: 'Issuer', showExpiry: true, expiryLabel: 'Expiry date' })
    : null;

  const selectedExistingDocs = selectedDocType ? (existingByType[selectedDocType] ?? []) : [];
  const existingCount = selectedExistingDocs.length;

  function selectDocType(id) {
    setSelectedDocType(id);
    setIssuer(''); setExpiresAt(''); setFiles([]);
    setShowReplaceWarn((existingByType[id] ?? []).length > 0);
    setShowTypePicker(false);
  }

  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function addFiles(newFileList) {
    const incoming = Array.from(newFileList).map((file, i) => ({
      file,
      side: SIDE_LABELS[files.length + i] ?? 'Other',
    }));
    setFiles((prev) => [...prev, ...incoming]);
  }

  function removeFile(index) { setFiles((prev) => prev.filter((_, i) => i !== index)); }
  function updateSide(index, side) { setFiles((prev) => prev.map((f, i) => i === index ? { ...f, side } : f)); }

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      for (let i = 0; i < files.length; i++) {
        setProgress(`${i + 1} of ${files.length}`);
        await onSubmit({
          documentType: selectedDocType,
          issuer: issuer.trim() || null,
          expiresAt: expiresAt || null,
          file: files[i].file,
          replaceExisting: showReplaceWarn,
        });
      }
      onClose();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
      setProgress(null);
    }
  };

  const canSubmit = files.length > 0 && selectedDocType && !submitting;

  return (
    <div className="vf-modal-backdrop" onClick={onClose}>
      <div className="vf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="vf-modal-header">
          <div>
            <h3 className="vf-modal-title">Upload Document</h3>
            <p className="vf-modal-subtitle">Choose a document type and upload one or more files.</p>
          </div>
          <button type="button" className="vf-modal-close" onClick={onClose} aria-label="Close"><Icon.X /></button>
        </div>

        <div className="vf-modal-body">
          <p className="vf-modal-label">Document type</p>
          {(showTypePicker || !selectedDocType) ? (
            <div className="vf-type-grid">
              {DOCUMENT_TYPES.map((dt) => (
                <button
                  key={dt.id}
                  type="button"
                  className={'vf-type-chip' + (selectedDocType === dt.id ? ' selected' : '')}
                  onClick={() => selectDocType(dt.id)}
                >
                  <span className="vf-type-chip-icon"><dt.Icon /></span>
                  <span>{dt.label}</span>
                  {selectedDocType === dt.id && <span className="vf-type-chip-check"><Icon.Check /></span>}
                </button>
              ))}
            </div>
          ) : (
            <div className="vf-selected-type-bar">
              <div className="vf-selected-type-pill">
                <span className="vf-type-chip-icon">{(() => {
                  const SelectedIcon = TYPE_MAP[selectedDocType]?.Icon ?? Icon.File;
                  return <SelectedIcon />;
                })()}</span>
                <span>{getDocLabel(selectedDocType)}</span>
              </div>
              <button type="button" className="vf-selected-type-change" onClick={() => setShowTypePicker(true)}>
                Change
              </button>
            </div>
          )}

          {showReplaceWarn && existingCount > 0 && (
            <div className="vf-replace-warn">
              <Icon.ExternalDoc />
              <span>You already have {existingCount} {getDocLabel(selectedDocType)} file{existingCount > 1 ? 's' : ''}. Uploading will replace the existing record.</span>
            </div>
          )}

          {selectedDocType && selectedExistingDocs.length > 0 && (
            <div className="vf-existing-uploaded-list">
              <div className="vf-existing-uploaded-title">Uploaded documents</div>
              {selectedExistingDocs.map((doc) => (
                <div key={doc.id} className="vf-existing-uploaded-row">
                  <button
                    type="button"
                    className="vf-existing-uploaded-main"
                    onClick={() => onViewExisting(doc.id)}
                    disabled={viewingId === doc.id || submitting}
                  >
                    <span className="vf-existing-uploaded-name">{doc.originalFileName}</span>
                    <span className={'vf-existing-uploaded-status ' + doc.status}>{STATUS_LABEL[doc.status] || doc.status}</span>
                  </button>
                  <div className="vf-existing-uploaded-actions">
                    <button type="button" className="vf-mini-action" onClick={() => onViewExisting(doc.id)} disabled={viewingId === doc.id || submitting}>
                      {viewingId === doc.id ? 'Opening…' : 'View'}
                    </button>
                    <label className="vf-mini-action">
                      {replacingId === doc.id ? 'Replacing…' : 'Edit'}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        hidden
                        disabled={replacingId === doc.id || submitting}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            onReplaceExisting(doc.id, file);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                    <button type="button" className="vf-mini-action danger" onClick={() => onDeleteExisting(doc.id)} disabled={deletingId === doc.id || submitting}>
                      {deletingId === doc.id ? 'Removing…' : 'Remove'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {files.length > 0 && (
            <div className="vf-file-list">
              {files.map((entry, i) => (
                <div key={i} className="vf-file-row">
                  <span className="vf-file-row-icon"><Icon.File /></span>
                  <span className="vf-file-row-name" title={entry.file.name}>{entry.file.name}</span>
                  <select
                    className="vf-file-row-side"
                    value={entry.side}
                    onChange={(e) => updateSide(i, e.target.value)}
                    disabled={submitting}
                  >
                    {SIDE_LABELS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <button type="button" className="vf-file-row-remove" onClick={() => removeFile(i)} disabled={submitting} aria-label="Remove file">
                    <Icon.XSmall />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={'vf-drop-zone' + (selectedDocType ? '' : ' disabled') + (files.length > 0 ? ' compact' : '')}>
            <div className="vf-drop-icon-wrap"><Icon.Upload /></div>
            <span className="vf-drop-text">
              {selectedDocType ? (files.length > 0 ? 'Add more files' : 'Drag & drop your files here') : 'Select a document type first'}
            </span>
            {selectedDocType && (
              <label className="vf-choose-btn">
                {files.length > 0 ? '+ Add files' : 'Browse files'}
                <input type="file" accept="image/*,.pdf" multiple onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} hidden />
              </label>
            )}
            <span className="vf-drop-hint">JPEG, PNG, PDF — max 10 MB each</span>
          </div>

          {typeFields && (typeFields.issuerLabel || typeFields.showExpiry) && (
            <div className="vf-modal-fields">
              {typeFields.issuerLabel && (
                <div className="vf-field">
                  <label className="vf-field-label" htmlFor="doc-issuer">
                    {typeFields.issuerLabel} <span className="vf-field-optional">(optional)</span>
                  </label>
                  <input
                    id="doc-issuer" type="text" className="vf-field-input"
                    placeholder={typeFields.issuerPlaceholder ?? ''} value={issuer}
                    onChange={(e) => setIssuer(e.target.value)} maxLength={150}
                  />
                </div>
              )}
              {typeFields.showExpiry && (
                <div className="vf-field">
                  <label className="vf-field-label" htmlFor="doc-expires">
                    {typeFields.expiryLabel} <span className="vf-field-optional">(optional)</span>
                  </label>
                  <input
                    id="doc-expires" type="date" className="vf-field-input"
                    value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {submitError && <p className="vf-submit-error">{submitError}</p>}
        </div>

        <div className="vf-modal-footer">
          <button type="button" className="vf-modal-cancel" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="button" className="vf-submit-btn" disabled={!canSubmit} onClick={handleSubmit}>
            {submitting ? `Uploading ${progress}…` : files.length > 1 ? `Upload ${files.length} Files` : 'Upload & Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Doc Detail Modal ──────────────────────────────────────────────────────────

function DocDetailModal({ doc, docType, onClose, onView, onReplace, onDelete, replacingId, deletingId, viewingId }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    function handleKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const typeFields = DOC_TYPE_FIELDS[docType] ?? { issuerLabel: 'Issuer', showExpiry: true, expiryLabel: 'Expiry date' };

  return (
    <div className="vf-modal-backdrop" onClick={onClose}>
      <div className="vf-doc-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="vf-doc-detail-modal-header">
          <div className="vf-doc-detail-modal-title-row">
            <span className="vf-doc-detail-modal-icon">{getDocIcon(docType)()}</span>
            <div>
              <h3 className="vf-doc-detail-modal-title">{getDocLabel(docType)}</h3>
              <span className={'vf-doc-detail-modal-status vf-doc-status ' + doc.status}>
                {STATUS_LABEL[doc.status] || doc.status}
              </span>
            </div>
          </div>
          <button type="button" className="vf-modal-close" onClick={onClose} aria-label="Close"><Icon.X /></button>
        </div>

        {/* Body */}
        <div className="vf-doc-detail-modal-body">
          {/* File info */}
          <div className="vf-doc-detail-section">
            <div className="vf-doc-detail-section-label">File</div>
            <div className="vf-doc-detail-file-row">
              <span className="vf-doc-detail-file-icon"><Icon.File /></span>
              <span className="vf-doc-detail-file-name">{doc.originalFileName}</span>
            </div>
          </div>

          {/* Meta grid */}
          <div className="vf-doc-detail-grid">
            {typeFields.issuerLabel && (
              <div className="vf-doc-detail-cell">
                <span className="vf-doc-detail-cell-label">{typeFields.issuerLabel}</span>
                <span className={'vf-doc-detail-cell-value' + (!doc.issuer ? ' empty' : '')}>
                  {doc.issuer || '—'}
                </span>
              </div>
            )}
            {typeFields.showExpiry && (
              <div className="vf-doc-detail-cell">
                <span className="vf-doc-detail-cell-label">{typeFields.expiryLabel || 'Expiration / Date'}</span>
                <span className={'vf-doc-detail-cell-value' + (!doc.expiresAt ? ' empty' : '')}>
                  {doc.expiresAt || '—'}
                </span>
              </div>
            )}
            <div className="vf-doc-detail-cell">
              <span className="vf-doc-detail-cell-label">Uploaded</span>
              <span className="vf-doc-detail-cell-value">{doc.uploadedAt || '—'}</span>
            </div>
            <div className="vf-doc-detail-cell">
              <span className="vf-doc-detail-cell-label">Status</span>
              <span className={'vf-doc-detail-cell-value vf-doc-status-text ' + doc.status}>
                {STATUS_LABEL[doc.status] || doc.status}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="vf-doc-detail-modal-footer">
          <button
            type="button"
            className="vf-doc-view-btn"
            onClick={() => { onView(doc.id); onClose(); }}
            disabled={viewingId === doc.id}
          >
            {viewingId === doc.id ? 'Opening…' : 'View File'}
          </button>
          <label className="vf-doc-replace-btn" title="Replace with a new file">
            {replacingId === doc.id ? 'Replacing…' : 'Replace'}
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => { const f = e.target.files[0]; if (f) { onReplace(doc.id, f); onClose(); e.target.value = ''; } }}
              disabled={replacingId === doc.id}
              hidden
            />
          </label>
          <button
            type="button"
            className="vf-doc-remove-btn"
            onClick={() => { onDelete(doc.id); onClose(); }}
            disabled={deletingId === doc.id}
          >
            {deletingId === doc.id ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Doc Group Card (Documents section) ───────────────────────────────────────

function DocGroupCard({ docType, docs, onView, onReplace, onDelete, replacingId, deletingId, viewingId }) {
  const [expanded, setExpanded] = useState(false);
<<<<<<< Updated upstream
  const [selectedDocId, setSelectedDocId] = useState(null);
  const label = getDocLabel(docType);
=======
  const [detailDoc, setDetailDoc] = useState(null);
  const label  = getDocLabel(docType);
>>>>>>> Stashed changes
  const status = groupStatus(docs);

  return (
    <div className="vf-doc-group">
      <button type="button" className="vf-doc-group-header" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
        <span className="vf-doc-card-icon">{getDocIcon(docType)()}</span>
        <span className="vf-doc-group-title">{label}</span>
        <span className="vf-doc-group-count">{docs.length} {docs.length === 1 ? 'file' : 'files'}</span>
        <span className={'vf-doc-status ' + status}>{STATUS_LABEL[status]}</span>
        <span className={'vf-doc-group-chevron' + (expanded ? ' open' : '')}><Icon.Chevron /></span>
      </button>

      {expanded && (
        <div className="vf-doc-group-files">
          {docs.map((doc) => (
            <button
              key={doc.id}
              type="button"
              className="vf-doc-group-file-btn"
              onClick={() => setDetailDoc(doc)}
            >
              <span className="vf-doc-group-file-icon"><Icon.File /></span>
              <div className="vf-doc-group-file-info">
                <span className="vf-doc-group-file-name" title={doc.originalFileName}>{doc.originalFileName}</span>
                <span className="vf-doc-group-file-meta">
                  {doc.uploadedAt && <span>{doc.uploadedAt}</span>}
                  {doc.expiresAt && <span>· Expires {doc.expiresAt}</span>}
                  <span className={'vf-doc-status-inline ' + doc.status}>{STATUS_LABEL[doc.status] || doc.status}</span>
                </span>
              </div>
              <span className="vf-doc-file-arrow">›</span>
            </button>
          ))}
        </div>
      )}

      {detailDoc && (
        <DocDetailModal
          doc={detailDoc}
          docType={docType}
          onClose={() => setDetailDoc(null)}
          onView={onView}
          onReplace={onReplace}
          onDelete={onDelete}
          replacingId={replacingId}
          deletingId={deletingId}
          viewingId={viewingId}
        />
      )}
    </div>
  );
}

// ── Info Request Response Modal ───────────────────────────────────────────────

function InfoResponseModal({ request, onClose, onResponded }) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function handleSubmit() {
    if (!message.trim() && files.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      await respondToInfoRequest(request.id, message.trim(), files);
      onResponded();
      onClose();
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="vf-modal-backdrop" onClick={onClose}>
      <div className="vf-modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="vf-modal-header">
          <div>
            <h3 className="vf-modal-title">Respond to Request</h3>
            <p className="vf-modal-subtitle">Provide the requested information to the reviewer.</p>
          </div>
          <button type="button" className="vf-modal-close" onClick={onClose}><Icon.X /></button>
        </div>
        <div className="vf-modal-body">
          <div className="vf-info-request-note">
            <div className="vf-info-request-note-label">Admin request</div>
            <div className="vf-info-request-note-text">{request.note}</div>
          </div>
          <div className="vf-field">
            <label className="vf-field-label">Your response</label>
            <textarea
              className="vf-field-input vf-textarea"
              placeholder="Describe or explain the information requested…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
          <div className="vf-field">
            <label className="vf-field-label">Attach files <span className="vf-field-optional">(optional)</span></label>
            <label className="vf-choose-btn" style={{ display: 'inline-block' }}>
              {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : 'Choose files'}
              <input type="file" accept="image/*,.pdf" multiple onChange={(e) => setFiles(Array.from(e.target.files))} hidden />
            </label>
          </div>
          {error && <p className="vf-submit-error">{error}</p>}
        </div>
        <div className="vf-modal-footer">
          <button type="button" className="vf-modal-cancel" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="button" className="vf-submit-btn" onClick={handleSubmit} disabled={submitting || (!message.trim() && files.length === 0)}>
            {submitting ? 'Sending…' : 'Send Response'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Verification Detail Modal ─────────────────────────────────────────────────

function VerificationDetailModal({ verification, infoRequests, onClose, onRefreshRequests }) {
  const [replyTarget, setReplyTarget] = useState(null);
  const [openingSide, setOpeningSide] = useState(null);

  const pendingRequests = infoRequests.filter(
    (r) => r.source === 'verification_review' && !r.userResponse
  );
  const respondedRequests = infoRequests.filter(
    (r) => r.source === 'verification_review' && r.userResponse
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function statusClass(s) {
    const map = { verified: 'vf-badge-verified', pending: 'vf-badge-pending', rejected: 'vf-badge-rejected', VERIFIED: 'vf-badge-verified', PENDING: 'vf-badge-pending', REJECTED: 'vf-badge-rejected' };
    return map[s] || 'vf-badge-inactive';
  }

  async function handleOpenSubmitted(side) {
    setOpeningSide(side);
    try {
      await openVerificationFile(side);
    } catch (e) {
      alert(e.message);
    } finally {
      setOpeningSide(null);
    }
  }

  return (
    <div className="vf-modal-backdrop" onClick={onClose}>
      <div className="vf-modal vf-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="vf-modal-header">
          <div>
            <h3 className="vf-modal-title">Verification Details</h3>
            <p className="vf-modal-subtitle">
              {ID_TYPE_LABELS[verification.idType] || verification.idType || '—'}
              &nbsp;·&nbsp;
              <span className={'vf-badge ' + statusClass(verification.status)}>{verification.status}</span>
            </p>
          </div>
          <button type="button" className="vf-modal-close" onClick={onClose}><Icon.X /></button>
        </div>

        <div className="vf-modal-body vf-detail-body">
          {/* Submitted Info */}
          <div className="vf-detail-section">
            <div className="vf-detail-section-title">Submission Info</div>
            <div className="vf-detail-rows">
              <div className="vf-detail-row">
                <span className="vf-detail-label">Status</span>
                <span className={'vf-badge ' + statusClass(verification.status)}>{verification.status}</span>
              </div>
              <div className="vf-detail-row">
                <span className="vf-detail-label">Document Type</span>
                <span className="vf-detail-value">{ID_TYPE_LABELS[verification.idType] || verification.idType || '—'}</span>
              </div>
              <div className="vf-detail-row">
                <span className="vf-detail-label">Submitted On</span>
                <span className="vf-detail-value">{verification.submittedAt ? new Date(verification.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
              </div>
              <div className="vf-detail-row">
                <span className="vf-detail-label">Front ID</span>
                <span className="vf-detail-value">{verification.hasFrontFile ? 'Submitted' : '—'}</span>
              </div>
              <div className="vf-detail-row">
                <span className="vf-detail-label">Back ID</span>
                <span className="vf-detail-value">{verification.hasBackFile ? 'Submitted' : '—'}</span>
              </div>
              <div className="vf-detail-row">
                <span className="vf-detail-label">Selfie</span>
                <span className="vf-detail-value">{verification.hasSelfieFile ? 'Submitted' : '—'}</span>
              </div>
              {verification.reviewedAt && (
                <div className="vf-detail-row">
                  <span className="vf-detail-label">Reviewed On</span>
                  <span className="vf-detail-value">{new Date(verification.reviewedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              )}
              {verification.status?.toUpperCase() === 'REJECTED' && (
                <div className="vf-detail-row vf-detail-row-full" style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
                  <span className="vf-detail-label" style={{ color: '#ef4444', fontWeight: '600' }}>Reason for Rejection</span>
                  <div className="vf-reviewer-note" style={{ color: '#ef4444', marginTop: '4px' }}>
                    {cleanReviewerNotes(verification.reviewerNotes) || 'Your identity verification could not be automatically approved. Please ensure your documents are clear, well-lit, and match your profile information.'}
                  </div>
                </div>
              )}
              {verification.status?.toUpperCase() === 'VERIFIED' && verification.reviewerNotes && (
                <div className="vf-detail-row vf-detail-row-full">
                  <span className="vf-detail-label">Automated System Note</span>
                  <div className="vf-reviewer-note">{verification.reviewerNotes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Submitted Documents */}
          <div className="vf-detail-section">
            <div className="vf-detail-section-title">Submitted Documents</div>
            <div className="vf-submitted-docs">
              {[
                { label: 'Front ID', side: 'front', available: !!verification.hasFrontFile },
                { label: 'Back ID', side: 'back', available: !!verification.hasBackFile },
                { label: 'Selfie', side: 'selfie', available: !!verification.hasSelfieFile },
              ].map((item) => (
                <div key={item.label} className="vf-submitted-doc-row">
                  <span className="vf-submitted-doc-icon"><Icon.File /></span>
                  <span className="vf-submitted-doc-label">{item.label}</span>
                  {item.available ? (
                    <button
                      type="button"
                      className="vf-submitted-doc-open"
                      onClick={() => handleOpenSubmitted(item.side)}
                      disabled={openingSide === item.side}
                    >
                      {openingSide === item.side ? 'Opening…' : 'Open document'}
                    </button>
                  ) : (
                    <span className="vf-submitted-doc-badge missing">Not provided</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Admin Info Requests */}
          {(pendingRequests.length > 0 || respondedRequests.length > 0) && (
            <div className="vf-detail-section">
              <div className="vf-detail-section-title">
                Information Requests
                {pendingRequests.length > 0 && (
                  <span className="vf-pending-badge">{pendingRequests.length} pending</span>
                )}
              </div>

              {pendingRequests.map((req) => (
                <div key={req.id} className="vf-info-request pending">
                  <div className="vf-info-request-header">
                    <span className="vf-info-request-tag">Admin Request</span>
                    <span className="vf-info-request-awaiting">Awaiting your response</span>
                  </div>
                  <div className="vf-info-request-content">{req.note}</div>
                  <button
                    type="button"
                    className="vf-respond-btn"
                    onClick={() => setReplyTarget(req)}
                  >
                    <Icon.Send /> Respond
                  </button>
                </div>
              ))}

              {respondedRequests.map((req) => (
                <div key={req.id} className="vf-info-request responded">
                  <div className="vf-info-request-header">
                    <span className="vf-info-request-tag">Admin Request</span>
                    <span className="vf-info-request-done">Responded</span>
                  </div>
                  <div className="vf-info-request-content">{req.note}</div>
                  <div className="vf-info-response">
                    <div className="vf-info-response-label">Your response</div>
                    {req.userResponse?.message && (
                      <div className="vf-info-response-text">{req.userResponse.message}</div>
                    )}
                    {req.userResponse?.files?.length > 0 && (
                      <div className="vf-info-response-files">
                        {req.userResponse.files.map((f, i) => (
                          <span key={i} className="vf-response-file-chip">
                            <Icon.File /> {f.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="vf-modal-footer">
          <button type="button" className="vf-modal-cancel" onClick={onClose}>Close</button>
        </div>
      </div>

      {replyTarget && (
        <InfoResponseModal
          request={replyTarget}
          onClose={() => setReplyTarget(null)}
          onResponded={() => { setReplyTarget(null); onRefreshRequests(); }}
        />
      )}
    </div>
  );
}

// ── Existing Doc Picker (in wizard upload step) ───────────────────────────────

function ExistingDocPicker({ docs, selectedDocId, onSelect }) {
  if (!docs || docs.length === 0) return null;

  return (
    <div className="vf-existing-docs">
      <div className="vf-existing-docs-label">
        <Icon.ExternalDoc /> Use an existing document from your Documents
      </div>
      {docs.map((doc) => (
        <button
          key={doc.id}
          type="button"
          className={'vf-existing-doc-item' + (selectedDocId === doc.id ? ' selected' : '')}
          onClick={() => onSelect(selectedDocId === doc.id ? null : doc.id)}
        >
          <span className="vf-existing-doc-icon"><Icon.File /></span>
          <span className="vf-existing-doc-name">{doc.originalFileName}</span>
          <span className={'vf-existing-doc-status ' + doc.status}>{STATUS_LABEL[doc.status] || doc.status}</span>
          {selectedDocId === doc.id && <span className="vf-existing-doc-check"><Icon.Check /></span>}
        </button>
      ))}
    </div>
  );
}

// ── Verification Wizard ───────────────────────────────────────────────────────

function VerificationWizard({ documents, onCancel, onSubmitted, onDocumentUploaded }) {
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingSteps, setAnalyzingSteps] = useState({ ocr: false, face: false });
  const [localVerification, setLocalVerification] = useState({ status: 'none' });

  // For using existing docs
  const [frontDocId, setFrontDocId] = useState(null);
  const [backDocId, setBackDocId] = useState(null);
  const [loadingDocFile, setLoadingDocFile] = useState(false);

  // Camera
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      setCameraError('Camera access denied. Please allow camera permission and try again.');
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current; const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) { setSelfieFile(new File([blob], 'selfie.jpg', { type: 'image/jpeg' })); stopCamera(); }
    }, 'image/jpeg', 0.92);
  }, [stopCamera]);

  useEffect(() => { if (cameraActive && videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current; }, [cameraActive]);
  useEffect(() => { if (step !== 2) stopCamera(); }, [step, stopCamera]);

  // Get docs matching the selected ID type
  const matchingDocs = selectedType
    ? documents.filter((d) => {
      const idType = ID_TYPES.find((t) => t.id === selectedType);
      return idType && d.documentType === idType.docType;
    })
    : [];

  async function resolveFile(file, docId, fileName) {
    if (file) return file;
    if (docId) {
      setLoadingDocFile(true);
      try {
        const blob = await fetchDocumentFile(docId);
        return new File([blob], fileName || 'document', { type: blob.type });
      } finally {
        setLoadingDocFile(false);
      }
    }
    return null;
  }

  function canProceed() {
    if (step === 0) return !!selectedType;
    if (step === 1) return !!(frontFile || frontDocId);
    if (step === 2) return !!selfieFile;
    return true;
  }

  async function handleSubmit() {
    setSubmitError(null);
    setSubmitting(true);
    setAnalyzingSteps({ ocr: false, face: false });
    setIsAnalyzing(true);
    try {
      const resolvedFront = await resolveFile(frontFile, frontDocId, 'front.jpg');
      const resolvedBack = await resolveFile(backFile, backDocId, 'back.jpg');

      // Backend creates Document records for front/back and returns them in the response
      const result = await submitVerification({ idType: selectedType, frontFile: resolvedFront, backFile: resolvedBack, selfieFile });

      // Update the documents list from the backend response
      if (Array.isArray(result.documents)) {
        result.documents.forEach((doc) => onDocumentUploaded(doc));
      }

<<<<<<< Updated upstream
      const result = await submitVerification({ idType: selectedType, frontFile: resolvedFront, backFile: resolvedBack, selfieFile });
      setLocalVerification(result);

      // Simulated progress for UI feedback
      setTimeout(() => setAnalyzingSteps(prev => ({ ...prev, ocr: true })), 800);
      setTimeout(() => setAnalyzingSteps(prev => ({ ...prev, face: true })), 1600);

      if (result.status === 'pending') {
        const pollInterval = setInterval(async () => {
          try {
            const statusUpdate = await fetchVerificationStatus();
            if (statusUpdate.status !== 'pending') {
              setLocalVerification(statusUpdate);
              setIsAnalyzing(false);
              clearInterval(pollInterval);
              // Small delay to let user see success before auto-closing
              setTimeout(() => onSubmitted(statusUpdate), 2000);
            }
          } catch (pollErr) {
            console.error('Error polling verification status:', pollErr);
          }
        }, 3000);
      } else {
        setIsAnalyzing(false);
        onSubmitted(result);
      }
=======
      onSubmitted(result);
>>>>>>> Stashed changes
    } catch (err) {
      setSubmitError(err.message);
      setIsAnalyzing(false);
    } finally {
      setSubmitting(false);
    }
  }

  const selectedIdType = ID_TYPES.find((t) => t.id === selectedType);
  const frontSource = frontDocId ? matchingDocs.find((d) => d.id === frontDocId) : null;
  const backSource = backDocId ? matchingDocs.find((d) => d.id === backDocId) : null;

  return (
    <div className="vf-wizard">
      {/* Stepper */}
      <div className="vf-stepper">
        {WIZARD_STEPS.map((s, i) => (
          <div key={s.id} className={'vf-step' + (i === step ? ' active' : '') + (i < step ? ' done' : '')}>
            <span className="vf-step-number">{i < step ? <Icon.Check /> : i + 1}</span>
            <span className="vf-step-label">{s.label}</span>
            {i < WIZARD_STEPS.length - 1 && <span className="vf-step-line" />}
          </div>
        ))}
      </div>

      <div className="vf-wizard-card">
        {localVerification?.status === 'verified' ? (
          <div className="vi-verified-wrap" style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="vi-verified-icon-lg"><Icon.CheckLg /></div>
            <h3 className="vf-wizard-card-title">Identity Verified</h3>
            <p className="vf-wizard-card-desc">Your identity has been successfully verified. You now have full access to all Digital ID services.</p>
            <div className="vi-verified-details" style={{ marginTop: '24px', textAlign: 'left' }}>
              <div className="vi-detail-row">
                <span className="vi-detail-label">Verification Level</span>
                <span className="vi-detail-value vi-detail-highlight">IAL2 — Strong Identity</span>
              </div>
              <div className="vi-detail-row">
                <span className="vi-detail-label">Biometric Match</span>
                <span className="vi-detail-value vi-detail-highlight">Confirmed ✅</span>
              </div>
            </div>
          </div>
        ) : localVerification?.status === 'rejected' ? (
          <div className="vi-rejected-wrap" style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="vi-rejected-icon-lg"><Icon.X /></div>
            <h3 className="vf-wizard-card-title">Verification Failed</h3>
            <p className="vf-wizard-card-desc" style={{ color: 'var(--error)' }}>
              {localVerification.reviewerNotes || 'Documents or selfie did not meet the requirements.'}
            </p>
            <button type="button" className="vf-btn-primary" style={{ marginTop: '30px', width: '100%' }} onClick={() => { setLocalVerification({ status: 'none' }); setStep(0); }}>
              Try Again
            </button>
          </div>
        ) : isAnalyzing || localVerification?.status === 'pending' ? (
          <div className="vf-analyzing-container">
            <div className="vf-analyze-icon">
              <Icon.IdCard />
              <div className="vf-scan-line"></div>
            </div>
            
            <h3 className="vf-wizard-card-title" style={{ padding: 0, marginBottom: '8px' }}>
              {isAnalyzing ? 'Analyzing Your Identity' : 'Under Review'}
            </h3>
            <p className="vf-wizard-card-desc" style={{ padding: 0, maxWidth: '340px', margin: '0 auto' }}>
              {isAnalyzing 
                ? "Our automated system is currently verifying your documents and matching your biometrics." 
                : "Your identity is currently being finalized. This usually takes just a few more seconds."}
            </p>

            <div className="vf-loading-dots">
              <span></span><span></span><span></span>
            </div>

            <div className="vf-analyzing-steps">
              <div className={`vf-analyzing-step ${(!analyzingSteps.ocr && !analyzingSteps.face) ? 'active' : 'done'}`}>
                {analyzingSteps.ocr ? (
                  <span className="vf-analyzing-step-check"><Icon.Check /></span>
                ) : (
                  <span className="vf-analyzing-step-spinner" />
                )}
                <span>Reading Document & OCR</span>
              </div>
              
              <div className={`vf-analyzing-step ${analyzingSteps.ocr && !analyzingSteps.face ? 'active' : (analyzingSteps.face ? 'done' : '')}`}>
                {analyzingSteps.face ? (
                  <span className="vf-analyzing-step-check"><Icon.Check /></span>
                ) : (
                  analyzingSteps.ocr ? <span className="vf-analyzing-step-spinner" /> : null
                )}
                <span>Biometric Face Matching</span>
              </div>

              <div className={`vf-analyzing-step ${analyzingSteps.face ? 'active' : ''}`}>
                {analyzingSteps.face ? <span className="vf-analyzing-step-spinner" /> : null}
                <span>Finalizing Verification</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Step 0: Select ID type */}
            {step === 0 && (
              <>
                <h3 className="vf-wizard-card-title">Select Your Document Type</h3>
                <p className="vf-wizard-card-desc">Choose the government-issued ID you'd like to use for verification.</p>
                <div className="vf-id-types">
                  {ID_TYPES.map((t) => {
                    const hasExisting = documents.some((d) => d.documentType === t.docType);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={'vf-id-type' + (selectedType === t.id ? ' selected' : '')}
                        onClick={() => { if (selectedType !== t.id) { setSelectedType(t.id); setFrontFile(null); setBackFile(null); setFrontDocId(null); setBackDocId(null); } }}
                      >
                        <span className="vf-id-type-text">
                          <span className="vf-id-type-label">{t.label}</span>
                          <span className="vf-id-type-desc">{t.desc}</span>
                        </span>
                        {hasExisting && <span className="vf-id-type-has-doc" title="Document already uploaded">doc on file</span>}
                        {selectedType === t.id && <span className="vf-id-type-check"><Icon.Check /></span>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Step 1: Upload */}
            {step === 1 && (
              <>
                <h3 className="vf-wizard-card-title">Upload Your Document</h3>
                <p className="vf-wizard-card-desc">Take a clear photo or upload a scan of your {selectedIdType?.label || 'ID'}.</p>

                <div className="vf-upload-areas">
                  {/* Front */}
                  <div className="vf-upload-box">
                    <span className="vf-upload-icon"><Icon.Camera /></span>
                    <span className="vf-upload-label">Front of Document</span>
                    {frontFile ? (
                      <div className="vf-upload-file-row">
                        <span className="vf-upload-check"><Icon.Check /> {frontFile.name}</span>
                        <button type="button" className="vf-upload-remove" onClick={() => setFrontFile(null)} title="Remove"><Icon.X /></button>
                      </div>
                    ) : frontDocId ? (
                      <div className="vf-upload-file-row">
                        <span className="vf-upload-check"><Icon.Check /> {frontSource?.originalFileName || 'Existing doc'}</span>
                        <button type="button" className="vf-upload-remove" onClick={() => setFrontDocId(null)} title="Remove"><Icon.X /></button>
                      </div>
                    ) : (
                      <label className="vf-upload-btn">
                        Choose File
                        <input type="file" accept="image/*" onChange={(e) => setFrontFile(e.target.files[0] || null)} hidden />
                      </label>
                    )}

                    {!frontFile && !frontDocId && (
                      <ExistingDocPicker
                        docs={matchingDocs}
                        selectedDocId={frontDocId}
                        onSelect={setFrontDocId}
                      />
                    )}
                  </div>

                  {/* Back */}
                  <div className="vf-upload-box">
                    <span className="vf-upload-icon"><Icon.Camera /></span>
                    <span className="vf-upload-label">Back of Document</span>
                    {backFile ? (
                      <div className="vf-upload-file-row">
                        <span className="vf-upload-check"><Icon.Check /> {backFile.name}</span>
                        <button type="button" className="vf-upload-remove" onClick={() => setBackFile(null)} title="Remove"><Icon.X /></button>
                      </div>
                    ) : backDocId ? (
                      <div className="vf-upload-file-row">
                        <span className="vf-upload-check"><Icon.Check /> {backSource?.originalFileName || 'Existing doc'}</span>
                        <button type="button" className="vf-upload-remove" onClick={() => setBackDocId(null)} title="Remove"><Icon.X /></button>
                      </div>
                    ) : (
                      <label className="vf-upload-btn">
                        Choose File
                        <input type="file" accept="image/*" onChange={(e) => setBackFile(e.target.files[0] || null)} hidden />
                      </label>
                    )}
                    {!backFile && !backDocId && (
                      <ExistingDocPicker
                        docs={matchingDocs}
                        selectedDocId={backDocId}
                        onSelect={setBackDocId}
                      />
                    )}
                    <span className="vf-upload-optional">Optional for passports</span>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Selfie */}
            {step === 2 && (
              <>
                <h3 className="vf-wizard-card-title">Take a Selfie</h3>
                <p className="vf-wizard-card-desc">We'll compare your selfie to the photo on your ID to confirm your identity.</p>
                <div className="vf-selfie-area">
                  <div className="vf-selfie-frame">
                    {cameraActive ? (
                      <><video ref={videoRef} autoPlay playsInline muted className="vf-selfie-preview" /><div className="vf-selfie-face-guide" /></>
                    ) : selfieFile ? (
                      <img src={URL.createObjectURL(selfieFile)} alt="Selfie preview" className="vf-selfie-preview" />
                    ) : (
                      <><span className="vf-selfie-icon"><Icon.User /></span><span className="vf-selfie-hint">Position your face in the frame</span></>
                    )}
                  </div>
                  <canvas ref={canvasRef} hidden />
                  {cameraError && <p className="vf-camera-error">{cameraError}</p>}
                  <div className="vf-selfie-actions">
                    {cameraActive ? (
                      <>
                        <button type="button" className="vf-selfie-btn vf-selfie-btn-capture" onClick={capturePhoto}>Take Photo</button>
                        <button type="button" className="vf-btn-outline vf-selfie-btn-cancel" onClick={stopCamera}>Cancel</button>
                      </>
                    ) : (
                      <button type="button" className="vf-selfie-btn" onClick={startCamera}>
                        {selfieFile ? 'Retake Selfie' : 'Open Camera'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="vf-tips">
                  <h4>Tips for a good selfie</h4>
                  <ul>
                    <li>Ensure good lighting on your face</li>
                    <li>Remove hats, glasses, or face coverings</li>
                    <li>Look directly at the camera</li>
                    <li>Keep a neutral expression</li>
                  </ul>
                </div>
              </>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <>
                <h3 className="vf-wizard-card-title">Review & Submit</h3>
                <p className="vf-wizard-card-desc">Please review your information before submitting.</p>
                <div className="vf-review-items">
                  <div className="vf-review-item">
                    <span className="vf-review-label">Document Type</span>
                    <span className="vf-review-value">{ID_TYPE_LABELS[selectedType]}</span>
                  </div>
                  <div className="vf-review-item">
                    <span className="vf-review-label">Front Image</span>
                    <span className="vf-review-value vf-review-check">
                      {frontFile ? frontFile.name : frontDocId ? `Existing: ${frontSource?.originalFileName || 'doc'}` : '—'}
                    </span>
                  </div>
                  <div className="vf-review-item">
                    <span className="vf-review-label">Back Image</span>
                    <span className="vf-review-value">
                      {backFile ? backFile.name : backDocId ? `Existing: ${backSource?.originalFileName || 'doc'}` : 'Not provided'}
                    </span>
                  </div>
                  <div className="vf-review-item">
                    <span className="vf-review-label">Selfie</span>
                    <span className="vf-review-value vf-review-check">{selfieFile ? 'Captured' : '—'}</span>
                  </div>
                </div>
                <div className="vf-consent">
                  <p>By submitting, you consent to Digital ID processing your biometric data and identity documents for verification purposes in accordance with our Privacy Policy.</p>
                </div>
                {submitError && <p className="vf-submit-error">{submitError}</p>}
                {loadingDocFile && <p className="vf-loading-inline">Loading existing document file…</p>}
              </>
            )}
          </>
        )}
      </div>

      {localVerification?.status === 'none' && !isAnalyzing && (
        <div className="vf-wizard-actions">
          <button type="button" className="vf-btn-outline" onClick={step > 0 ? () => setStep(step - 1) : onCancel} disabled={submitting}>
            {step > 0 ? 'Back' : 'Cancel'}
          </button>
          {step < WIZARD_STEPS.length - 1 ? (
            <button type="button" className="vf-btn-primary" onClick={() => setStep(step + 1)} disabled={!canProceed()}>Continue</button>
          ) : (
            <button type="button" className="vf-btn-primary" onClick={handleSubmit} disabled={submitting || loadingDocFile}>
              {submitting ? 'Processing…' : 'Submit Verification'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Verifications Section ─────────────────────────────────────────────────────

function VerificationsSection({ documents, onDocumentUploaded }) {
  // Identity verification state
  const [verification, setVerification] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [infoRequests, setInfoRequests] = useState([]);
  const [showWizard, setShowWizard] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const loadStatus = useCallback(() => {
    fetchVerificationStatus()
      .then(setVerification)
      .catch(() => setVerification({ status: 'none' }))
      .finally(() => setStatusLoading(false));
  }, []);

  const loadInfoRequests = useCallback(() => {
    getMyInfoRequests()
      .then((all) => setInfoRequests(Array.isArray(all) ? all : []))
      .catch(() => setInfoRequests([]));
  }, []);

  useEffect(() => {
    loadStatus();
    loadInfoRequests();
  }, [loadStatus, loadInfoRequests]);

  function handleVerifSubmitted(result) {
    setVerification(result);
    setShowWizard(false);
  }

  const pendingInfoRequests = infoRequests.filter(
    (r) => r.source === 'verification_review' && !r.userResponse
  );

  const hasVerification = verification && verification.status !== 'none';
  const identityVerified = verification?.status === 'VERIFIED' || verification?.status === 'verified';
  const canStartNewIdentity = !hasVerification || verification.status === 'REJECTED' || verification.status === 'rejected';

  function statusClass(s) {
    const map = { VERIFIED: 'vf-badge-verified', verified: 'vf-badge-verified', PENDING: 'vf-badge-pending', pending: 'vf-badge-pending', REJECTED: 'vf-badge-rejected', rejected: 'vf-badge-rejected' };
    return map[s] || 'vf-badge-inactive';
  }

  const isLoading = statusLoading;

  if (isLoading) {
    return (
      <div className="vf-loading">
        <div className="vf-spinner" />
        <span>Loading verifications…</span>
      </div>
    );
  }

  if (showWizard) {
    return (
      <VerificationWizard
        documents={documents}
        onCancel={() => setShowWizard(false)}
        onSubmitted={handleVerifSubmitted}
        onDocumentUploaded={onDocumentUploaded}
      />
    );
  }

  return (
    <div className="vf-verif-section">

      {/* ── Identity Verification ── */}
      <div className="vf-sub-section">
        <div className="vf-section-header">
          <div>
            <h3 className="vf-section-title">
              Digital ID Verification
              <span className="vf-required-badge">Required</span>
            </h3>
            <p className="vf-section-desc">Complete this step first to unlock all Digital ID features including credential verifications.</p>
          </div>
          {canStartNewIdentity && (
            <button type="button" className="vf-new-verif-btn" onClick={() => setShowWizard(true)}>
              <Icon.Plus /> {hasVerification ? 'Resubmit' : 'Start Verification'}
            </button>
          )}
        </div>

        {!identityVerified && (
          <div className="vf-identity-required-notice">
            <span className="vf-identity-required-icon"><Icon.Lock /></span>
            <div>
              <div className="vf-identity-required-title">Complete Digital ID Verification to unlock full access</div>
              <div className="vf-identity-required-desc">
                This is your core identity verification using a government-issued ID. It is required before you can use credential verifications, connected services, and all other Digital ID features.
              </div>
            </div>
          </div>
        )}

        {pendingInfoRequests.length > 0 && (
          <div className="vf-info-requests-banner">
            <div className="vf-info-requests-banner-icon"><Icon.Send /></div>
            <div>
              <div className="vf-info-requests-banner-title">
                {pendingInfoRequests.length} information request{pendingInfoRequests.length > 1 ? 's' : ''} pending
              </div>
              <div className="vf-info-requests-banner-desc">
                The reviewer needs more information. Click on your verification to respond.
              </div>
            </div>
            {hasVerification && (
              <button type="button" className="vf-respond-banner-btn" onClick={() => setShowDetail(true)}>
                View & Respond
              </button>
            )}
          </div>
        )}

        {!hasVerification ? (
          <div className="vf-verif-empty">
            <div className="vf-verif-empty-icon"><Icon.Shield /></div>
            <h4>No Identity Verification Submitted</h4>
            <p>Start a verification to confirm your identity. You'll need a government-issued ID and a selfie.</p>
            <button type="button" className="vf-btn-primary" onClick={() => setShowWizard(true)}>
              Start Identity Verification
            </button>
          </div>
        ) : (
          <div className="vf-verif-list">
            <div className="vf-verif-record" onClick={() => setShowDetail(true)}>
              <div className="vf-verif-record-left">
                <div className="vf-verif-record-icon"><Icon.Shield /></div>
                <div className="vf-verif-record-info">
                  <div className="vf-verif-record-title">
                    {ID_TYPE_LABELS[verification.idType] || verification.idType || 'Identity Verification'}
                  </div>
                  <div className="vf-verif-record-meta">
                    {verification.submittedAt && (
                      <span>Submitted {new Date(verification.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    )}
                    {pendingInfoRequests.length > 0 && (
                      <span className="vf-verif-record-action-needed">· Response needed</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="vf-verif-record-right">
                <span className={'vf-badge ' + statusClass(verification.status)}>{verification.status}</span>
                <span className="vf-verif-record-arrow">›</span>
              </div>
            </div>

            {(verification.status === 'VERIFIED' || verification.status === 'verified') && (
              <div className="vf-verif-verified-note">
                <Icon.CheckLg /> Your identity is verified — you have full access to all Digital ID services.
              </div>
            )}
            {(verification.status?.toUpperCase() === 'REJECTED') && (
              <div className="vf-verif-rejected-note">
                <div className="vf-verif-rejected-title">Verification Failed:</div>
                <div className="vf-verif-rejected-reason">
                  {cleanReviewerNotes(verification.reviewerNotes) || 'Your identity verification could not be automatically approved. Please ensure your documents are clear, well-lit, and match your profile information.'}
                </div>
                <button type="button" className="vf-btn-primary vf-btn-resubmit" onClick={() => setShowWizard(true)}>
                  Resubmit Verification
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showDetail && hasVerification && (
        <VerificationDetailModal
          verification={verification}
          infoRequests={infoRequests}
          onClose={() => setShowDetail(false)}
          onRefreshRequests={loadInfoRequests}
        />
      )}
    </div>
  );
}

// ── Documents Section ─────────────────────────────────────────────────────────

function DocumentsSection({ documents, loading, error, onRetry, onUpload, onReplace, onDelete, onView, replacingId, deletingId, viewingId }) {
  const [showUpload, setShowUpload] = useState(false);

  const existingByType = documents.reduce((acc, doc) => {
    (acc[doc.documentType] ??= []).push(doc);
    return acc;
  }, {});

  const orderedGroups = Object.entries(existingByType);

  async function handleUploadSubmit(payload) {
    const { replaceExisting, ...rest } = payload;
    if (replaceExisting && existingByType[rest.documentType]) {
      // Delete existing docs of this type first
      for (const existing of existingByType[rest.documentType]) {
        try { await onDelete(existing.id, true); } catch { /* non-blocking */ }
      }
    }
    return onUpload(rest);
  }

  return (
    <div className="vf-docs-section">
      <div className="vf-section-header">
        <div>
          <h3 className="vf-section-title">Documents</h3>
          <p className="vf-section-desc">Store your identity documents and reuse them in verification flows whenever you need them.</p>
        </div>
        <button type="button" className="vf-upload-trigger" onClick={() => setShowUpload(true)}>
          <Icon.Plus /> Upload Document
        </button>
      </div>

      {showUpload && (
        <UploadModal
          existingByType={existingByType}
          onClose={() => setShowUpload(false)}
          onSubmit={handleUploadSubmit}
          onViewExisting={onView}
          onReplaceExisting={onReplace}
          onDeleteExisting={(id) => onDelete(id, false)}
          replacingId={replacingId}
          deletingId={deletingId}
          viewingId={viewingId}
        />
      )}

      {loading && (
        <div className="vf-loading"><div className="vf-spinner" /><span>Loading documents…</span></div>
      )}

      {!loading && error && (
        <div className="vf-error"><p>{error}</p><button type="button" className="vf-retry-btn" onClick={onRetry}>Retry</button></div>
      )}

      {!loading && !error && documents.length === 0 && (
        <div className="vf-docs-empty">
          <span className="vf-docs-empty-icon"><Icon.Folder /></span>
          <h4>No documents uploaded</h4>
          <p>Upload documents here any time. They stay available for your own records and future verification use.</p>
        </div>
      )}

      {!loading && !error && orderedGroups.length > 0 && (
        <div className="vf-doc-list">
          {orderedGroups.map(([docType, docs]) => (
            <DocGroupCard
              key={docType}
              docType={docType}
              docs={docs}
              onView={onView}
              onReplace={onReplace}
              onDelete={(id) => onDelete(id, false)}
              replacingId={replacingId}
              deletingId={deletingId}
              viewingId={viewingId}
            />
          ))}
        </div>
      )}

      <div className="vf-security-card">
        <h3>Document Security</h3>
        <div className="vf-security-items">
          <div className="vf-security-item">
            <span className="vf-security-icon"><Icon.Lock /></span>
            <div>
              <span className="vf-security-title">End-to-End Encryption</span>
              <span className="vf-security-desc">All documents are encrypted at rest and in transit</span>
            </div>
          </div>
          <div className="vf-security-item">
            <span className="vf-security-icon"><Icon.Trash /></span>
            <div>
              <span className="vf-security-title">Auto-Delete</span>
              <span className="vf-security-desc">Raw images are deleted after verification completes</span>
            </div>
          </div>
          <div className="vf-security-item">
            <span className="vf-security-icon"><Icon.CheckShield /></span>
            <div>
              <span className="vf-security-title">SOC 2 Compliant</span>
              <span className="vf-security-desc">Infrastructure meets enterprise security standards</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function VerificationPage() {
  const [activeTab, setActiveTab] = useState('verifications');
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [docsError, setDocsError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [replacingId, setReplacingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);

  const loadDocuments = useCallback(() => {
    setDocsLoading(true);
    setDocsError(null);
    fetchDocuments()
      .then(setDocuments)
      .catch((err) => setDocsError(err.message))
      .finally(() => setDocsLoading(false));
  }, []);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const handleUpload = async (payload) => {
    const newDoc = await uploadDocument(payload);
    setDocuments((prev) => [newDoc, ...prev]);
    return newDoc;
  };

  const handleReplace = async (id, file) => {
    setReplacingId(id);
    try {
      const updated = await replaceDocument(id, file);
      setDocuments((prev) => prev.map((d) => d.id === id ? updated : d));
    } catch (err) {
      alert(err.message);
    } finally {
      setReplacingId(null);
    }
  };

  const handleDelete = async (id, silent = false) => {
    setDeletingId(id);
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      if (!silent) alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = async (id) => {
    setViewingId(id);
    try {
      await openDocumentFile(id);
    } catch (err) {
      alert(err.message);
    } finally {
      setViewingId(null);
    }
  };

  const handleDocumentUploaded = (newDoc) => {
    setDocuments((prev) => {
      const exists = prev.some((d) => d.id === newDoc.id);
      return exists ? prev : [newDoc, ...prev];
    });
  };

  return (
    <div className="vf-page">
      {/* Page header */}
      <div className="vf-page-header">
        <div>
          <h2>Verification Center</h2>
          <p className="vf-page-subtitle">
            Manage your identity verification and store documents in one place.
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="vf-tabs">
        <button
          type="button"
          className={'vf-tab' + (activeTab === 'verifications' ? ' active' : '')}
          onClick={() => setActiveTab('verifications')}
        >
          <Icon.Shield /> Verifications
        </button>
        <button
          type="button"
          className={'vf-tab' + (activeTab === 'documents' ? ' active' : '')}
          onClick={() => setActiveTab('documents')}
        >
          <Icon.File /> Documents
          {documents.length > 0 && (
            <span className="vf-tab-count">{documents.length}</span>
          )}
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'verifications' && (
        <VerificationsSection
          documents={documents}
          onDocumentUploaded={handleDocumentUploaded}
        />
      )}

      {activeTab === 'documents' && (
        <DocumentsSection
          documents={documents}
          loading={docsLoading}
          error={docsError}
          onRetry={loadDocuments}
          onUpload={handleUpload}
          onReplace={handleReplace}
          onDelete={handleDelete}
          onView={handleView}
          replacingId={replacingId}
          deletingId={deletingId}
          viewingId={viewingId}
        />
      )}
    </div>
  );
}
