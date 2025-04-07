import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../components/pages/Home/HomePage';
import SportsPage from '../components/pages/Sports/SportsPage';
import EventsPage from '../components/pages/Events/EventsPage';
import AboutPage from '../components/pages/About/AboutPage';
import NotFoundPage from '../components/pages/NotFound/NotFoundPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/sports" element={<SportsPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
