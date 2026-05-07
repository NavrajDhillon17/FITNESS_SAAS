import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import AdminOverview from './pages/admin/AdminOverview';
import AdminStaff from './pages/admin/AdminStaff';
import AdminUsers from './pages/admin/AdminUsers';

import StaffDash from './pages/staff/StaffDash';
import StaffCoaches from './pages/staff/StaffCoaches';
import StaffCreateCoach from './pages/staff/StaffCreateCoach';
import StaffUsers from './pages/staff/StaffUsers';
import StaffAssign from './pages/staff/StaffAssign';

import CoachDash from './pages/coach/CoachDash';
import CoachAthletes from './pages/coach/CoachAthletes';
import CoachAssign from './pages/coach/CoachAssign';
import CoachMessages from './pages/coach/CoachMessages';

import UserDashboard from './pages/user/UserDashboard';
import UserWorkouts from './pages/user/UserWorkouts';
import UserGoals from './pages/user/UserGoals';
import UserProfile from './pages/user/UserProfile';
import UserNutrition from './pages/user/UserNutrition';
import UserAskCoach from './pages/user/UserAskCoach';

// ── Guards ──────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/go" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'admin': return <Navigate to="/admin" replace />;
    case 'staff': return <Navigate to="/staff" replace />;
    case 'coach': return <Navigate to="/coach" replace />;
    default: return <Navigate to="/dashboard" replace />;
  }
};

// ── Authenticated Layout ─────────────────────────────────
const AppLayout = ({ children, title }) => (
  <div style={{ display: 'flex' }}>
    <Sidebar />
    <div className="app-layout" style={{ flex: 1 }}>
      <header className="topbar">
        <div className="topbar-title">{title}</div>
      </header>
      <div className="page-content">{children}</div>
    </div>
  </div>
);

// ── Routes ───────────────────────────────────────────────
function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={user ? <RoleRedirect /> : <Login />} />
      <Route path="/register" element={user ? <RoleRedirect /> : <Register />} />
      <Route path="/go" element={<RoleRedirect />} />

      {/* Admin */}
      <Route path="/admin" element={
        <RoleRoute roles={['admin']}>
          <AppLayout title="Performance Engine">
            <AdminOverview />
          </AppLayout>
        </RoleRoute>
      } />
      <Route path="/admin/staff" element={
        <RoleRoute roles={['admin']}>
          <AppLayout title="Staff Ops">
            <AdminStaff />
          </AppLayout>
        </RoleRoute>
      } />
      <Route path="/admin/users" element={
        <RoleRoute roles={['admin']}>
          <AppLayout title="Member Directory">
            <AdminUsers />
          </AppLayout>
        </RoleRoute>
      } />

      {/* Staff */}
      <Route path="/staff" element={
        <RoleRoute roles={['staff', 'admin']}>
          <AppLayout title="Staff Command">
            <StaffDash />
          </AppLayout>
        </RoleRoute>
      } />
      <Route path="/staff/coaches" element={
        <RoleRoute roles={['staff', 'admin']}>
          <AppLayout title="Coach Roster">
            <StaffCoaches />
          </AppLayout>
        </RoleRoute>
      } />
      <Route path="/staff/create-coach" element={
        <RoleRoute roles={['staff', 'admin']}>
          <AppLayout title="Add Coach">
            <StaffCreateCoach />
          </AppLayout>
        </RoleRoute>
      } />
      <Route path="/staff/users" element={
        <RoleRoute roles={['staff', 'admin']}>
          <AppLayout title="Athlete Directory">
            <StaffUsers />
          </AppLayout>
        </RoleRoute>
      } />
      <Route path="/staff/assign" element={
        <RoleRoute roles={['staff', 'admin']}>
          <AppLayout title="Assign Athletes">
            <StaffAssign />
          </AppLayout>
        </RoleRoute>
      } />

      {/* Coach */}
      <Route path="/coach" element={
        <RoleRoute roles={['coach', 'staff', 'admin']}>
          <AppLayout title="Coaching Hub">
            <CoachDash />
          </AppLayout>
        </RoleRoute>
      } />
      <Route path="/coach/athletes" element={
        <RoleRoute roles={['coach', 'staff', 'admin']}>
          <AppLayout title="My Athletes">
            <CoachAthletes />
          </AppLayout>
        </RoleRoute>
      } />
      <Route path="/coach/assign" element={
        <RoleRoute roles={['coach', 'staff', 'admin']}>
          <AppLayout title="Assign Athletes">
            <CoachAssign />
          </AppLayout>
        </RoleRoute>
      } />
      <Route path="/coach/messages" element={
        <RoleRoute roles={['coach']}>
          <AppLayout title="Athlete Messages">
            <CoachMessages />
          </AppLayout>
        </RoleRoute>
      } />

      {/* User */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout title="My Fitness Dashboard">
            <UserDashboard />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/workouts" element={
        <ProtectedRoute>
          <AppLayout title="Workouts">
            <UserWorkouts />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/goals" element={
        <ProtectedRoute>
          <AppLayout title="My Goals">
            <UserGoals />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/nutrition" element={
        <ProtectedRoute>
          <AppLayout title="Nutrition tracking">
            <UserNutrition />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/ask-coach" element={
        <ProtectedRoute>
          <AppLayout title="Ask Coach">
            <UserAskCoach />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout title="My Profile">
            <UserProfile />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
