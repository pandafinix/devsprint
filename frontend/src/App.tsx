import React, { Suspense, lazy } from 'react';
import {
  BrowserRouter, Routes, Route, Navigate, Outlet,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const BoardPage = lazy(() => import('./pages/BoardPage'));
const RegisterCompanyPage = lazy(() => import('./pages/RegisterCompanyPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const MasterDashboardPage = lazy(() => import('./pages/MasterDashboardPage'));

const FullPageLoader = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

const PublicOnlyRoute: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <FullPageLoader />;
  if (!isAuthenticated) return <Outlet />;
  if (user?.role === 'MASTER_ADMIN') return <Navigate to="/master/dashboard" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/board" replace />;
};

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <FullPageLoader />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const MasterAdminRoute: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <FullPageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'MASTER_ADMIN') return <Navigate to="/login" replace />;
  return <Outlet />;
};

const AdminRoute: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <FullPageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN' && user?.role !== 'MASTER_ADMIN')
    return <Navigate to="/login" replace />;
  return <Outlet />;
};

const UserRoute: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <FullPageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'USER') return <Navigate to="/login" replace />;
  return <Outlet />;
};

const AppRoutes: React.FC = () => (
  <Suspense fallback={<FullPageLoader />}>
    <Routes>
      {/* Landing Page — always accessible */}
      <Route path="/" element={<LandingPage />} />

      {/* Public only — redirect if logged in */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/register-company" element={<RegisterCompanyPage />} />
      </Route>

      {/* Master Admin */}
      <Route element={<MasterAdminRoute />}>
        <Route path="/master/dashboard" element={<MasterDashboardPage />} />
      </Route>

      {/* Admin */}
      <Route element={<AdminRoute />}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      </Route>

      {/* User */}
      <Route element={<UserRoute />}>
        <Route path="/board" element={<BoardPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#1e293b' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
        }}
      />
    </AuthProvider>
  </BrowserRouter>
);

export default App;