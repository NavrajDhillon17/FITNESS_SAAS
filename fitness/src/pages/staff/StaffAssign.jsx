import { useState, useEffect } from 'react';
import api from '../../api';

export default function StaffAssign() {
  const [unassigned, setUnassigned] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCoachId, setSelectedCoachId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, cRes] = await Promise.all([
        api.get('/staff/unassigned').catch(() => ({ data: [] })),
        api.get('/staff/coaches').catch(() => ({ data: [] }))
      ]);
      setUnassigned(uRes.data);
      setCoaches(cRes.data);
      if (cRes.data.length > 0) {
        setSelectedCoachId(cRes.data[0]._id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const assignUser = async (userId) => {
    if (!selectedCoachId) {
      alert("Please select a coach first");
      return;
    }
    try {
      await api.post(`/staff/assign`, { userId, coachId: selectedCoachId });
      fetchData(); // Refresh the lists
    } catch (e) {
      alert(e.response?.data?.message || 'Error assigning user');
    }
  };

  const filtered = unassigned.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="loader"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="section-heading">Assign Athletes to Coaches</div>
          <div className="section-sub">{unassigned.length} unassigned athletes available</div>
        </div>
        <div className="search-wrap">
          🔍 <input placeholder="Search athletes..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface)', padding: '1rem', borderRadius: '12px' }}>
        <strong style={{ color: 'var(--on-surface)' }}>Select Coach to Assign to:</strong>
        <select 
          className="field-input" 
          style={{ width: '300px', margin: 0 }}
          value={selectedCoachId} 
          onChange={(e) => setSelectedCoachId(e.target.value)}
        >
          {coaches.map(c => (
            <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
          ))}
        </select>
      </div>

      <div className="tonal-container" style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
        {filtered.length === 0
          ? <div className="empty-state"><div className="icon">✅</div><p>All athletes are assigned to coaches.</p></div>
          : filtered.map(u => (
              <div key={u._id} className="tonal-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="item-avatar-initials" style={{ background: 'rgba(0,64,223,.1)', color: 'var(--primary)' }}>
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: '.95rem' }}>{u.name}</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>{u.email}</div>
                    {u.fitnessGoal && <div style={{ marginTop: 4 }}><span className="role-pill user">{u.fitnessGoal.replace(/_/g, ' ')}</span></div>}
                  </div>
                </div>
                <button className="btn-primary" style={{ fontSize: '.8rem', padding: '.45rem 1.2rem' }} onClick={() => assignUser(u._id)}>
                  Assign to Selected Coach →
                </button>
              </div>
            ))
        }
      </div>
    </div>
  );
}
