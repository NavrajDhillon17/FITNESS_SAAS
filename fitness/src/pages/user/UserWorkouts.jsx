import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

export default function UserWorkouts() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ title:'', date: new Date().toISOString().split('T')[0], notes:'' });
  const [exercises, setExercises] = useState([{ name:'', sets:3, reps:10, weight:0, duration:0, calories:0 }]);
  const [err, setErr]           = useState('');

  useEffect(() => { fetchWorkouts(); }, []);
  const fetchWorkouts = async () => {
    setLoading(true);
    try { const r = await api.get('/workouts'); setWorkouts(r.data.workouts || []); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const addExercise = () => setExercises([...exercises, { name:'', sets:3, reps:10, weight:0, duration:0, calories:0 }]);
  const updateEx = (i, k, v) => setExercises(exercises.map((ex, idx) => idx === i ? {...ex, [k]:v} : ex));

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr('');
    try {
      await api.post('/workouts', { ...form, exercises });
      setShowModal(false);
      setForm({ title:'', date: new Date().toISOString().split('T')[0], notes:'' });
      setExercises([{ name:'', sets:3, reps:10, weight:0, duration:0, calories:0 }]);
      fetchWorkouts();
    } catch(e) { setErr(e.response?.data?.message || 'Error saving workout'); }
  };

  const deleteWorkout = async (id) => {
    if (!confirm('Delete this workout?')) return;
    try { await api.delete(`/workouts/${id}`); fetchWorkouts(); }
    catch(e) { alert('Error deleting workout'); }
  };

  if (loading) return <div className="loader"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="section-heading">Workouts</div>
          <div className="section-sub">{workouts.length} sessions logged</div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Log Workout</button>
      </div>

      {user?.assignedPlan && (
        <div style={{ background: 'var(--primary-container)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📋</span>
            <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 800, fontSize: '1.1rem', color: 'var(--on-primary-container)' }}>
              Coach's Workout Plan
            </div>
          </div>
          <div style={{ fontSize: '.9rem', color: 'var(--on-primary-container)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {user.assignedPlan}
          </div>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
        {workouts.length === 0
          ? <div className="empty-state"><div className="icon">💪</div><p>No workouts yet. Log your first one!</p></div>
          : workouts.map(w => {
              const d = new Date(w.date);
              return (
                <div key={w._id} className="workout-item">
                  <div className="date-badge">
                    <div className="day">{d.getDate()}</div>
                    <div className="mon">{d.toLocaleDateString('en',{month:'short'})}</div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:700 }}>{w.title}</div>
                    <div style={{ fontSize:'.75rem', color:'var(--on-surface-variant)', marginTop:2 }}>
                      {w.exercises?.length || 0} exercises · {w.totalCalories || 0} cal · {w.totalDuration || 0} min
                    </div>
                    {w.notes && <div style={{ fontSize:'.72rem', color:'var(--outline)', marginTop:2, fontStyle:'italic' }}>{w.notes}</div>}
                  </div>
                  <div style={{ display:'flex', gap:'.5rem' }}>
                    <span className="role-pill active">{w.totalDuration || 0} min</span>
                    <button className="btn-danger" onClick={() => deleteWorkout(w._id)}>Delete</button>
                  </div>
                </div>
              );
            })
        }
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:'1.25rem' }}>Log Workout</div>
              <button className="btn-ghost" style={{ padding:'.35rem .75rem' }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
              <div>
                <label className="field-label">Workout Title</label>
                <input className="field-input" placeholder="e.g. Chest & Triceps Day" required
                  value={form.title} onChange={e => setForm({...form, title:e.target.value})} />
              </div>
              <div>
                <label className="field-label">Date</label>
                <input type="date" className="field-input" value={form.date}
                  onChange={e => setForm({...form, date:e.target.value})} />
              </div>
              <div>
                <label className="field-label">Notes (optional)</label>
                <textarea className="field-input" rows={2} placeholder="Any notes..."
                  value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} />
              </div>

              <div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'.6rem' }}>
                  <label className="field-label">Exercises</label>
                  <button type="button" className="btn-secondary" style={{ fontSize:'.75rem', padding:'.3rem .8rem' }} onClick={addExercise}>+ Add</button>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'.6rem' }}>
                  {exercises.map((ex, i) => (
                    <div key={i} style={{ background:'var(--surface-container-low)', borderRadius:'var(--radius)', padding:'.75rem' }}>
                      <input className="field-input" placeholder="Exercise name" style={{ marginBottom:'.5rem' }}
                        value={ex.name} onChange={e => updateEx(i,'name',e.target.value)} />
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'.4rem' }}>
                        {[['sets','Sets'],['reps','Reps'],['weight','kg'],['duration','min'],['calories','cal']].map(([k,l]) => (
                          <div key={k}>
                            <div style={{ fontSize:'.62rem', color:'var(--outline)', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', marginBottom:2 }}>{l}</div>
                            <input type="number" className="field-input" style={{ padding:'.4rem .5rem', textAlign:'center' }}
                              value={ex[k]} onChange={e => updateEx(i, k, +e.target.value)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {err && <div className="alert alert-error">{err}</div>}
              <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'.85rem' }}>
                Save Workout →
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
