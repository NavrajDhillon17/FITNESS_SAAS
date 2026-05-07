import { useState, useEffect } from 'react';
import api from '../../api';

const COLORS = { admin: 'var(--primary)', staff: 'var(--secondary)', coach: 'var(--tertiary)', user: 'var(--success)' };

export default function AdminOverview() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/overview').then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  const hierarchy = [
    { role: 'Admin', icon: '🛠️', color: COLORS.admin, desc: 'Creates Staff · Full system access · All analytics' },
    { role: 'Staff', icon: '🧑‍💼', color: COLORS.staff, desc: 'Creates Coaches · Manages content · Limited analytics' },
    { role: 'Coach', icon: '🏋️', color: COLORS.coach, desc: 'Guides Athletes · Assigns workout plans · Tracks progress' },
    { role: 'Athlete', icon: '🏃', color: COLORS.user, desc: 'Logs workouts · Sets goals · Views personal dashboard' },
  ];

  return (
    <div>
      {/* Bento stats */}
      <div className="bento-grid">
        <div className="bento-primary">
          <div>
            <div className="label">Total System Users</div>
            <div className="value">{stats.total || 0}</div>
          </div>
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,.2)', padding: '.25rem .75rem', borderRadius: 99, fontSize: '.75rem', fontWeight: 700 }}>
              {stats.admins || 0} Admins
            </div>
            <div style={{ background: 'rgba(255,255,255,.2)', padding: '.25rem .75rem', borderRadius: 99, fontSize: '.75rem', fontWeight: 700 }}>
              {stats.staff || 0} Staff
            </div>
          </div>
        </div>
        <div className="stat-mini">
          <div className="icon-wrap" style={{ background: 'rgba(73,89,163,.1)' }}>🏋️</div>
          <div>
            <div className="mini-label">Coaches</div>
            <div className="mini-value" style={{ color: 'var(--secondary)' }}>{stats.coaches || 0}</div>
          </div>
        </div>
        <div className="stat-mini">
          <div className="icon-wrap" style={{ background: 'rgba(46,125,50,.1)' }}>🏃</div>
          <div>
            <div className="mini-label">Athletes</div>
            <div className="mini-value" style={{ color: 'var(--success)' }}>{stats.users || 0}</div>
          </div>
        </div>
      </div>

      {/* Role Hierarchy */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <div className="section-heading">Role Hierarchy</div>
          <div className="section-sub">Chain of command — Admin creates Staff, Staff creates Coaches, Coaches guide Athletes</div>
        </div>
      </div>

      <div className="tonal-container" style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
        {hierarchy.map((h, i) => (
          <div key={h.role} className="hierarchy-step">
            <div className="h-step-num">{String(i + 1).padStart(2, '0')}</div>
            <div className="h-step-dot" style={{ background: h.color }} />
            <div style={{ fontSize: '1.4rem' }}>{h.icon}</div>
            <div>
              <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: '.95rem', color: h.color }}>{h.role}</div>
              <div style={{ fontSize: '.78rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>{h.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* System Health */}
      <div style={{ marginTop: '2rem' }}>
        <div className="section-heading" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>System Health</div>
        <div style={{ background: 'var(--surface-container)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
          {[
            { label: 'Server Load', value: '24%', pct: 24, color: 'var(--primary)' },
            { label: 'API Latency', value: '82ms', pct: 45, color: 'var(--secondary)' },
            { label: 'Database Sync', value: '99.9%', pct: 99, color: 'var(--success)' },
          ].map(h => (
            <div key={h.label} className="health-bar-wrap">
              <div className="health-label">
                <span style={{ color: 'var(--on-surface-variant)' }}>{h.label}</span>
                <span style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 800, color: h.color }}>{h.value}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${h.pct}%`, background: h.color }} />
              </div>
            </div>
          ))}
          <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius)', padding: '.75rem 1rem', display: 'flex', alignItems: 'center', gap: '.6rem', marginTop: '.5rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '.875rem', fontWeight: 600 }}>All protocols operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
