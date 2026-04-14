import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import {
  listTemplates, createTemplate, updateTemplate, deleteTemplate,
  listCampaigns, createCampaign, updateCampaign, sendCampaign, cancelCampaign,
} from '../../../api/marketing';
import './AdminMarketing.css';

const STATUS_COLORS = {
  DRAFT: { bg: '#1e2a3a', color: '#94a3b8' },
  SCHEDULED: { bg: '#1a2d4a', color: '#60a5fa' },
  SENT: { bg: '#14291e', color: '#34d399' },
  CANCELLED: { bg: '#2d1e1e', color: '#f87171' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.DRAFT;
  return (
    <span className="mkt-badge" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

// ── Template Form Modal ───────────────────────────────────────────────────────

function TemplateModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    subject: initial?.subject ?? '',
    category: initial?.category ?? 'general',
    bodyHtml: initial?.bodyHtml ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.subject.trim() || !form.bodyHtml.trim()) {
      setErr('Name, subject and body are required.');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      await onSave(form);
      onClose();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mkt-modal-backdrop" onClick={onClose}>
      <div className="mkt-modal" onClick={e => e.stopPropagation()}>
        <div className="mkt-modal-header">
          <h3>{initial ? 'Edit Template' : 'New Template'}</h3>
          <button type="button" className="mkt-modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="mkt-form">
          <label className="mkt-label">Name
            <input className="mkt-input" value={form.name} onChange={e => set('name', e.target.value)} />
          </label>
          <label className="mkt-label">Subject
            <input className="mkt-input" value={form.subject} onChange={e => set('subject', e.target.value)} />
          </label>
          <label className="mkt-label">Category
            <input className="mkt-input" value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. welcome, newsletter" />
          </label>
          <label className="mkt-label">Body HTML
            <textarea className="mkt-textarea" rows={10} value={form.bodyHtml} onChange={e => set('bodyHtml', e.target.value)} />
          </label>
          {err && <p className="mkt-err">{err}</p>}
          <div className="mkt-form-actions">
            <button type="button" className="mkt-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="mkt-btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Campaign Form Modal ───────────────────────────────────────────────────────

function CampaignModal({ initial, templates, onSave, onClose }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    templateId: initial?.templateId ?? (templates[0]?.id ?? ''),
    targetAudience: initial?.targetAudience ?? 'OPTED_IN',
    scheduledAt: initial?.scheduledAt ? initial.scheduledAt.slice(0, 16) : '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setErr('Name is required.'); return; }
    setSaving(true);
    setErr('');
    try {
      await onSave({ ...form, scheduledAt: form.scheduledAt || null });
      onClose();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mkt-modal-backdrop" onClick={onClose}>
      <div className="mkt-modal" onClick={e => e.stopPropagation()}>
        <div className="mkt-modal-header">
          <h3>{initial ? 'Edit Campaign' : 'New Campaign'}</h3>
          <button type="button" className="mkt-modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="mkt-form">
          <label className="mkt-label">Campaign Name
            <input className="mkt-input" value={form.name} onChange={e => set('name', e.target.value)} />
          </label>
          <label className="mkt-label">Template
            <select className="mkt-select" value={form.templateId} onChange={e => set('templateId', e.target.value)}>
              <option value="">— none —</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>
          <label className="mkt-label">Target Audience
            <select className="mkt-select" value={form.targetAudience} onChange={e => set('targetAudience', e.target.value)}>
              <option value="OPTED_IN">Opted-in users only</option>
              <option value="ALL">All users</option>
            </select>
          </label>
          <label className="mkt-label">Schedule (optional — leave blank for draft)
            <input className="mkt-input" type="datetime-local" value={form.scheduledAt} onChange={e => set('scheduledAt', e.target.value)} />
          </label>
          {err && <p className="mkt-err">{err}</p>}
          <div className="mkt-form-actions">
            <button type="button" className="mkt-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="mkt-btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AdminMarketing() {
  const [tab, setTab] = useState('campaigns');
  const [templates, setTemplates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [tmplModal, setTmplModal] = useState(null);   // null | 'new' | template object
  const [campModal, setCampModal] = useState(null);   // null | 'new' | campaign object

  // Preview
  const [preview, setPreview] = useState(null);       // template object | null

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [tmpl, camp] = await Promise.all([listTemplates(), listCampaigns()]);
      setTemplates(tmpl);
      setCampaigns(camp);
    } catch (ex) {
      setError(ex.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // ── Template actions ──────────────────────────────────────────────────────

  async function handleSaveTemplate(form) {
    if (tmplModal && tmplModal !== 'new') {
      await updateTemplate(tmplModal.id, form);
    } else {
      await createTemplate(form);
    }
    await load();
  }

  async function handleDeleteTemplate(id) {
    if (!window.confirm('Delete this template?')) return;
    try {
      await deleteTemplate(id);
      await load();
    } catch (ex) {
      setError(ex.message);
    }
  }

  // ── Campaign actions ──────────────────────────────────────────────────────

  async function handleSaveCampaign(form) {
    if (campModal && campModal !== 'new') {
      await updateCampaign(campModal.id, form);
    } else {
      await createCampaign(form);
    }
    await load();
  }

  async function handleSend(id) {
    if (!window.confirm('Send this campaign now?')) return;
    try {
      await sendCampaign(id);
      await load();
    } catch (ex) {
      setError(ex.message);
    }
  }

  async function handleCancel(id) {
    if (!window.confirm('Cancel this campaign?')) return;
    try {
      await cancelCampaign(id);
      await load();
    } catch (ex) {
      setError(ex.message);
    }
  }

  return (
    <AdminLayout variant="admin">
      <div className="mkt-page">
        <div className="mkt-header">
          <div>
            <h1 className="mkt-title">Marketing</h1>
            <p className="mkt-subtitle">Manage email templates and campaigns</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mkt-tabs">
          <button type="button" className={`mkt-tab${tab === 'campaigns' ? ' active' : ''}`} onClick={() => setTab('campaigns')}>
            Campaigns
          </button>
          <button type="button" className={`mkt-tab${tab === 'templates' ? ' active' : ''}`} onClick={() => setTab('templates')}>
            Templates
          </button>
        </div>

        {error && <div className="mkt-error-banner">{error}</div>}

        {/* ── Campaigns tab ─────────────────────────────────────── */}
        {tab === 'campaigns' && (
          <div className="mkt-section">
            <div className="mkt-section-header">
              <h2 className="mkt-section-title">Campaigns</h2>
              <button type="button" className="mkt-btn-primary" onClick={() => setCampModal('new')}>
                + New Campaign
              </button>
            </div>

            {loading ? (
              <p className="mkt-loading">Loading…</p>
            ) : campaigns.length === 0 ? (
              <p className="mkt-empty">No campaigns yet. Create one to get started.</p>
            ) : (
              <div className="mkt-table-wrap">
                <table className="mkt-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Template</th>
                      <th>Audience</th>
                      <th>Status</th>
                      <th>Scheduled</th>
                      <th>Sent</th>
                      <th>Recipients</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map(c => (
                      <tr key={c.id}>
                        <td className="mkt-td-name">{c.name}</td>
                        <td>{c.templateName || '—'}</td>
                        <td>{c.targetAudience === 'ALL' ? 'All users' : 'Opted-in'}</td>
                        <td><StatusBadge status={c.status} /></td>
                        <td>{fmt(c.scheduledAt)}</td>
                        <td>{fmt(c.sentAt)}</td>
                        <td>{c.status === 'SENT' ? c.sentCount : '—'}</td>
                        <td>
                          <div className="mkt-actions">
                            {(c.status === 'DRAFT' || c.status === 'SCHEDULED') && (
                              <>
                                <button type="button" className="mkt-action-btn edit" onClick={() => setCampModal(c)}>Edit</button>
                                <button type="button" className="mkt-action-btn send" onClick={() => handleSend(c.id)}>Send now</button>
                                <button type="button" className="mkt-action-btn cancel" onClick={() => handleCancel(c.id)}>Cancel</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Templates tab ─────────────────────────────────────── */}
        {tab === 'templates' && (
          <div className="mkt-section">
            <div className="mkt-section-header">
              <h2 className="mkt-section-title">Email Templates</h2>
              <button type="button" className="mkt-btn-primary" onClick={() => setTmplModal('new')}>
                + New Template
              </button>
            </div>

            {loading ? (
              <p className="mkt-loading">Loading…</p>
            ) : templates.length === 0 ? (
              <p className="mkt-empty">No templates found.</p>
            ) : (
              <div className="mkt-cards">
                {templates.map(t => (
                  <div key={t.id} className="mkt-card">
                    <div className="mkt-card-head">
                      <span className="mkt-card-category">{t.category}</span>
                      <span className="mkt-card-id">#{t.id}</span>
                    </div>
                    <h3 className="mkt-card-name">{t.name}</h3>
                    <p className="mkt-card-subject">{t.subject}</p>
                    <div className="mkt-card-actions">
                      <button type="button" className="mkt-action-btn" onClick={() => setPreview(t)}>Preview</button>
                      <button type="button" className="mkt-action-btn edit" onClick={() => setTmplModal(t)}>Edit</button>
                      <button type="button" className="mkt-action-btn cancel" onClick={() => handleDeleteTemplate(t.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Template modal */}
      {tmplModal && (
        <TemplateModal
          initial={tmplModal === 'new' ? null : tmplModal}
          onSave={handleSaveTemplate}
          onClose={() => setTmplModal(null)}
        />
      )}

      {/* Campaign modal */}
      {campModal && (
        <CampaignModal
          initial={campModal === 'new' ? null : campModal}
          templates={templates}
          onSave={handleSaveCampaign}
          onClose={() => setCampModal(null)}
        />
      )}

      {/* HTML preview modal */}
      {preview && (
        <div className="mkt-modal-backdrop" onClick={() => setPreview(null)}>
          <div className="mkt-modal mkt-preview-modal" onClick={e => e.stopPropagation()}>
            <div className="mkt-modal-header">
              <h3>Preview: {preview.name}</h3>
              <button type="button" className="mkt-modal-close" onClick={() => setPreview(null)}>×</button>
            </div>
            <p className="mkt-preview-subject"><strong>Subject:</strong> {preview.subject}</p>
            <div className="mkt-preview-body" dangerouslySetInnerHTML={{ __html: preview.bodyHtml }} />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
