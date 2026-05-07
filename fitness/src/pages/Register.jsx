import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', age:'', weight:'', height:'', fitnessGoal:'stay_active' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/auth/register', form);
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch(err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const F = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div className="auth-page" style={{ alignItems:'flex-start', paddingTop:'2rem' }}>
      <div style={{ position:'fixed', top:'-20%', right:'-15%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,64,223,.08),transparent 70%)', pointerEvents:'none' }} />
      <div className="auth-card" style={{ maxWidth:520, position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
          <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:'1.4rem', letterSpacing:'-1px', color:'var(--on-surface)', textTransform:'uppercase' }}>
            Kinetic<span style={{ color:'var(--primary)' }}> Pro</span>
          </div>
          <h1 style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:'1.8rem', letterSpacing:'-1px', marginTop:'.3rem' }}>Join as Athlete</h1>
          <p style={{ color:'var(--on-surface-variant)', fontSize:'.85rem', marginTop:'.3rem' }}>Self-registration is for athletes only</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ marginTop:'1.2rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
          <div style={{ gridColumn:'1/-1' }}>
            <label className="field-label">Full Name</label>
            <input className="field-input" placeholder="John Athlete" value={form.name} onChange={e => F('name',e.target.value)} required />
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <label className="field-label">Email Address</label>
            <input type="email" className="field-input" placeholder="you@example.com" value={form.email} onChange={e => F('email',e.target.value)} required />
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <label className="field-label">Password</label>
            <input type="password" className="field-input" placeholder="Min 6 characters" value={form.password} onChange={e => F('password',e.target.value)} required minLength={6} />
          </div>
          <div>
            <label className="field-label">Age</label>
            <input type="number" className="field-input" placeholder="25" value={form.age} onChange={e => F('age',e.target.value)} />
          </div>
          <div>
            <label className="field-label">Weight (kg)</label>
            <input type="number" className="field-input" placeholder="70" value={form.weight} onChange={e => F('weight',e.target.value)} />
          </div>
          <div>
            <label className="field-label">Height (cm)</label>
            <input type="number" className="field-input" placeholder="175" value={form.height} onChange={e => F('height',e.target.value)} />
          </div>
          <div>
            <label className="field-label">Fitness Goal</label>
            <select className="field-input" value={form.fitnessGoal} onChange={e => F('fitnessGoal',e.target.value)}>
              <option value="lose_weight">Lose Weight</option>
              <option value="build_muscle">Build Muscle</option>
              <option value="improve_endurance">Improve Endurance</option>
              <option value="stay_active">Stay Active</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}
            style={{ gridColumn:'1/-1', width:'100%', justifyContent:'center', padding:'.85rem', marginTop:'.25rem' }}>
            {loading ? 'Creating Account...' : 'Create Athlete Account →'}
          </button>
        </form>

        <div style={{ textAlign:'center', marginTop:'1.25rem', color:'var(--on-surface-variant)', fontSize:'.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--primary)', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
