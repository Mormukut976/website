import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { useAuth } from './state/AuthContext.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import InvestPage from './pages/InvestPage.jsx';
import NoticePage from './pages/NoticePage.jsx';
import BlogPage from './pages/BlogPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import HelpPage from './pages/HelpPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import RechargePage from './pages/RechargePage.jsx';

function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="fullscreen-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RequireAdmin({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="fullscreen-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <div className="app-root">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/admin"
          element={(
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          )}
        />

        <Route
          path="/"
          element={(
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          )}
        >
          <Route index element={<DashboardPage />} />
          <Route path="recharge" element={<RechargePage />} />
          <Route path="invest" element={<InvestPage />} />
          <Route path="notice" element={<NoticePage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="help" element={<HelpPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
