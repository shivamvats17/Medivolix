import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Home from './pages/Home';
import SearchMedicines from './pages/SearchMedicines';
import MedicineDetails from './pages/MedicineDetails';
import PharmacyDetails from './pages/PharmacyDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import ApiExplorer from './pages/ApiExplorer';
import NotFound from './pages/NotFound';

function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 16px' }}>
        <LoadingSpinner message="Checking authentication status..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ returnUrl: location.pathname }} replace />;
  }

  if (role === 'PHARMACY_ADMIN' && user.role !== 'PHARMACY_ADMIN' && user.role !== 'SYSTEM_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  if (role === 'SYSTEM_ADMIN' && user.role !== 'SYSTEM_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>

        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public Pages */}
            <Route index element={<Home />} />
            <Route path="search" element={<SearchMedicines />} />
            <Route path="medicines/:id" element={<MedicineDetails />} />
            <Route path="pharmacies/:id" element={<PharmacyDetails />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="api-docs" element={<ApiExplorer />} />
            <Route path="developer/api-explorer" element={<ApiExplorer />} />

            {/* Authenticated Customer Pages */}
            <Route
              path="dashboard"
              element={
                <RequireAuth>
                  <UserDashboard />
                </RequireAuth>
              }
            />

            {/* Authenticated Pharmacy Admin Pages */}
            <Route
              path="pharmacy-dashboard"
              element={
                <RequireAuth role="PHARMACY_ADMIN">
                  <PharmacyDashboard />
                </RequireAuth>
              }
            />

            {/* Authenticated System Admin Pages */}
            <Route
              path="admin"
              element={
                <RequireAuth role="SYSTEM_ADMIN">
                  <AdminDashboard />
                </RequireAuth>
              }
            />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
  );
}

