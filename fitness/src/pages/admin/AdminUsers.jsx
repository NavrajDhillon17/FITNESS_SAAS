import { useState, useEffect } from 'react';
import api from '../../api';

const ROLE_COLORS = { admin:'var(--primary)', staff:'var(--secondary)', coach:'var(--tertiary)', user:'var(--success)' };

export default function AdminUsers() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [selectedUser, setSelectedUser] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => { fetchUsers(); }, []);
  const fetchUsers = async () => {
    setLoading(true);
    try { const r = await api.get('/admin/users'); setUsers(r.data); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const toggleUser = async (id) => {
    try { await api.patch(`/admin/users/${id}/toggle`); fetchUsers(); }
    catch(e) { alert(e.response?.data?.message || 'Error'); }
  };

  const viewActivity = async (u) => {
    setSelectedUser(u);
    setProgress(null);
    try {
      const r = await api.get(`/coach/users/${u._id}/progress`);
      setProgress(r.data);
    } catch(e) {
      console.error(e);
      alert('Error fetching activity');
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  if (loading) return <div className="loader"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="section-heading">Member Directory</div>
          <div className="section-sub">{users.length} total users across all roles</div>
        </div>
        <div style={{ display:'flex', gap:'.75rem', flexWrap:'wrap' }}>
          <div className="search-wrap">
            🔍 <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="field-input" style={{ width:'auto', borderRadius:'var(--radius)', padding:'.55rem 1rem' }}
            value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="coach">Coach</option>
            <option value="user">Athlete</option>
          </select>
        </div>
      </div>

      <div style={{ background:'var(--surface-container-lowest)', borderRadius:'var(--radius-xl)', overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
        <table className="data-table">
          <thead style={{ background:'var(--surface-container-low)' }}>
            <tr>
              <th>Member</th><th>Role</th><th>Status</th>
              <th>Created By</th><th>Joined</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={6} style={{ textAlign:'center', padding:'2.5rem', color:'var(--outline)' }}>No users found</td></tr>
              : filtered.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
                        <div style={{ width:36, height:36, borderRadius:8, background:`${ROLE_COLORS[u.role]}18`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Manrope,sans-serif', fontWeight:700, color:ROLE_COLORS[u.role], flexShrink:0 }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:'.88rem' }}>{u.name}</div>
                          <div style={{ fontSize:'.72rem', color:'var(--on-surface-variant)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`role-pill ${u.role}`}>{u.role}</span></td>
                    <td><span className={`role-pill ${u.isActive ? 'active' : 'inactive'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ fontSize:'.82rem', color:'var(--on-surface-variant)' }}>
                      {u.createdBy ? `${u.createdBy.name} (${u.createdBy.role})` : 'Self-registered'}
                    </td>
                    <td style={{ fontSize:'.8rem', color:'var(--on-surface-variant)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:'.5rem' }}>
                        {u.role === 'user' && (
                          <button className="btn-secondary" style={{ fontSize:'.7rem', padding:'.3rem .6rem' }} onClick={() => viewActivity(u)}>
                            Activity
                          </button>
                        )}
                        {u.role !== 'admin' && (
                          <button className="btn-danger" style={{ fontSize:'.7rem', padding:'.3rem .6rem' }} onClick={() => toggleUser(u._id)}>
                            {u.isActive ? 'Disable' : 'Enable'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {/* Activity Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:'1.25rem' }}>
                Activity: {selectedUser.name}
              </div>
              <button className="btn-ghost" style={{ padding:'.35rem .75rem' }} onClick={() => setSelectedUser(null)}>✕</button>
            </div>

            {!progress ? (
              <div style={{ textAlign:'center', padding:'2rem' }}><div className="spinner" style={{ margin:'0 auto' }} /></div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
                {/* Workouts */}
                <div>
                  <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, marginBottom:'.75rem' }}>
                    Recent Workouts ({progress.workouts?.length || 0})
                  </div>
                  {progress.workouts?.length === 0
                    ? <div style={{ color:'var(--outline)', fontSize:'.85rem' }}>No workouts logged yet.</div>
                    : <div style={{ display:'flex', flexDirection:'column', gap:'.5rem' }}>
                        {progress.workouts.map(w => (
                          <div key={w._id} className="workout-item" style={{ padding:'.75rem 1rem' }}>
                            <div style={{ flex:1 }}>
                              <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:'.88rem' }}>{w.title}</div>
                              <div style={{ fontSize:'.72rem', color:'var(--on-surface-variant)' }}>{new Date(w.date).toLocaleDateString()}</div>
                            </div>
                            <div style={{ textAlign:'right' }}>
                              <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, color:'var(--primary)', fontSize:'.95rem' }}>{w.totalCalories || 0} cal</div>
                              <div style={{ fontSize:'.72rem', color:'var(--on-surface-variant)' }}>{w.totalDuration || 0} min</div>
                            </div>
                          </div>
                        ))}
                      </div>
                  }
                </div>

                {/* Goals */}
                <div>
                  <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, marginBottom:'.75rem' }}>
                    Goals ({progress.goals?.length || 0})
                  </div>
                  {progress.goals?.length === 0
                    ? <div style={{ color:'var(--outline)', fontSize:'.85rem' }}>No goals set yet.</div>
                    : <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                        {progress.goals.map(g => {
                          const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
                          return (
                            <div key={g._id} style={{ background:'var(--surface-container-low)', padding:'1rem', borderRadius:'var(--radius-lg)' }}>
                              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'.3rem' }}>
                                <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:'.85rem' }}>{g.title}</div>
                                <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:'.95rem', color:'var(--primary)' }}>{pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill" style={{ width:`${pct}%` }} />
                              </div>
                              <div style={{ fontSize:'.72rem', color:'var(--on-surface-variant)', marginTop:3 }}>{g.currentValue} / {g.targetValue} {g.unit}</div>
                            </div>
                          );
                        })}
                      </div>
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
