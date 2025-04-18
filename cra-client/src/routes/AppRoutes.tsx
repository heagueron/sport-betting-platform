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
import SportsList from '../components/pages/Admin/Sports/SportsList';
import SportDetail from '../components/pages/Admin/Sports/SportDetail';
import EventsList from '../components/pages/Admin/Events/EventsList';
import EventDetail from '../components/pages/Admin/Events/EventDetail';
import MarketsList from '../components/pages/Admin/Markets/MarketsList';
import MarketCreate from '../components/pages/Admin/Markets/MarketCreate';
import MarketDetail from '../components/pages/Admin/Markets/MarketDetail';
import MarketSettlementHistory from '../components/pages/Admin/Markets/MarketSettlementHistory';
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

      <Route path="/admin/sports" element={
        <AdminRoute>
          <SportsList />
        </AdminRoute>
      } />
      <Route path="/admin/sports/:sportId" element={
        <AdminRoute>
          <SportDetail />
        </AdminRoute>
      } />

      <Route path="/admin/events" element={
        <AdminRoute>
          <EventsList />
        </AdminRoute>
      } />
      <Route path="/admin/events/:eventId" element={
        <AdminRoute>
          <EventDetail />
        </AdminRoute>
      } />

      <Route path="/admin/markets" element={
        <AdminRoute>
          <MarketsList />
        </AdminRoute>
      } />
      <Route path="/admin/markets/create" element={
        <AdminRoute>
          <MarketCreate />
        </AdminRoute>
      } />
      <Route path="/admin/markets/settlements" element={
        <AdminRoute>
          <MarketSettlementHistory />
        </AdminRoute>
      } />
      <Route path="/admin/markets/:marketId" element={
        <AdminRoute>
          <MarketDetail />
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
