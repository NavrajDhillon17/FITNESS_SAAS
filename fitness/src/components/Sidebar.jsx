import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const ROLE_LINKS = {
  admin: [
    {
      section: 'Admin', links: [
        { to: '/admin', icon: '📊', label: 'Executive Overview' },
        { to: '/admin/staff', icon: '🧑‍💼', label: 'Staff Ops' },
        { to: '/admin/users', icon: '👥', label: 'All Members' },
        { to: '/staff/coaches', icon: '🏋️', label: 'Coach Roster' },
        { to: '/staff/create-coach', icon: '➕', label: 'Add Coach' },
        { to: '/staff/assign', icon: '🔗', label: 'Assign Athletes' },
      ]
    },
    {
      section: 'Account', links: [
        { to: '/profile', icon: '👤', label: 'My Profile' },
      ]
    },
  ],
  staff: [
    {
      section: 'Staff', links: [
        { to: '/staff', icon: '📊', label: 'My Dashboard' },
        { to: '/staff/coaches', icon: '🏋️', label: 'Coach Roster' },
        { to: '/staff/create-coach', icon: '➕', label: 'Add Coach' },
        { to: '/staff/users', icon: '🏃', label: 'All Athletes' },
        { to: '/staff/assign', icon: '🔗', label: 'Assign Athletes' },
      ]
    },
    {
      section: 'Account', links: [
        { to: '/profile', icon: '👤', label: 'My Profile' },
      ]
    },
  ],
  coach: [
    {
      section: 'Coaching', links: [
        { to: '/coach', icon: '📊', label: 'My Dashboard' },
        { to: '/coach/athletes', icon: '🏃', label: 'My Athletes' },
        { to: '/coach/assign', icon: '➕', label: 'Assign Athletes' },
        { to: '/coach/messages', icon: '💬', label: 'Messages' },
      ]
    },
    {
      section: 'Account', links: [
        { to: '/profile', icon: '👤', label: 'My Profile' },
      ]
    },
  ],
  user: [
    {
      section: 'Fitness', links: [
        { to: '/dashboard', icon: '📊', label: 'Dashboard' },
        { to: '/workouts', icon: '💪', label: 'Workouts' },
        { to: '/goals', icon: '🎯', label: 'Goals' },
        { to: '/nutrition', icon: '🥑', label: 'Nutrition' },
        { to: '/ask-coach', icon: '💬', label: 'Ask Coach' },
      ]
    },
    {
      section: 'Account', links: [
        { to: '/profile', icon: '👤', label: 'My Profile' },
      ]
    },
  ],
};

const ROLE_META = {
  admin: 'Administrator',
  staff: 'Staff Member',
  coach: 'Head Coach',
  user: 'Athlete',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const role = user?.role || 'user';
  const sections = ROLE_LINKS[role] || ROLE_LINKS.user;

  // Message unread count
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await api.get('/messages/unread-count');
        setUnreadCount(res.data.unreadCount);
      } catch (e) { }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        Kinetic<span> Pro</span>
      </div>

      <nav className="sidebar-nav">
        {sections.map(sec => (
          <div key={sec.section}>
            <div className="sidebar-section-label">{sec.section}</div>
              {sec.links.map(l => (
                <NavLink
                  key={l.to} to={l.to} end
                  className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <span className="sidebar-icon">{l.icon}</span>
                    <span style={{ flex: 1 }}>{l.label}</span>
                    {/* Unread messages badge */}
                    {(l.to === '/ask-coach' || l.to === '/coach/messages') && unreadCount > 0 && (
                      <span style={{
                        background: 'var(--error)',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        marginLeft: 'auto'
                      }}>
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </NavLink>
              ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-avatar">{user?.name?.[0]?.toUpperCase()}</div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div className="sidebar-user-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name}
          </div>
          <div className="sidebar-user-role">{ROLE_META[role]}</div>
        </div>
        <button onClick={handleLogout} title="Sign out"
          style={{ background: 'rgba(255,255,255,.08)', border: 'none', color: '#9ca3af', width: 34, height: 34, borderRadius: 8, cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          ⏻
        </button>
      </div>
    </aside>
  );
}
