import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import PasswordConfirmModal from '../../../components/admin/PasswordConfirmModal';
import {
  adminListInstitutions,
  adminCreateInstitution,
  adminUpdateInstitution,
  adminDeleteInstitution,
  adminAssignInstAdmin,
  adminGetInstitutionMembers,
  adminListUsers,
} from '../../../api/admin';
import { COUNTRIES, fetchStates } from '../../../utils/geoData';

const EMPTY_FORM = {
  name: '', code: '', type: '', description: '',
  website: '', email: '', phone: '', address: '',
  city: '', country: '', state: '', pincode: '', county: '',
};

const INST_TYPES = ['UNIVERSITY', 'GOVERNMENT', 'HEALTHCARE', 'BANK', 'CORPORATE', 'NGO', 'OTHER'];

function typeBadge(type) {
  if (!type) return '—';
  const colors = {
    UNIVERSITY: '#1e3a5f',   GOVERNMENT: '#14532d', HEALTHCARE: '#3d1b5e',
    BANK:       '#3d2e00',   CORPORATE:  '#1e2a3a', NGO:        '#1a3a1a',
    OTHER:      '#1e2a3a',
  };
  const text = {
    UNIVERSITY: '#60a5fa', GOVERNMENT: '#4ade80', HEALTHCARE: '#c084fc',
    BANK:       '#fbbf24', CORPORATE:  '#94a3b8', NGO:        '#86efac',
    OTHER:      '#64748b',
  };
  return (
    <span className="badge" style={{ background: colors[type] || '#1e2a3a', color: text[type] || '#94a3b8' }}>
      {type}
    </span>
  );
}

