import { useState } from 'react';
import './Documents.css';

const MOCK_DOCUMENTS = [
  {
    id: 1,
    type: "Driver's License",
    icon: '🪪',
    issuer: 'California DMV',
    status: 'verified',
    uploadedAt: '2026-01-15',
    expiresAt: '2030-01-15',
  },
  {
    id: 2,
    type: 'U.S. Passport',
    icon: '📘',
    issuer: 'U.S. Department of State',
    status: 'verified',
    uploadedAt: '2026-01-15',
    expiresAt: '2035-06-20',
  },
];

const DOCUMENT_TYPES = [
  { id: 'drivers_license', icon: '🪪', label: "Driver's License" },
  { id: 'passport', icon: '📘', label: 'Passport' },
  { id: 'state_id', icon: '🏛️', label: 'State ID Card' },
  { id: 'military_id', icon: '🎖️', label: 'Military ID' },
  { id: 'birth_cert', icon: '📜', label: 'Birth Certificate' },
  { id: 'ssn_card', icon: '💳', label: 'Social Security Card' },
  { id: 'utility_bill', icon: '🏠', label: 'Utility Bill (Proof of Address)' },
  { id: 'tax_return', icon: '📊', label: 'Tax Return' },
];

export default function Documents() {
  const [documents] = useState(MOCK_DOCUMENTS);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);

  return (
    <div className="docs-page">
      <div className="docs-header">
        <div>
          <h2>Documents</h2>
          <p className="docs-subtitle">
            Manage your identity documents, upload new ones, and track their verification status.
          </p>
        </div>
        <button
          type="button"
          className="docs-upload-trigger"
          onClick={() => setShowUpload(!showUpload)}
        >
          {showUpload ? 'Cancel' : '+ Upload Document'}
        </button>
      </div>

      {showUpload && (
        <div className="docs-upload-panel">
          <h3>Upload New Document</h3>
          <div className="docs-type-grid">
            {DOCUMENT_TYPES.map((dt) => (
              <button
                key={dt.id}
                type="button"
                className={'docs-type-chip' + (selectedDocType === dt.id ? ' selected' : '')}
                onClick={() => setSelectedDocType(dt.id)}
              >
                <span>{dt.icon}</span>
                <span>{dt.label}</span>
              </button>
            ))}
          </div>

          {selectedDocType && (
            <div className="docs-upload-area">
              <div className="docs-drop-zone">
                <span className="docs-drop-icon">📤</span>
                <span className="docs-drop-text">
                  {uploadFile ? uploadFile.name : 'Drag & drop or click to upload'}
                </span>
                <label className="docs-choose-btn">
                  Choose File
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setUploadFile(e.target.files[0] || null)}
                    hidden
                  />
                </label>
                <span className="docs-drop-hint">Accepted: JPEG, PNG, PDF — Max 10MB</span>
              </div>
              <button
                type="button"
                className="docs-submit-btn"
                disabled={!uploadFile}
                onClick={() => {
                  setShowUpload(false);
                  setSelectedDocType(null);
                  setUploadFile(null);
                }}
              >
                Upload & Submit for Review
              </button>
            </div>
          )}
        </div>
      )}

      {documents.length === 0 ? (
        <div className="docs-empty">
          <span className="docs-empty-icon">📁</span>
          <h3>No documents uploaded</h3>
          <p>Upload identity documents to verify your identity and unlock services.</p>
        </div>
      ) : (
        <div className="docs-list">
          {documents.map((doc) => (
            <div key={doc.id} className="docs-card">
              <div className="docs-card-top">
                <span className="docs-card-icon">{doc.icon}</span>
                <div className="docs-card-info">
                  <span className="docs-card-type">{doc.type}</span>
                  <span className="docs-card-issuer">{doc.issuer}</span>
                </div>
                <span className={'docs-status ' + doc.status}>
                  {doc.status === 'verified' && '✓ '}
                  {doc.status === 'pending' && '○ '}
                  {doc.status === 'rejected' && '✕ '}
                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                </span>
              </div>
              <div className="docs-card-details">
                <div className="docs-detail">
                  <span className="docs-detail-label">Uploaded</span>
                  <span className="docs-detail-value">{doc.uploadedAt}</span>
                </div>
                <div className="docs-detail">
                  <span className="docs-detail-label">Expires</span>
                  <span className="docs-detail-value">{doc.expiresAt}</span>
                </div>
              </div>
              <div className="docs-card-actions">
                <button type="button" className="docs-view-btn">View</button>
                <button type="button" className="docs-replace-btn">Replace</button>
                <button type="button" className="docs-remove-btn">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="docs-info-card">
        <h3>Document Security</h3>
        <div className="docs-info-items">
          <div className="docs-info-item">
            <span className="docs-info-icon">🔒</span>
            <div>
              <span className="docs-info-title">End-to-End Encryption</span>
              <span className="docs-info-desc">All documents are encrypted at rest and in transit</span>
            </div>
          </div>
          <div className="docs-info-item">
            <span className="docs-info-icon">🗑️</span>
            <div>
              <span className="docs-info-title">Auto-Delete</span>
              <span className="docs-info-desc">Raw images are deleted after verification completes</span>
            </div>
          </div>
          <div className="docs-info-item">
            <span className="docs-info-icon">🛡️</span>
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
