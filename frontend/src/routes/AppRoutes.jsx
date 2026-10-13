import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import LandingPage from '../pages/public/LandingPage';
import MembershipPage, { MembershipStatusPage } from '../pages/public/MembershipPage';
import MembershipApplicationsPage from '../pages/admin/MembershipApplicationsPage';
import ProtectedRoute from '../components/protected/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/join" element={<MembershipPage />} />
      <Route path="/join/status" element={<main className="membership-page"><MembershipStatusPage /></main>} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes (Wrapped by ProtectedRoute guard) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin/memberships" element={<MembershipApplicationsPage />} />
        <Route path="/admin/memberships/new" element={<MembershipPage staffMode />} />
      </Route>

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}