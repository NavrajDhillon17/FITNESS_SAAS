import { useState, useEffect } from 'react';
import api from '../../api';

export default function UserGoals() {
  const [goals, setGoals]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]       = useState({ title:'', targetValue:'', unit:'kg', currentValue:0 });
  const [err, setErr]         = useState('');
  const [editGoal, setEditGoal] = useState(null);
  const [editVal, setEditVal] = useState('');

  useEffect(() => { fetchGoals(); }, []);
  const fetchGoals = async () => {
    setLoading(true);
    try { const r = await api.get('/goals'); setGoals(r.data || []); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const createGoal = async (e) => {
    e.preventDefault(); setErr('');
    try {
      await api.post('/goals', form);
      setShowModal(false);
      setForm({ title:'', targetValue:'', unit:'kg', currentValue:0 });
      fetchGoals();
    } catch(e) { setErr(e.response?.data?.message || 'Error'); }
  };

  const updateProgress = async (g) => {
    try {
      await api.put(`/goals/${g._id}`, { currentValue: +editVal });
      setEditGoal(null); fetchGoals();
    } catch(e) { alert('Error updating goal'); }
  };

  const deleteGoal = async (id) => {
    if (!confirm('Delete this goal?')) return;
    try { await api.delete(`/goals/${id}`); fetchGoals(); }
    catch(e) { alert('Error'); }
  };

  if (loading) return <div className="loader"><div className="spinner"/></div>;

  const STATUS_COLOR = { active:'var(--primary)', completed:'var(--success)', paused:'var(--outline)' };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="section-heading">My Goals</div>
          <div className="section-sub">{goals.filter(g=>g.status==='active').length} active goals</div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Goal</button>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
        {goals.length === 0
          ? <div className="empty-state"><div className="icon">🎯</div><p>No goals set. Create your first goal!</p></div>
          : goals.map(g => {
              const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
              return (
                <div key={g._id} style={{ background:'var(--surface-container-lowest)', borderRadius:'var(--radius-xl)', padding:'1.25rem 1.5rem', boxShadow:'var(--shadow-sm)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'.75rem' }}>
                    <div>
                      <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:'1rem' }}>{g.title}</div>
                      <div style={{ fontSize:'.75rem', color:'var(--on-surface-variant)', marginTop:2 }}>
                        {g.currentValue} / {g.targetValue} {g.unit}
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:'.5rem', alignItems:'center' }}>
                      <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:'1.2rem', color:STATUS_COLOR[g.status] || 'var(--primary)' }}>{pct}%</span>
                      <span className={`role-pill ${g.status === 'completed' ? 'active' : g.status === 'paused' ? 'inactive' : 'admin'}`}>{g.status}</span>
                    </div>
                  </div>

                  <div className="progress-track" style={{ marginBottom:'.75rem' }}>
                    <div className="progress-fill" style={{ width:`${pct}%`, background: STATUS_COLOR[g.status] || 'var(--primary)' }} />
                  </div>

                  <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap' }}>
                    {editGoal?._id === g._id ? (
                      <>
                        <input type="number" className="field-input" style={{ width:100, padding:'.35rem .6rem', borderRadius:6 }}
                          value={editVal} onChange={e => setEditVal(e.target.value)} />
                        <button className="btn-primary" style={{ fontSize:'.75rem', padding:'.35rem .9rem' }} onClick={() => updateProgress(g)}>Update</button>
                        <button className="btn-ghost" style={{ fontSize:'.75rem', padding:'.35rem .9rem' }} onClick={() => setEditGoal(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="btn-secondary" style={{ fontSize:'.75rem', padding:'.35rem .9rem' }}
                          onClick={() => { setEditGoal(g); setEditVal(g.currentValue); }}>
                          Update Progress
                        </button>
                        <button className="btn-danger" onClick={() => deleteGoal(g._id)}>Delete</button>
                      </>
                    )}
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
              <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:'1.25rem' }}>Create New Goal</div>
              <button className="btn-ghost" style={{ padding:'.35rem .75rem' }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={createGoal} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
              <div>
                <label className="field-label">Goal Title</label>
                <input className="field-input" placeholder="e.g. Bench Press 100kg" required
                  value={form.title} onChange={e => setForm({...form, title:e.target.value})} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
                <div>
                  <label className="field-label">Target Value</label>
                  <input type="number" className="field-input" placeholder="100" required
                    value={form.targetValue} onChange={e => setForm({...form, targetValue:e.target.value})} />
                </div>
                <div>
                  <label className="field-label">Current Value</label>
                  <input type="number" className="field-input" placeholder="0"
                    value={form.currentValue} onChange={e => setForm({...form, currentValue:e.target.value})} />
                </div>
                <div>
                  <label className="field-label">Unit</label>
                  <input className="field-input" placeholder="kg / km / lbs"
                    value={form.unit} onChange={e => setForm({...form, unit:e.target.value})} />
                </div>
              </div>
              {err && <div className="alert alert-error">{err}</div>}
              <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'.85rem' }}>
                Create Goal →
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
