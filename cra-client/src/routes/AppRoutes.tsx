import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../components/pages/Home/HomePage';
import SportsPage from '../components/pages/Sports/SportsPage';
import SportDetailPage from '../components/pages/Sports/SportDetailPage';
import EventsPage from '../components/pages/Events/EventsPage';
import EventDetailPage from '../components/pages/Events/EventDetailPage';
import AboutPage from '../components/pages/About/AboutPage';
import NotFoundPage from '../components/pages/NotFound/NotFoundPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/sports" element={<SportsPage />} />
      <Route path="/sports/:sportId" element={<SportDetailPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:eventId" element={<EventDetailPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
