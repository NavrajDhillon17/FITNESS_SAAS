import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

const ROLE_META = {
  admin: { label:'Administrator', color:'var(--primary)', bg:'rgba(0,64,223,.1)' },
  staff: { label:'Staff Member',  color:'var(--secondary)', bg:'rgba(73,89,163,.1)' },
  coach: { label:'Head Coach',    color:'var(--tertiary)', bg:'rgba(153,49,0,.1)' },
  user:  { label:'Athlete',       color:'var(--success)', bg:'rgba(46,125,50,.1)' },
};

export default function UserProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', age: user?.age || '',
    weight: user?.weight || '', height: user?.height || '',
    fitnessGoal: user?.fitnessGoal || 'stay_active',
  });
  const [msg, setMsg]   = useState('');
  const [err, setErr]   = useState('');
  const [loading, setLoading] = useState(false);

  const meta = ROLE_META[user?.role] || ROLE_META.user;

  const handleSubmit = async (e) => {
    e.preventDefault(); setMsg(''); setErr(''); setLoading(true);
    try {
      await api.put('/auth/profile', form);
      setMsg('✅ Profile updated successfully!');
    } catch(e) { setErr(e.response?.data?.message || 'Error updating profile'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="section-heading">My Profile</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'1.5rem' }}>
        {/* Avatar card */}
        <div style={{ background:'var(--surface-container-lowest)', borderRadius:'var(--radius-xl)', padding:'2rem', boxShadow:'var(--shadow-sm)', textAlign:'center' }}>
          <div style={{ width:80, height:80, borderRadius:20, background:'linear-gradient(135deg,var(--primary),var(--primary-container))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:'2.2rem', color:'#fff', margin:'0 auto 1rem' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:'1.1rem' }}>{user?.name}</div>
          <div style={{ color:'var(--on-surface-variant)', fontSize:'.85rem', margin:'.25rem 0 .75rem' }}>{user?.email}</div>
          <span style={{ display:'inline-block', padding:'.3rem .9rem', borderRadius:99, background:meta.bg, color:meta.color, fontSize:'.72rem', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase' }}>
            {meta.label}
          </span>

          {/* Stats */}
          <div style={{ marginTop:'1.5rem', display:'flex', flexDirection:'column', gap:'.5rem' }}>
            {user?.fitnessGoal && (
              <div style={{ background:'var(--surface-container-low)', borderRadius:8, padding:'.6rem 1rem', display:'flex', justifyContent:'space-between', fontSize:'.82rem' }}>
                <span style={{ color:'var(--on-surface-variant)' }}>Goal</span>
                <span style={{ fontWeight:600 }}>{user.fitnessGoal.replace(/_/g,' ')}</span>
              </div>
            )}
            {user?.age && (
              <div style={{ background:'var(--surface-container-low)', borderRadius:8, padding:'.6rem 1rem', display:'flex', justifyContent:'space-between', fontSize:'.82rem' }}>
                <span style={{ color:'var(--on-surface-variant)' }}>Age</span>
                <span style={{ fontWeight:600 }}>{user.age} years</span>
              </div>
            )}
            {user?.weight && (
              <div style={{ background:'var(--surface-container-low)', borderRadius:8, padding:'.6rem 1rem', display:'flex', justifyContent:'space-between', fontSize:'.82rem' }}>
                <span style={{ color:'var(--on-surface-variant)' }}>Weight</span>
                <span style={{ fontWeight:600 }}>{user.weight} kg</span>
              </div>
            )}
            {user?.height && (
              <div style={{ background:'var(--surface-container-low)', borderRadius:8, padding:'.6rem 1rem', display:'flex', justifyContent:'space-between', fontSize:'.82rem' }}>
                <span style={{ color:'var(--on-surface-variant)' }}>Height</span>
                <span style={{ fontWeight:600 }}>{user.height} cm</span>
              </div>
            )}
          </div>
        </div>

        {/* Edit form */}
        <div className="form-card" style={{ maxWidth:'100%' }}>
          <h3>
            <div style={{ width:4, height:'1.2rem', background:'linear-gradient(135deg,var(--primary),var(--primary-container))', borderRadius:2 }} />
            Edit Profile
          </h3>
          <form onSubmit={handleSubmit} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div style={{ gridColumn:'1/-1' }}>
              <label className="field-label">Full Name</label>
              <input className="field-input" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required />
            </div>
            <div>
              <label className="field-label">Age</label>
              <input type="number" className="field-input" value={form.age} onChange={e => setForm({...form, age:e.target.value})} />
            </div>
            <div>
              <label className="field-label">Weight (kg)</label>
              <input type="number" className="field-input" value={form.weight} onChange={e => setForm({...form, weight:e.target.value})} />
            </div>
            <div>
              <label className="field-label">Height (cm)</label>
              <input type="number" className="field-input" value={form.height} onChange={e => setForm({...form, height:e.target.value})} />
            </div>
            <div>
              <label className="field-label">Fitness Goal</label>
              <select className="field-input" value={form.fitnessGoal} onChange={e => setForm({...form, fitnessGoal:e.target.value})}>
                <option value="lose_weight">Lose Weight</option>
                <option value="build_muscle">Build Muscle</option>
                <option value="improve_endurance">Improve Endurance</option>
                <option value="stay_active">Stay Active</option>
              </select>
            </div>
            {msg && <div className="alert alert-success" style={{ gridColumn:'1/-1' }}>{msg}</div>}
            {err && <div className="alert alert-error"   style={{ gridColumn:'1/-1' }}>{err}</div>}
            <div style={{ gridColumn:'1/-1' }}>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
