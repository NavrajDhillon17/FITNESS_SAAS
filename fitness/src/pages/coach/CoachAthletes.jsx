import { useState, useEffect } from 'react';
import api from '../../api';

export default function CoachAthletes() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [plan, setPlan]   = useState('');
  const [planMsg, setPlanMsg] = useState('');

  useEffect(() => { fetchUsers(); }, []);
  const fetchUsers = async () => {
    setLoading(true);
    try { const r = await api.get('/coach/users'); setUsers(r.data); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const viewProgress = async (u) => {
    setSelectedUser(u); setProgress(null); setPlan(u.assignedPlan || ''); setPlanMsg('');
    try { const r = await api.get(`/coach/users/${u._id}/progress`); setProgress(r.data); }
    catch(e) { console.error(e); }
  };

  const savePlan = async () => {
    try {
      await api.put(`/coach/users/${selectedUser._id}/plan`, { plan });
      setPlanMsg('✅ Plan saved!'); fetchUsers();
    } catch(e) { setPlanMsg('❌ ' + (e.response?.data?.message || 'Error')); }
  };

  const unassign = async (userId) => {
    if (!confirm('Remove this athlete?')) return;
    try { await api.delete(`/coach/users/${userId}/unassign`); fetchUsers(); setSelectedUser(null); }
    catch(e) { alert(e.response?.data?.message || 'Error'); }
  };

  if (loading) return <div className="loader"><div className="spinner"/></div>;

  return (
    <div style={{ display:'grid', gridTemplateColumns: selectedUser ? '1fr 1fr' : '1fr', gap:'1.5rem' }}>
      {/* Athlete List */}
      <div>
        <div className="page-header" style={{ marginBottom:'1.25rem' }}>
          <div>
            <div className="section-heading">My Athletes</div>
            <div className="section-sub">{users.length} athletes assigned</div>
          </div>
        </div>

        <div className="tonal-container" style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
          {users.length === 0
            ? <div className="empty-state"><div className="icon">🏃</div><p>No athletes yet. Assign some from "Assign Athletes".</p></div>
            : users.map(u => (
                <div key={u._id} className="tonal-item" style={{ flexDirection:'column', alignItems:'flex-start', gap:'.75rem', cursor:'pointer' }}
                  onClick={() => viewProgress(u)}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'.8rem' }}>
                      <div className="item-avatar-initials" style={{ background:'rgba(46,125,50,.1)', color:'var(--success)' }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:700 }}>{u.name}</div>
                        <div style={{ fontSize:'.75rem', color:'var(--on-surface-variant)' }}>{u.email}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:'.5rem' }}>
                      <button className="btn-primary" style={{ fontSize:'.75rem', padding:'.35rem .9rem' }}
                        onClick={e => { e.stopPropagation(); viewProgress(u); }}>
                        Progress
                      </button>
                      <button className="btn-danger" onClick={e => { e.stopPropagation(); unassign(u._id); }}>
                        Remove
                      </button>
                    </div>
                  </div>
                  {u.fitnessGoal && <span className="role-pill user" style={{ fontSize:'.68rem' }}>{u.fitnessGoal.replace(/_/g,' ')}</span>}
                  {u.assignedPlan && <div style={{ fontSize:'.75rem', color:'var(--primary)', fontWeight:600 }}>📋 Plan assigned</div>}
                </div>
              ))
          }
        </div>
      </div>

      {/* Progress Panel */}
      {selectedUser && (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem' }}>
            <div style={{ width:52, height:52, borderRadius:12, background:'linear-gradient(135deg,var(--primary),var(--primary-container))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Manrope,sans-serif', fontWeight:800, color:'#fff', fontSize:'1.4rem' }}>
              {selectedUser.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:'1.1rem' }}>{selectedUser.name}</div>
              <div style={{ fontSize:'.78rem', color:'var(--on-surface-variant)' }}>{selectedUser.email}</div>
            </div>
          </div>

          {/* Plan */}
          <div style={{ background:'var(--surface-container-lowest)', borderRadius:'var(--radius-xl)', padding:'1.5rem', marginBottom:'1rem', boxShadow:'var(--shadow-sm)' }}>
            <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, marginBottom:'.75rem' }}>Workout Plan</div>
            <textarea className="field-input" rows={4} value={plan}
              onChange={e => setPlan(e.target.value)}
              placeholder="Enter workout plan, notes, schedule for this athlete..." />
            {planMsg && <div className={`alert ${planMsg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{planMsg}</div>}
            <button className="btn-primary" style={{ marginTop:'.75rem' }} onClick={savePlan}>Save Plan →</button>
          </div>

          {/* Workouts */}
          {!progress ? (
            <div style={{ textAlign:'center', padding:'2rem' }}><div className="spinner" style={{ margin:'0 auto' }} /></div>
          ) : (
            <>
              <div style={{ background:'var(--surface-container-lowest)', borderRadius:'var(--radius-xl)', padding:'1.5rem', marginBottom:'1rem', boxShadow:'var(--shadow-sm)' }}>
                <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, marginBottom:'.75rem' }}>
                  Recent Workouts ({progress.workouts.length})
                </div>
                {progress.workouts.length === 0
                  ? <div style={{ color:'var(--outline)', fontSize:'.85rem' }}>No workouts logged yet.</div>
                  : <div style={{ display:'flex', flexDirection:'column', gap:'.5rem' }}>
                      {progress.workouts.slice(0,5).map(w => (
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
              <div style={{ background:'var(--surface-container-lowest)', borderRadius:'var(--radius-xl)', padding:'1.5rem', boxShadow:'var(--shadow-sm)' }}>
                <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, marginBottom:'.75rem' }}>
                  Goals ({progress.goals.length})
                </div>
                {progress.goals.length === 0
                  ? <div style={{ color:'var(--outline)', fontSize:'.85rem' }}>No goals set yet.</div>
                  : <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                      {progress.goals.map(g => {
                        const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
                        return (
                          <div key={g._id}>
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
