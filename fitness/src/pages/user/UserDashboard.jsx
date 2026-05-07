import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 8, padding: '.6rem .9rem', fontSize: '.82rem', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ color: 'var(--on-surface-variant)', marginBottom: 3 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</div>)}
    </div>
  );
  return null;
};

export default function UserDashboard() {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({});
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/progress/weekly'),
      api.get('/progress/monthly'),
      api.get('/workouts?limit=5'),
      api.get('/goals'),
    ]).then(([wr, mr, workR, goalR]) => {
      setWeeklyData(wr.data.map(d => ({ ...d, day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }) })));
      setMonthlyStats(mr.data);
      setRecentWorkouts(workR.data.workouts || []);
      setGoals((goalR.data || []).filter(g => g.status === 'active').slice(0, 3));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  const statsCards = [
    { value: monthlyStats.workouts || 0, label: 'Workouts', icon: '💪', sub: 'This month', color: 'var(--primary)' },
    { value: monthlyStats.calories ? Math.round(monthlyStats.calories) : 0, label: 'Calories', icon: '🔥', sub: 'This month', color: 'var(--tertiary)' },
    { value: monthlyStats.duration ? Math.round(monthlyStats.duration / 60) : 0, label: 'Hours', icon: '⏱', sub: 'Active time', color: 'var(--secondary)' },
    { value: goals.length, label: 'Active Goals', icon: '🎯', sub: 'In progress', color: 'var(--success)' },
  ];

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-1px' }}>
          Good day, {user?.name?.split(' ')[0] || 'Athlete'} 👋
        </h2>
        <div style={{ color: 'var(--on-surface-variant)', marginTop: '.25rem', fontSize: '.9rem' }}>
          Here's your performance summary
        </div>
      </div>

      {user?.assignedPlan && (
        <div style={{ background: 'var(--primary-container)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📋</span>
            <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 800, fontSize: '1.1rem', color: 'var(--on-primary-container)' }}>
              Coach's Workout Plan
            </div>
          </div>
          <div style={{ fontSize: '.9rem', color: 'var(--on-primary-container)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {user.assignedPlan}
          </div>
        </div>
      )}

      {/* Stats bento */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {statsCards.map((s, i) => (
          <div key={i} className="stat-mini">
            <div className="icon-wrap" style={{ background: `${s.color}12` }}>{s.icon}</div>
            <div>
              <div className="mini-label">{s.label}</div>
              <div className="mini-value" style={{ color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '.7rem', color: 'var(--outline)', marginTop: 2 }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>Weekly Calories</div>
            <span className="role-pill active">7 Days</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--on-surface-variant)', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--on-surface-variant)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,64,223,.05)' }} />
              <Bar dataKey="calories" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Calories" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>Duration (min)</div>
            <span className="role-pill staff">This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--on-surface-variant)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--on-surface-variant)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="duration" stroke="var(--secondary)" strokeWidth={2.5} dot={{ fill: 'var(--secondary)', r: 4 }} name="Duration" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Recent Workouts */}
        <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>Recent Workouts</div>
            <Link to="/workouts" style={{ color: 'var(--primary)', fontSize: '.8rem', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
          </div>
          {recentWorkouts.length === 0
            ? <div className="empty-state" style={{ padding: '1.5rem' }}><div className="icon">💪</div><p>No workouts yet</p></div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
              {recentWorkouts.map(w => {
                const d = new Date(w.date);
                return (
                  <div key={w._id} className="workout-item">
                    <div className="date-badge">
                      <div className="day">{d.getDate()}</div>
                      <div className="mon">{d.toLocaleDateString('en', { month: 'short' })}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: '.88rem' }}>{w.title}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>{w.exercises?.length || 0} exercises · {w.totalCalories || 0} cal</div>
                    </div>
                    <span className="role-pill active">{w.totalDuration || 0}m</span>
                  </div>
                );
              })}
            </div>
          }
        </div>

        {/* Goals */}
        <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>Active Goals</div>
            <Link to="/goals" style={{ color: 'var(--primary)', fontSize: '.8rem', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
          </div>
          {goals.length === 0
            ? <div className="empty-state" style={{ padding: '1.5rem' }}><div className="icon">🎯</div><p>No goals set</p></div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {goals.map(g => {
                const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
                return (
                  <div key={g._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.35rem' }}>
                      <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 600, fontSize: '.88rem' }}>{g.title}</div>
                      <span style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 800, color: 'var(--primary)', fontSize: '.95rem' }}>{pct}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div style={{ fontSize: '.72rem', color: 'var(--on-surface-variant)', marginTop: 3 }}>
                      {g.currentValue} / {g.targetValue} {g.unit}
                    </div>
                  </div>
                );
              })}
            </div>
          }
        </div>
      </div>
    </div>
  );
}
