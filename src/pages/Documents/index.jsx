import { useState, useEffect, useCallback } from 'react';
import { fetchDocuments, uploadDocument, deleteDocument, openDocumentFile } from '../../api/documents';
import './Documents.css';

/* ── Monochrome SVG icons ── */
const Icon = {
  IdCard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <path d="M14 10h4M14 14h3" />
    </svg>
  ),
  Passport: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <circle cx="12" cy="11" r="3" />
      <path d="M8 18h8" />
    </svg>
  ),
  Building: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-4h6v4" />
    </svg>
  ),
  Shield: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Scroll: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  ),
  CreditCard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  Home: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  ),
  BarChart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 16v-4M12 16V8M16 16v-6" />
    </svg>
  ),
  File: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  Upload: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Lock: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Trash: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  CheckShield: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  XSmall: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Folder: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

const DOCUMENT_TYPES = [
  { id: 'drivers_license', Icon: Icon.IdCard,     label: "Driver's License" },
  { id: 'passport',        Icon: Icon.Passport,   label: 'Passport' },
  { id: 'state_id',        Icon: Icon.Building,   label: 'State ID Card' },
  { id: 'military_id',     Icon: Icon.Shield,     label: 'Military ID' },
  { id: 'birth_cert',      Icon: Icon.Scroll,     label: 'Birth Certificate' },
  { id: 'ssn_card',        Icon: Icon.CreditCard, label: 'Social Security Card' },
  { id: 'utility_bill',    Icon: Icon.Home,       label: 'Utility Bill' },
  { id: 'tax_return',      Icon: Icon.BarChart,   label: 'Tax Return' },
];

const TYPE_MAP = Object.fromEntries(DOCUMENT_TYPES.map((t) => [t.id, t]));

function getDocIcon(documentType) {
  return TYPE_MAP[documentType]?.Icon ?? Icon.File;
}

function getDocLabel(documentType) {
  return TYPE_MAP[documentType]?.label ?? documentType;
}

