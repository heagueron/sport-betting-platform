import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../components/pages/Home/HomePage';
import SportsPage from '../components/pages/Sports/SportsPage';
import SportDetailPage from '../components/pages/Sports/SportDetailPage';
import EventsPage from '../components/pages/Events/EventsPage';
import EventDetailPage from '../components/pages/Events/EventDetailPage';
import AboutPage from '../components/pages/About/AboutPage';
import NotFoundPage from '../components/pages/NotFound/NotFoundPage';
import ProfilePage from '../components/pages/Profile/ProfilePage';
import AdminPage from '../components/pages/Admin/AdminPage';
import UsersList from '../components/pages/Admin/Users/UsersList';
import UserDetail from '../components/pages/Admin/Users/UserDetail';
import ProtectedRoute from '../components/auth/ProtectedRoute/ProtectedRoute';
import AdminRoute from '../components/auth/AdminRoute/AdminRoute';
import { useAuth } from '../contexts/AuthContext';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/sports" element={<SportsPage />} />
      <Route path="/sports/:sportId" element={<SportDetailPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:eventId" element={<EventDetailPage />} />
      <Route path="/about" element={<AboutPage />} />

      {/* Protected Routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminPage />
        </AdminRoute>
      } />
      <Route path="/admin/users" element={
        <AdminRoute>
          <UsersList />
        </AdminRoute>
      } />
      <Route path="/admin/users/:userId" element={
        <AdminRoute>
          <UserDetail />
        </AdminRoute>
      } />

      {/* Redirect to profile if already logged in */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/profile" replace /> : <Navigate to="/" replace />
      } />

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
