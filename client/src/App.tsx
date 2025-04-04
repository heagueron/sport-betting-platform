import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { HomePage } from './components/pages/home/HomePage';
import { LoginPage } from './components/pages/auth/LoginPage/LoginPage';
import { RegisterPage } from './components/pages/auth/RegisterPage/RegisterPage';
import { AdminDashboard } from './components/pages/admin/Dashboard/AdminDashboard';
import { AdminSports } from './components/pages/admin/Sports/AdminSports';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<div>Profile Page</div>} />
            <Route path="/bets" element={<div>My Bets Page</div>} />
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute requireAdmin />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/sports" element={<AdminSports />} />
            <Route path="/admin/users" element={<div>Admin Users Page</div>} />
            <Route path="/admin/events" element={<div>Admin Events Page</div>} />
            <Route path="/admin/bets" element={<div>Admin Bets Page</div>} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<div>404 Page Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App