function UploadModal({ onClose, onSubmit }) {
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [uploadFile, setUploadFile]           = useState(null);
  const [issuer, setIssuer]                   = useState('');
  const [expiresAt, setExpiresAt]             = useState('');
  const [submitting, setSubmitting]           = useState(false);
  const [submitError, setSubmitError]         = useState(null);

  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        documentType: selectedDocType,
        issuer: issuer.trim() || null,
        expiresAt: expiresAt || null,
        file: uploadFile,
      });
      onClose();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = uploadFile && selectedDocType && !submitting;

  return (
    <div className="docs-modal-backdrop" onClick={onClose}>
      <div className="docs-modal" onClick={(e) => e.stopPropagation()}>

        <div className="docs-modal-header">
          <div>
            <h3 className="docs-modal-title">Upload Document</h3>
            <p className="docs-modal-subtitle">Choose a document type and upload a clear photo or scan.</p>
          </div>
          <button type="button" className="docs-modal-close" onClick={onClose} aria-label="Close">
            <Icon.X />
          </button>
        </div>

        <div className="docs-modal-body">
          <p className="docs-modal-label">Document type</p>
          <div className="docs-type-grid">
            {DOCUMENT_TYPES.map((dt) => (
              <button
                key={dt.id}
                type="button"
                className={'docs-type-chip' + (selectedDocType === dt.id ? ' selected' : '')}
                onClick={() => setSelectedDocType(dt.id)}
              >
                <span className="docs-type-chip-icon"><dt.Icon /></span>
                <span>{dt.label}</span>
                {selectedDocType === dt.id && (
                  <span className="docs-type-chip-check"><Icon.Check /></span>
                )}
              </button>
            ))}
          </div>

          <div className={'docs-drop-zone' + (selectedDocType ? '' : ' disabled')}>
            {uploadFile ? (
              <div className="docs-drop-file">
                <span className="docs-drop-file-icon"><Icon.File /></span>
                <span className="docs-drop-file-name">{uploadFile.name}</span>
                <button type="button" className="docs-drop-file-remove" onClick={() => setUploadFile(null)}>
                  <Icon.XSmall />
                </button>
              </div>
            ) : (
              <>
                <div className="docs-drop-icon-wrap"><Icon.Upload /></div>
                <span className="docs-drop-text">
                  {selectedDocType ? 'Drag & drop your file here' : 'Select a document type first'}
                </span>
                {selectedDocType && (
                  <label className="docs-choose-btn">
                    Browse files
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setUploadFile(e.target.files[0] || null)}
                      hidden
                    />
                  </label>
                )}
                <span className="docs-drop-hint">JPEG, PNG, PDF — max 10 MB</span>
              </>
            )}
          </div>

          <div className="docs-modal-fields">
            <div className="docs-field">
              <label className="docs-field-label" htmlFor="doc-issuer">Issuer <span className="docs-field-optional">(optional)</span></label>
              <input
                id="doc-issuer"
                type="text"
                className="docs-field-input"
                placeholder="e.g. California DMV"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                maxLength={150}
              />
            </div>
            <div className="docs-field">
              <label className="docs-field-label" htmlFor="doc-expires">Expiry date <span className="docs-field-optional">(optional)</span></label>
              <input
                id="doc-expires"
                type="date"
                className="docs-field-input"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          {submitError && (
            <p className="docs-submit-error">{submitError}</p>
          )}
        </div>

        <div className="docs-modal-footer">
          <button type="button" className="docs-modal-cancel" onClick={onClose} disabled={submitting}>Cancel</button>
          <button
            type="button"
            className="docs-submit-btn"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {submitting ? 'Uploading…' : 'Upload & Submit'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [viewingId, setViewingId]   = useState(null);

  const loadDocuments = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchDocuments()
      .then(setDocuments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleUploadSubmit = async (payload) => {
    const newDoc = await uploadDocument(payload);
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert(err.message);
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

  return (
    <div className="docs-page">
      <div className="docs-header">
        <div>
          <h2>Documents</h2>
          <p className="docs-subtitle">
            Manage your identity documents, upload new ones, and track their verification status.
          </p>
        </div>
        <button type="button" className="docs-upload-trigger" onClick={() => setShowUpload(true)}>
          + Upload Document
        </button>
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSubmit={handleUploadSubmit}
        />
      )}

      {loading && (
        <div className="docs-loading">
          <div className="docs-spinner" />
          <span>Loading documents…</span>
        </div>
      )}

      {!loading && error && (
        <div className="docs-error">
          <p>{error}</p>
          <button type="button" className="docs-retry-btn" onClick={loadDocuments}>Retry</button>
        </div>
      )}

      {!loading && !error && documents.length === 0 && (
        <div className="docs-empty">
          <span className="docs-empty-icon"><Icon.Folder /></span>
          <h3>No documents uploaded</h3>
          <p>Upload identity documents to verify your identity and unlock services.</p>
        </div>
      )}

      {!loading && !error && documents.length > 0 && (
        <div className="docs-list">
          {documents.map((doc) => {
            const DocIcon = getDocIcon(doc.documentType);
            return (
              <div key={doc.id} className="docs-card">
                <div className="docs-card-top">
                  <span className="docs-card-icon"><DocIcon /></span>
                  <div className="docs-card-info">
                    <span className="docs-card-type">{getDocLabel(doc.documentType)}</span>
                    {doc.issuer && <span className="docs-card-issuer">{doc.issuer}</span>}
                  </div>
                  <span className={'docs-status ' + doc.status}>
                    {doc.status === 'verified' && '✓ '}
                    {doc.status === 'pending'  && '○ '}
                    {doc.status === 'rejected' && '✕ '}
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </span>
                </div>
                <div className="docs-card-details">
                  <div className="docs-detail">
                    <span className="docs-detail-label">Uploaded</span>
                    <span className="docs-detail-value">{doc.uploadedAt ?? '—'}</span>
                  </div>
                  {doc.expiresAt && (
                    <div className="docs-detail">
                      <span className="docs-detail-label">Expires</span>
                      <span className="docs-detail-value">{doc.expiresAt}</span>
                    </div>
                  )}
                  <div className="docs-detail">
                    <span className="docs-detail-label">File</span>
                    <span className="docs-detail-value">{doc.originalFileName}</span>
                  </div>
                </div>
                <div className="docs-card-actions">
                  <button
                    type="button"
                    className="docs-view-btn"
                    onClick={() => handleView(doc.id)}
                    disabled={viewingId === doc.id}
                  >
                    {viewingId === doc.id ? 'Opening…' : 'View'}
                  </button>
                  <button
                    type="button"
                    className="docs-remove-btn"
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                  >
                    {deletingId === doc.id ? 'Removing…' : 'Remove'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="docs-info-card">
        <h3>Document Security</h3>
        <div className="docs-info-items">
          <div className="docs-info-item">
            <span className="docs-info-icon"><Icon.Lock /></span>
            <div>
              <span className="docs-info-title">End-to-End Encryption</span>
              <span className="docs-info-desc">All documents are encrypted at rest and in transit</span>
            </div>
          </div>
          <div className="docs-info-item">
            <span className="docs-info-icon"><Icon.Trash /></span>
            <div>
              <span className="docs-info-title">Auto-Delete</span>
              <span className="docs-info-desc">Raw images are deleted after verification completes</span>
            </div>
          </div>
          <div className="docs-info-item">
            <span className="docs-info-icon"><Icon.CheckShield /></span>
            <div>
              <span className="docs-info-title">SOC 2 Compliant</span>
              <span className="docs-info-desc">Infrastructure meets enterprise security standards</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
