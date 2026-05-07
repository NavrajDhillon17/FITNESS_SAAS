import { useState, useEffect } from 'react';
import api from '../../api';

export default function CoachDash() {
  const [overview, setOverview] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/coach/overview'), api.get('/coach/users')])
      .then(([ov, us]) => { setOverview(ov.data); setUsers(us.data); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  const withPlans = users.filter(u => u.assignedPlan).length;

  return (
    <div>
      <div className="bento-grid">
        <div className="bento-primary">
          <div>
            <div className="label">Coaching Hub</div>
            <div className="value">{overview.assignedUsers || 0}</div>
            <div style={{ fontSize: '.85rem', opacity: .8, marginTop: '.25rem' }}>athletes under your guidance</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,.2)', padding: '.25rem .75rem', borderRadius: 99, fontSize: '.75rem', fontWeight: 700, alignSelf: 'flex-start' }}>
            Head Coach
          </div>
        </div>
        <div className="stat-mini">
          <div className="icon-wrap" style={{ background: 'rgba(153,49,0,.1)' }}>📋</div>
          <div>
            <div className="mini-label">With Plans</div>
            <div className="mini-value" style={{ color: 'var(--tertiary)' }}>{withPlans}</div>
          </div>
        </div>
        <div className="stat-mini">
          <div className="icon-wrap" style={{ background: 'rgba(73,89,163,.1)' }}>⭕</div>
          <div>
            <div className="mini-label">Unplanned</div>
            <div className="mini-value" style={{ color: 'var(--secondary)' }}>{users.length - withPlans}</div>
          </div>
        </div>
      </div>

      {users.length > 0 && (
        <>
          <div className="page-header" style={{ marginBottom: '1.25rem' }}>
            <div className="section-heading">Recent Athletes</div>
          </div>
          <div className="tonal-container" style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {users.slice(0, 5).map(u => (
              <div key={u._id} className="tonal-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="item-avatar-initials" style={{ background: 'rgba(46,125,50,.1)', color: 'var(--success)' }}>
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: '.95rem' }}>{u.name}</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>{u.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
                  {u.fitnessGoal && <span className="role-pill user">{u.fitnessGoal.replace(/_/g, ' ')}</span>}
                  {u.assignedPlan
                    ? <span className="role-pill active">Plan Assigned</span>
                    : <span className="role-pill inactive">No Plan</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
