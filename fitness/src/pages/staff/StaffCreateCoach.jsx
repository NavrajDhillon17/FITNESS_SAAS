import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export default function StaffCreateCoach() {
  const [form, setForm]   = useState({ name:'', email:'', password:'' });
  const [msg, setMsg]     = useState('');
  const [err, setErr]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setMsg(''); setErr(''); setLoading(true);
    try {
      await api.post('/staff/coaches', form);
      setMsg('✅ Coach account created successfully!');
      setForm({ name:'', email:'', password:'' });
    } catch(e) { setErr(e.response?.data?.message || 'Error creating coach'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="section-heading">Add Coach</div>
          <div className="section-sub">Create a new coach account under your supervision</div>
        </div>
      </div>

      <div className="form-card">
        <h3>
          <div style={{ width:4, height:'1.2rem', background:'linear-gradient(135deg,var(--secondary),var(--primary))', borderRadius:2 }} />
          Create Coach Account
        </h3>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div>
            <label className="field-label">Full Name</label>
            <input className="field-input" placeholder="e.g. Mike Johnson"
              value={form.name} onChange={e => setForm({...form, name:e.target.value})} required />
          </div>
          <div>
            <label className="field-label">Email Address</label>
            <input type="email" className="field-input" placeholder="coach@kinetic.pro"
              value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input type="password" className="field-input" placeholder="Min 6 characters"
              value={form.password} onChange={e => setForm({...form, password:e.target.value})} required minLength={6} />
          </div>
          {msg && <div className="alert alert-success">{msg}</div>}
          {err && <div className="alert alert-error">{err}</div>}
          <div style={{ display:'flex', gap:'1rem' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Coach →'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/staff/coaches')}>
              View Coach Roster
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