function InstitutionFormModal({ title, initial, onSave, onClose, busy }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [states, setStates] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function onCountryChange(country) {
    set('country', country);
    set('state', '');
    if (country) {
      setLoadingStates(true);
      const s = await fetchStates(country);
      setStates(s);
      setLoadingStates(false);
    } else {
      setStates([]);
    }
  }

  useEffect(() => {
    if (form.country) fetchStates(form.country).then(s => setStates(s));
  }, [form.country]);

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <p className="admin-modal-title">{title}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 14px', marginBottom: 20, maxHeight: '65vh', overflowY: 'auto', paddingRight: 4 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="admin-label">Name *</label>
            <input className="admin-input" style={{ width: '100%' }} placeholder="Full institution name"
              value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="admin-label">Code</label>
            <input className="admin-input" style={{ width: '100%' }} placeholder="e.g. MIT"
              value={form.code} onChange={e => set('code', e.target.value)} />
          </div>
          <div>
            <label className="admin-label">Type</label>
            <select className="admin-select" style={{ width: '100%' }}
              value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="">Select type…</option>
              {INST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="admin-label">Description</label>
            <textarea className="admin-input" style={{ width: '100%', resize: 'vertical', minHeight: 60 }}
              placeholder="Brief description"
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div>
            <label className="admin-label">Email</label>
            <input className="admin-input" style={{ width: '100%' }} placeholder="contact@institution.com"
              value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div>
            <label className="admin-label">Phone</label>
            <input className="admin-input" style={{ width: '100%' }} placeholder="+1 555 000 0000"
              value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="admin-label">Website</label>
            <input className="admin-input" style={{ width: '100%' }} placeholder="https://institution.edu"
              value={form.website} onChange={e => set('website', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="admin-label">Address</label>
            <input className="admin-input" style={{ width: '100%' }} placeholder="Street address"
              value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
          <div>
            <label className="admin-label">Country</label>
            <select className="admin-select" style={{ width: '100%' }}
              value={form.country} onChange={e => onCountryChange(e.target.value)}>
              <option value="">Select country…</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="admin-label">State / Province</label>
            {states.length > 0 ? (
              <select className="admin-select" style={{ width: '100%' }}
                value={form.state} onChange={e => set('state', e.target.value)}>
                <option value="">{loadingStates ? 'Loading…' : 'Select state…'}</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <input className="admin-input" style={{ width: '100%' }}
                placeholder={loadingStates ? 'Loading…' : 'State / Province'}
                value={form.state} onChange={e => set('state', e.target.value)} />
            )}
          </div>
          <div>
            <label className="admin-label">City</label>
            <input className="admin-input" style={{ width: '100%' }} placeholder="City"
              value={form.city} onChange={e => set('city', e.target.value)} />
          </div>
          <div>
            <label className="admin-label">Pincode / ZIP</label>
            <input className="admin-input" style={{ width: '100%' }} placeholder="e.g. 10001"
              value={form.pincode} onChange={e => set('pincode', e.target.value)} />
          </div>
          <div>
            <label className="admin-label">County <span style={{ color: '#64748b', fontSize: '0.75rem' }}>(optional)</span></label>
            <input className="admin-input" style={{ width: '100%' }} placeholder="County / District"
              value={form.county} onChange={e => set('county', e.target.value)} />
          </div>
        </div>

        <div className="admin-modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}
            disabled={busy || !form.name.trim()}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-label">{label}</div>
      <div className={`admin-stat-value${color ? ` ${color}` : ''}`}>{value}</div>
    </div>
  );
}

export default function AdminInstitutions() {
  const navigate = useNavigate();
  const [allInstitutions, setAllInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [assignItem, setAssignItem] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignSearch, setAssignSearch] = useState('');
  const [currentAdmins, setCurrentAdmins] = useState([]);
  const [membersInst, setMembersInst] = useState(null);
  const [members, setMembers] = useState([]);

  function load() {
    setLoading(true);
    adminListInstitutions()
      .then(setAllInstitutions)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  // Client-side filtering
  const isFiltering = q.trim() || typeFilter;

  const filtered = allInstitutions.filter(inst => {
    if (typeFilter && inst.type !== typeFilter) return false;
    if (q.trim()) {
      const lq = q.trim().toLowerCase();
      if (
        !inst.name?.toLowerCase().includes(lq) &&
        !inst.code?.toLowerCase().includes(lq) &&
        !inst.city?.toLowerCase().includes(lq) &&
        !inst.country?.toLowerCase().includes(lq)
      ) return false;
    }
    return true;
  });

  // Sort by updatedAt desc (fallback to createdAt)
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
  );

  const displayed = isFiltering ? sorted : sorted.slice(0, 5);

  // Stats
  const typeCount = INST_TYPES.reduce((acc, t) => {
    acc[t] = allInstitutions.filter(i => i.type === t).length;
    return acc;
  }, {});
  const topType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0];
  const totalMembers = allInstitutions.reduce((s, i) => s + (i.memberCount || 0), 0);

  async function create(form) {
    setBusy(true);
    try {
      await adminCreateInstitution(form);
      setShowCreate(false);
      load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function update(form) {
    if (!editItem) return;
    setBusy(true);
    try {
      await adminUpdateInstitution(editItem.id, form);
      setEditItem(null);
      load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function doDelete(password) {
    await adminDeleteInstitution(deleteItem.id, password);
    setDeleteItem(null);
    load();
  }

  async function openAssign(inst) {
    setAssignItem(inst);
    setAssignUserId('');
    setAssignSearch('');
    setCurrentAdmins([]);
    const [users, members] = await Promise.all([
      adminListUsers({}).catch(() => []),
      adminGetInstitutionMembers(inst.id).catch(() => []),
    ]);
    setAllUsers(users.filter(u => u.role === 'USER'));
    setCurrentAdmins(members.filter(m => m.role === 'INST_ADMIN'));
  }

  async function doAssign() {
    if (!assignItem || !assignUserId) return;
    setBusy(true);
    try {
      await adminAssignInstAdmin(assignItem.id, Number(assignUserId));
      setAssignItem(null);
      load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function openMembers(inst) {
    setMembersInst(inst);
    const m = await adminGetInstitutionMembers(inst.id).catch(() => []);
    setMembers(m);
  }

  return (
    <AdminLayout variant="admin">
      <div className="admin-page">
        <div className="admin-page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 className="admin-page-title">Institutions</h1>
            <p className="admin-page-subtitle">Manage institutions and their admins</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            + New Institution
          </button>
        </div>

        {error && <div className="admin-error">{error}</div>}

        {/* Stats */}
        {!loading && (
          <div className="admin-stats-grid">
            <StatCard label="Total" value={allInstitutions.length} color="blue" />
            <StatCard label="Total Members" value={totalMembers} color="green" />
            <StatCard label="Universities" value={typeCount.UNIVERSITY || 0} />
            <StatCard label="Government" value={typeCount.GOVERNMENT || 0} />
            <StatCard label="Top Type" value={topType ? topType[0] : '—'} color="yellow" />
          </div>
        )}

        {/* Table */}
        <div className="admin-table-wrap">
          <div className="admin-table-toolbar">
            <span className="admin-table-toolbar-title">
              {isFiltering
                ? `${displayed.length} result${displayed.length !== 1 ? 's' : ''}`
                : 'Recently updated'}
            </span>
            <input
              className="admin-search"
              placeholder="Search name, code, city…"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            <select className="admin-filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">All types</option>
              {INST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {!isFiltering && !loading && (
            <div style={{
              padding: '7px 16px',
              background: '#0a0d14',
              borderBottom: '1px solid #1e2a3a',
              fontSize: '0.73rem',
              color: '#475569',
            }}>
              Showing 5 most recently updated — search or filter to see all {allInstitutions.length} institutions
            </div>
          )}

          {loading ? (
            <div className="admin-loading">Loading…</div>
          ) : displayed.length === 0 ? (
            <div className="admin-empty">No institutions found</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Members</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map(inst => (
                  <tr key={inst.id} style={{ cursor: 'pointer' }} onClick={() => setViewItem(inst)}>
                    <td>
                      <button
                        className="admin-link td-primary"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit', textDecoration: 'underline', textAlign: 'left' }}
                        onClick={e => { e.stopPropagation(); navigate(`/admin/institutions/${inst.id}`); }}
                      >
                        {inst.name}
                      </button>
                      {inst.email && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{inst.email}</div>}
                    </td>
                    <td className="td-mono">{inst.code || '—'}</td>
                    <td>{typeBadge(inst.type)}</td>
                    <td>{[inst.city, inst.state, inst.country].filter(Boolean).join(', ') || '—'}</td>
                    <td>
                      <button className="admin-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
                        onClick={e => { e.stopPropagation(); openMembers(inst); }}>
                        {inst.memberCount ?? 0}
                      </button>
                    </td>
                    <td>
                      {(inst.updatedAt || inst.createdAt)
                        ? new Date(inst.updatedAt || inst.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setViewItem(inst); }}>View</button>
                        <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setEditItem(inst); }}>Edit</button>
                        <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); openAssign(inst); }}>Assign Admin</button>
                        <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); setDeleteItem(inst); }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreate && (
        <InstitutionFormModal title="New Institution" onSave={create} onClose={() => setShowCreate(false)} busy={busy} />
      )}

      {editItem && (
        <InstitutionFormModal
          title={`Edit — ${editItem.name}`}
          initial={{
            name: editItem.name || '', code: editItem.code || '', type: editItem.type || '',
            description: editItem.description || '', website: editItem.website || '',
            email: editItem.email || '', phone: editItem.phone || '',
            address: editItem.address || '', city: editItem.city || '',
            country: editItem.country || '', state: editItem.state || '',
            pincode: editItem.pincode || '', county: editItem.county || '',
          }}
          onSave={update}
          onClose={() => setEditItem(null)}
          busy={busy}
        />
      )}

      {viewItem && (
        <div className="admin-modal-backdrop" onClick={() => setViewItem(null)}>
          <div className="admin-modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <p className="admin-modal-title">{viewItem.name}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 20, fontSize: '0.875rem' }}>
              {[
                ['Code', viewItem.code], ['Type', viewItem.type], ['Email', viewItem.email],
                ['Phone', viewItem.phone], ['Website', viewItem.website], ['Address', viewItem.address],
                ['City', viewItem.city], ['State', viewItem.state], ['Country', viewItem.country],
                ['Pincode', viewItem.pincode], ['County', viewItem.county], ['Members', viewItem.memberCount],
                ['Created', viewItem.createdAt ? new Date(viewItem.createdAt).toLocaleDateString() : null],
              ].map(([label, val]) => val != null && val !== '' ? (
                <div key={label}>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: 2 }}>{label}</div>
                  <div style={{ color: '#e2e8f0' }}>{val}</div>
                </div>
              ) : null)}
              {viewItem.description && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: 2 }}>Description</div>
                  <div style={{ color: '#e2e8f0' }}>{viewItem.description}</div>
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-ghost" onClick={() => setViewItem(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => { setViewItem(null); setEditItem(viewItem); }}>Edit</button>
            </div>
          </div>
        </div>
      )}

      {deleteItem && (
        <PasswordConfirmModal
          title="Delete institution?"
          message={`${deleteItem.name} will be permanently deleted and all members unlinked. This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={doDelete}
          onClose={() => setDeleteItem(null)}
        />
      )}

      {assignItem && (() => {
        const lq = assignSearch.trim().toLowerCase();
        const filteredUsers = lq
          ? allUsers.filter(u =>
              u.name?.toLowerCase().includes(lq) ||
              u.email?.toLowerCase().includes(lq) ||
              u.username?.toLowerCase().includes(lq)
            )
          : allUsers;
        const top5 = filteredUsers.slice(0, 5);
        const atMax = currentAdmins.length >= 5;
        return (
          <div className="admin-modal-backdrop" onClick={() => setAssignItem(null)}>
            <div className="admin-modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
              <p className="admin-modal-title">Assign Admin — {assignItem.name}</p>

              {/* Current admins */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Current Admins ({currentAdmins.length}/5)
                </div>
                {currentAdmins.length === 0 ? (
                  <div style={{ color: '#475569', fontSize: '0.82rem', padding: '6px 0' }}>No admins assigned yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {currentAdmins.map(admin => (
                      <div key={admin.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', background: '#0f1117', borderRadius: 6, border: '1px solid #1e2a3a' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 600 }}>{admin.name}</div>
                          <div style={{ fontSize: '0.73rem', color: '#64748b' }}>{admin.email}</div>
                        </div>
                        <span className="badge badge-inst-admin">Inst Admin</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {atMax ? (
                <div style={{ background: '#3d2e00', border: '1px solid #78350f', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '0.82rem', color: '#fbbf24' }}>
                  Maximum of 5 admins per institution reached. Remove an admin from the Users page before adding a new one.
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                      Add New Admin
                    </div>
                    <input
                      className="admin-search"
                      style={{ width: '100%', marginBottom: 8 }}
                      placeholder="Search users by name, email or username…"
                      value={assignSearch}
                      onChange={e => { setAssignSearch(e.target.value); setAssignUserId(''); }}
                    />
                    {top5.length === 0 ? (
                      <div style={{ color: '#475569', fontSize: '0.8rem', padding: '8px 0' }}>
                        {assignSearch.trim() ? 'No users found' : 'Type to search for a user'}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {top5.map(u => (
                          <div
                            key={u.id}
                            onClick={() => setAssignUserId(String(u.id))}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
                              background: assignUserId === String(u.id) ? '#1e3a5f' : '#0f1117',
                              border: `1px solid ${assignUserId === String(u.id) ? '#2563eb' : '#1e2a3a'}`,
                              transition: 'background 0.1s',
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 600 }}>{u.name}</div>
                              <div style={{ fontSize: '0.73rem', color: '#64748b' }}>{u.email}</div>
                            </div>
                            {assignUserId === String(u.id) && (
                              <span style={{ color: '#60a5fa', fontSize: '0.75rem', fontWeight: 600 }}>✓ Selected</span>
                            )}
                          </div>
                        ))}
                        {filteredUsers.length > 5 && (
                          <div style={{ fontSize: '0.72rem', color: '#475569', padding: '4px 0', textAlign: 'center' }}>
                            +{filteredUsers.length - 5} more — refine your search
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="admin-modal-footer">
                    <button className="btn btn-ghost" onClick={() => setAssignItem(null)}>Cancel</button>
                    <button className="btn btn-primary" onClick={doAssign} disabled={busy || !assignUserId}>
                      {busy ? 'Assigning…' : 'Assign as Admin'}
                    </button>
                  </div>
                </>
              )}

              {atMax && (
                <div className="admin-modal-footer">
                  <button className="btn btn-ghost" onClick={() => setAssignItem(null)}>Close</button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {membersInst && (
        <div className="admin-modal-backdrop" onClick={() => setMembersInst(null)}>
          <div className="admin-modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <p className="admin-modal-title">Members — {membersInst.name}</p>
            {members.length === 0 ? (
              <p className="admin-modal-body">No members linked to this institution.</p>
            ) : (
              <table className="admin-table" style={{ marginBottom: 16 }}>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
                <tbody>
                  {members.map(u => (
                    <tr key={u.id}>
                      <td className="td-primary">{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className={`badge badge-${u.role === 'INST_ADMIN' ? 'inst-admin' : 'user'}`}>{u.role}</span></td>
                      <td><span className={`badge badge-${u.accountStatus.toLowerCase()}`}>{u.accountStatus}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="admin-modal-footer">
              <button className="btn btn-ghost" onClick={() => setMembersInst(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
