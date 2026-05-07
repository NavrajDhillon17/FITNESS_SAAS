import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm]     = useState({ email:'', password:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const u = await login(form.email, form.password);
      switch(u?.role) {
        case 'admin': navigate('/admin');     break;
        case 'staff': navigate('/staff');     break;
        case 'coach': navigate('/coach');     break;
        default:      navigate('/dashboard'); break;
      }
    } catch(err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      {/* Bg orb */}
      <div style={{ position:'fixed', top:'-20%', right:'-15%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,64,223,.08),transparent 70%)', pointerEvents:'none', zIndex:0 }} />

      <div className="auth-card" style={{ position:'relative', zIndex:1 }}>
        {/* Brand */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:'1.5rem', letterSpacing:'-1px', color:'var(--on-surface)', textTransform:'uppercase' }}>
            Kinetic<span style={{ color:'var(--primary)' }}> Pro</span>
          </div>
          <h1 style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:'2rem', letterSpacing:'-1px', marginTop:'.4rem' }}>
            Welcome Back
          </h1>
          <p style={{ color:'var(--on-surface-variant)', fontSize:'.88rem', marginTop:'.4rem' }}>
            Sign in to your dashboard
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ marginTop:'1.5rem', display:'flex', flexDirection:'column', gap:'1.2rem' }}>
          <div>
            <label className="field-label">Email Address</label>
            <input type="email" className="field-input" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input type="password" className="field-input" placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password:e.target.value})} required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}
            style={{ width:'100%', justifyContent:'center', padding:'.85rem', marginTop:'.25rem' }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        {/* Role hint */}
        <div style={{ background:'var(--surface-container-low)', borderRadius:'var(--radius)', padding:'.9rem', marginTop:'1.5rem', fontSize:'.78rem', color:'var(--on-surface-variant)' }}>
          <div style={{ fontWeight:700, fontSize:'.68rem', letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--outline)', marginBottom:'.4rem' }}>Role-based routing</div>
          <div>🛠️ Admin → Control Panel &nbsp;|&nbsp; 🧑‍💼 Staff → Staff Dashboard</div>
          <div style={{ marginTop:3 }}>🏋️ Coach → Coaching Hub &nbsp;|&nbsp; 🏃 Athlete → Personal Dashboard</div>
        </div>

        <div style={{ textAlign:'center', marginTop:'1.25rem', color:'var(--on-surface-variant)', fontSize:'.875rem' }}>
          New here?{' '}
          <Link to="/register" style={{ color:'var(--primary)', fontWeight:600, textDecoration:'none' }}>Create an athlete account</Link>
        </div>
      </div>
    </div>
  );
}
