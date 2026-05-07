import { useState, useEffect } from 'react';
import api from '../../api';

export default function StaffCoaches() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => { fetchCoaches(); }, []);
  const fetchCoaches = async () => {
    setLoading(true);
    try { const r = await api.get('/staff/coaches'); setCoaches(r.data); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = coaches.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="loader"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="section-heading">Coach Roster</div>
          <div className="section-sub">{coaches.length} coaches in your network</div>
        </div>
        <div className="search-wrap">
          🔍 <input placeholder="Filter coaches..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="tonal-container" style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
        {filtered.length === 0
          ? <div className="empty-state"><div className="icon">🏋️</div><p>No coaches yet. Create one from "Add Coach".</p></div>
          : filtered.map(c => (
              <div key={c._id} className="tonal-item">
                <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                  <div className="item-avatar-initials" style={{ background:'rgba(153,49,0,.1)', color:'var(--tertiary)' }}>
                    {c.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:'.95rem' }}>{c.name}</div>
                    <div style={{ fontSize:'.78rem', color:'var(--on-surface-variant)', marginTop:2 }}>{c.email}</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                  <span className="role-pill coach">Coach</span>
                  <span className={`role-pill ${c.isActive ? 'active' : 'inactive'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
}
