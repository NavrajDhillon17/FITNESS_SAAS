import { useState, useEffect } from 'react';
import api from '../../api';

const GOAL_LABELS = {
  lose_weight: '🏃 Lose Weight',
  build_muscle: '💪 Build Muscle',
  improve_endurance: '🔥 Endurance',
  stay_active: '✨ Stay Active',
};

export default function StaffUsers() {
  const [users, setUsers]     = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [selectedUser, setSelectedUser]   = useState(null);
  const [modalMode, setModalMode]         = useState('activity'); // 'activity' | 'reassign'
  const [progress, setProgress]           = useState(null);
  const [reassignCoachId, setReassignCoachId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [uRes, cRes] = await Promise.all([
        api.get('/staff/users').catch(() => ({ data: [] })),
        api.get('/staff/coaches').catch(() => ({ data: [] })),
      ]);
      setUsers(uRes.data);
      setCoaches(cRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Toggle active/inactive ─────────────────────────────────
  const toggleUser = async (u) => {
    try {
      await api.patch(`/staff/users/${u._id}/toggle`);
      setUsers(prev => prev.map(x => x._id === u._id ? { ...x, isActive: !x.isActive } : x));
    } catch (e) {
      alert(e.response?.data?.message || 'Error toggling status');
    }
  };

  // ── Open activity modal ────────────────────────────────────
  const openActivity = async (u) => {
    setSelectedUser(u);
    setModalMode('activity');
    setProgress(null);
    try {
      const r = await api.get(`/coach/users/${u._id}/progress`);
      setProgress(r.data);
    } catch (e) {
      console.error(e);
      setProgress({ workouts: [], goals: [] });
    }
  };

  // ── Open reassign modal ────────────────────────────────────
  const openReassign = (u) => {
    setSelectedUser(u);
    setModalMode('reassign');
    setReassignCoachId(u.assignedCoach?._id || '');
  };

  // ── Submit reassign ────────────────────────────────────────
  const submitReassign = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/staff/users/${selectedUser._id}/reassign`, {
        coachId: reassignCoachId || null,
      });
      await fetchAll();
      setSelectedUser(null);
    } catch (e) {
      alert(e.response?.data?.message || 'Error reassigning athlete');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.isActive) ||
      (statusFilter === 'inactive' && !u.isActive) ||
      (statusFilter === 'unassigned' && !u.assignedCoach);
    return matchSearch && matchStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    unassigned: users.filter(u => !u.assignedCoach).length,
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <div className="section-heading">Athlete Support</div>
          <div className="section-sub">Manage and support athletes in your network</div>
        </div>
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-wrap">
            🔍 <input placeholder="Search athletes..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select
            className="field-input"
            style={{ width: 'auto', borderRadius: 'var(--radius)', padding: '.5rem .9rem', margin: 0 }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Athletes</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Athletes', value: stats.total, color: 'var(--primary)', bg: 'rgba(0,64,223,.07)', icon: '👥' },
          { label: 'Active', value: stats.active, color: 'var(--success)', bg: 'rgba(46,125,50,.07)', icon: '✅' },
          { label: 'Unassigned', value: stats.unassigned, color: 'var(--warning,#f59e0b)', bg: 'rgba(245,158,11,.07)', icon: '⚠️' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 'var(--radius-xl)', padding: '1.1rem 1.4rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '1.6rem' }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 800, fontSize: '1.6rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '.75rem', color: 'var(--on-surface-variant)', marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table className="data-table">
          <thead style={{ background: 'var(--surface-container-low)' }}>
            <tr>
              <th>Athlete</th>
              <th>Goal</th>
              <th>Assigned Coach</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--outline)' }}>No athletes found</td></tr>
              : filtered.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(0,64,223,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope,sans-serif', fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: '.88rem' }}>{u.name}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--on-surface-variant)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '.78rem', color: 'var(--on-surface-variant)' }}>
                    {GOAL_LABELS[u.fitnessGoal] || '—'}
                  </td>
                  <td>
                    {u.assignedCoach
                      ? <span style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 600, fontSize: '.82rem' }}>{u.assignedCoach.name}</span>
                      : <span style={{ color: 'var(--warning,#f59e0b)', fontSize: '.78rem', fontWeight: 600 }}>⚠️ Unassigned</span>
                    }
                  </td>
                  <td>
                    <span className={`role-pill ${u.isActive ? 'active' : 'inactive'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: '.8rem', color: 'var(--on-surface-variant)' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                      <button
                        className="btn-secondary"
                        style={{ fontSize: '.7rem', padding: '.3rem .6rem' }}
                        onClick={() => openActivity(u)}
                      >
                        📊 Activity
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ fontSize: '.7rem', padding: '.3rem .6rem' }}
                        onClick={() => openReassign(u)}
                      >
                        🔀 Reassign
                      </button>
                      <button
                        className={u.isActive ? 'btn-danger' : 'btn-secondary'}
                        style={{ fontSize: '.7rem', padding: '.3rem .6rem' }}
                        onClick={() => toggleUser(u)}
                      >
                        {u.isActive ? '🚫 Disable' : '✅ Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* ── Activity Modal ── */}
      {selectedUser && modalMode === 'activity' && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 800, fontSize: '1.2rem' }}>
                  📊 {selectedUser.name}'s Activity
                </div>
                <div style={{ fontSize: '.78rem', color: 'var(--on-surface-variant)', marginTop: 3 }}>
                  {selectedUser.email} · {GOAL_LABELS[selectedUser.fitnessGoal] || 'No goal set'}
                </div>
              </div>
              <button className="btn-ghost" style={{ padding: '.35rem .75rem' }} onClick={() => setSelectedUser(null)}>✕</button>
            </div>

            {/* Coach info */}
            <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', padding: '.85rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <span style={{ fontSize: '1.2rem' }}>🏋️</span>
              <div style={{ fontSize: '.82rem' }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Assigned Coach: </span>
                <span style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>
                  {selectedUser.assignedCoach?.name || <em style={{ color: 'var(--warning,#f59e0b)' }}>Unassigned</em>}
                </span>
              </div>
            </div>

            {!progress ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Workouts */}
                <div>
                  <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, marginBottom: '.75rem' }}>
                    💪 Recent Workouts ({progress.workouts?.length || 0})
                  </div>
                  {progress.workouts?.length === 0
                    ? <div style={{ color: 'var(--outline)', fontSize: '.85rem' }}>No workouts logged yet.</div>
                    : <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                        {progress.workouts.map(w => (
                          <div key={w._id} className="workout-item" style={{ padding: '.75rem 1rem' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: '.88rem' }}>{w.title}</div>
                              <div style={{ fontSize: '.72rem', color: 'var(--on-surface-variant)' }}>{new Date(w.date).toLocaleDateString()}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 800, color: 'var(--primary)', fontSize: '.95rem' }}>{w.totalCalories || 0} cal</div>
                              <div style={{ fontSize: '.72rem', color: 'var(--on-surface-variant)' }}>{w.totalDuration || 0} min</div>
                            </div>
                          </div>
                        ))}
                      </div>
                  }
                </div>

                {/* Goals */}
                <div>
                  <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, marginBottom: '.75rem' }}>
                    🎯 Goals ({progress.goals?.length || 0})
                  </div>
                  {progress.goals?.length === 0
                    ? <div style={{ color: 'var(--outline)', fontSize: '.85rem' }}>No goals set yet.</div>
                    : <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                        {progress.goals.map(g => {
                          const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
                          return (
                            <div key={g._id} style={{ background: 'var(--surface-container-low)', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.3rem' }}>
                                <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 600, fontSize: '.85rem' }}>{g.title}</div>
                                <span style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 800, fontSize: '.95rem', color: 'var(--primary)' }}>{pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill" style={{ width: `${pct}%` }} />
                              </div>
                              <div style={{ fontSize: '.72rem', color: 'var(--on-surface-variant)', marginTop: 3 }}>{g.currentValue} / {g.targetValue} {g.unit}</div>
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

      {/* ── Reassign Modal ── */}
      {selectedUser && modalMode === 'reassign' && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 800, fontSize: '1.2rem' }}>
                🔀 Reassign Athlete
              </div>
              <button className="btn-ghost" style={{ padding: '.35rem .75rem' }} onClick={() => setSelectedUser(null)}>✕</button>
            </div>

            {/* Athlete info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface-container-low)', padding: '1rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(0,64,223,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope,sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>
                {selectedUser.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>{selectedUser.name}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--on-surface-variant)' }}>
                  Current coach: <strong>{selectedUser.assignedCoach?.name || 'None'}</strong>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="field-label">Assign to Coach</label>
              <select
                className="field-input"
                value={reassignCoachId}
                onChange={e => setReassignCoachId(e.target.value)}
              >
                <option value="">— Remove assignment (unassign) —</option>
                {coaches.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => setSelectedUser(null)}>Cancel</button>
              <button className="btn-primary" onClick={submitReassign} disabled={actionLoading}>
                {actionLoading ? 'Saving...' : 'Save Assignment →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
