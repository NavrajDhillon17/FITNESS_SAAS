import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function StaffDash() {
  const [overview, setOverview] = useState({});
  const [recentAthletes, setRecentAthletes] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/staff/overview').catch(() => ({ data: {} })),
      api.get('/staff/users').catch(() => ({ data: [] })),
    ]).then(([ov, us]) => {
      setOverview(ov.data);
      setRecentAthletes(us.data.slice(0, 5)); // show last 5
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  const responsibilities = [
    { icon: '➕', title: 'Create Coaches',    desc: 'Add new coaches who will train athletes under your supervision.',  to: '/staff/create-coach' },
    { icon: '📋', title: 'Manage Content',    desc: 'Oversee workout plans, exercises database, and training content.',   to: '/staff/coaches' },
    { icon: '📊', title: 'Track Performance', desc: 'View analytics for coaches and athletes in your network.',           to: '/staff/users' },
    { icon: '🛡️', title: 'User Support',     desc: 'Help users with account issues, reassign coaches, toggle accounts.', to: '/staff/users' },
  ];

  const unassignedCount = recentAthletes.filter(u => !u.assignedCoach).length;

  return (
    <div>
      {/* ── Bento stats ── */}
      <div className="bento-grid">
        <div className="bento-primary">
          <div>
            <div className="label">My Team Overview</div>
            <div className="value">{overview.coaches || 0}</div>
            <div style={{ fontSize: '.85rem', opacity: .8, marginTop: '.25rem' }}>coaches in my network</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,.2)', padding: '.25rem .75rem', borderRadius: 99, fontSize: '.75rem', fontWeight: 700, alignSelf: 'flex-start' }}>
            Staff Dashboard
          </div>
        </div>

        <Link to="/staff/coaches" className="stat-mini" style={{ textDecoration: 'none' }}>
          <div className="icon-wrap" style={{ background: 'rgba(73,89,163,.1)' }}>🏋️</div>
          <div>
            <div className="mini-label">My Coaches</div>
            <div className="mini-value" style={{ color: 'var(--secondary)' }}>{overview.coaches || 0}</div>
          </div>
        </Link>

        <Link to="/staff/users" className="stat-mini" style={{ textDecoration: 'none' }}>
          <div className="icon-wrap" style={{ background: 'rgba(46,125,50,.1)' }}>👥</div>
          <div>
            <div className="mini-label">Athletes Managed</div>
            <div className="mini-value" style={{ color: 'var(--success)' }}>{overview.usersManaged || 0}</div>
          </div>
        </Link>
      </div>

      {/* ── Alert: unassigned athletes ── */}
      {unassignedCount > 0 && (
        <Link to="/staff/users" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'rgba(245,158,11,.1)',
            border: '1px solid rgba(245,158,11,.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '.9rem 1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '.75rem',
            marginBottom: '1.5rem',
            cursor: 'pointer',
            transition: 'background .2s',
          }}>
            <span style={{ fontSize: '1.3rem' }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: '.9rem', color: 'var(--on-surface)' }}>
                {unassignedCount} unassigned athlete{unassignedCount > 1 ? 's' : ''} need a coach
              </div>
              <div style={{ fontSize: '.75rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
                Go to Athlete Support → to assign them
              </div>
            </div>
            <span style={{ color: 'var(--on-surface-variant)', fontSize: '.9rem' }}>→</span>
          </div>
        </Link>
      )}

      {/* ── Recent Athletes Preview ── */}
      {recentAthletes.length > 0 && (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.9rem' }}>
            <div className="section-heading" style={{ fontSize: '1rem' }}>Recent Athletes</div>
            <Link to="/staff/users" style={{ fontSize: '.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              View All →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {recentAthletes.map(u => (
              <div key={u._id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '.9rem',
                background: 'var(--surface-container-low)',
                borderRadius: 'var(--radius-lg)',
                padding: '.7rem 1rem',
              }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(0,64,223,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope,sans-serif', fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: '.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--on-surface-variant)' }}>{u.email}</div>
                </div>
                <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                  {u.assignedCoach
                    ? <span style={{ fontSize: '.72rem', background: 'rgba(46,125,50,.1)', color: 'var(--success)', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>🏋️ {u.assignedCoach.name}</span>
                    : <span style={{ fontSize: '.72rem', background: 'rgba(245,158,11,.12)', color: '#b45309', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>⚠️ Unassigned</span>
                  }
                  <span className={`role-pill ${u.isActive ? 'active' : 'inactive'}`} style={{ fontSize: '.68rem' }}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Responsibilities ── */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div className="section-heading">Your Responsibilities</div>
      </div>

      <div className="tonal-container" style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
        {responsibilities.map(r => (
          <Link key={r.title} to={r.to} style={{ textDecoration: 'none' }}>
            <div className="hierarchy-step" style={{ cursor: 'pointer', transition: 'background .15s' }}>
              <div style={{ fontSize: '1.4rem', width: 32, textAlign: 'center', flexShrink: 0 }}>{r.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: '.95rem', color: 'var(--secondary)' }}>{r.title}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>{r.desc}</div>
              </div>
              <div style={{ color: 'var(--on-surface-variant)', fontSize: '.9rem' }}>→</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
