import { useState, useEffect } from 'react';
import api from '../../api';

const RolePill = ({ role, isActive }) => (
  <span className={`role-pill ${isActive !== undefined ? (isActive ? 'active' : 'inactive') : (role || '')}`}>
    {isActive !== undefined ? (isActive ? 'Active' : 'Inactive') : role}
  </span>
);

export default function AdminStaff() {
  const [staff, setStaff]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'staff' });
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchStaff(); }, []);
  const fetchStaff = async () => {
    setLoading(true);
    try { const r = await api.get('/admin/staff'); setStaff(r.data); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const toggleUser = async (id) => {
    try { await api.patch(`/admin/users/${id}/toggle`); fetchStaff(); }
    catch(e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault(); setErr(''); setSubmitting(true);
    try {
      await api.post('/admin/staff', form);
      setShowModal(false);
      setForm({ name:'', email:'', password:'', role:'staff' });
      fetchStaff();
    } catch(e) {
      setErr(e.response?.data?.message || 'Error creating user');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = staff.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="loader"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="section-heading">Staff & Admin Management</div>
          <div className="section-sub">Manage elite operations staff across your network.</div>
        </div>
        <div style={{ display:'flex', gap:'.75rem' }}>
          <div className="search-wrap">
            🔍 <input placeholder="Filter users..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Staff / Admin</button>
        </div>
      </div>

      <div className="tonal-container" style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
        {filtered.length === 0
          ? <div className="empty-state"><div className="icon">🧑‍💼</div><p>No members found.</p></div>
          : filtered.map(s => (
              <div key={s._id} className="tonal-item">
                <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                  <div className="item-avatar-initials" style={{ background: s.role === 'admin' ? 'rgba(0,64,223,.1)' : 'rgba(73,89,163,.1)', color: s.role === 'admin' ? 'var(--primary)' : 'var(--secondary)' }}>
                    {s.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:'.95rem' }}>{s.name}</div>
                    <div style={{ fontSize:'.78rem', color:'var(--on-surface-variant)', marginTop:2 }}>{s.email}</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'1.5rem' }}>
                  <div>
                    <div style={{ fontSize:'.65rem', fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--outline)' }}>Created by</div>
                    <div style={{ fontSize:'.82rem', fontWeight:600 }}>{s.createdBy?.name || 'System'}</div>
                  </div>
                  <RolePill role={s.role} />
                  <RolePill isActive={s.isActive} />
                  <button className="btn-danger" onClick={() => toggleUser(s._id)} disabled={s.role === 'admin'}>
                    {s.isActive ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            ))
        }
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:'1.25rem' }}>Add New Member</div>
              <button className="btn-ghost" style={{ padding:'.35rem .75rem' }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateStaff} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
              <div>
                <label className="field-label">Role</label>
                <select className="field-input" value={form.role} onChange={e => setForm({...form, role:e.target.value})}>
                  <option value="staff">Staff (Operations)</option>
                  <option value="admin">Admin (Full Control)</option>
                </select>
              </div>
              <div>
                <label className="field-label">Full Name</label>
                <input className="field-input" placeholder="e.g. Sarah Connor" required
                  value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
              </div>
              <div>
                <label className="field-label">Email Address</label>
                <input type="email" className="field-input" placeholder="sarah@kinetic.pro" required
                  value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
              </div>
              <div>
                <label className="field-label">Password</label>
                <input type="password" className="field-input" placeholder="Min 6 characters" required minLength={6}
                  value={form.password} onChange={e => setForm({...form, password:e.target.value})} />
              </div>
              
              {err && <div className="alert alert-error">{err}</div>}
              <button type="submit" className="btn-primary" disabled={submitting} style={{ width:'100%', justifyContent:'center', padding:'.85rem', marginTop:'.5rem' }}>
                {submitting ? 'Creating...' : `Create ${form.role === 'admin' ? 'Admin' : 'Staff'} Account →`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
