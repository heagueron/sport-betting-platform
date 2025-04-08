import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import MainLayout from './components/layout/MainLayout/MainLayout';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthModal, { AuthModalMode } from './components/auth/AuthModal/AuthModal';

const AppContent = () => {
  const { isAuthenticated, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');

  const handleLogin = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const handleSignup = () => {
    setAuthModalMode('register');
    setAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await logout();
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <>
      <MainLayout
        isAuthenticated={isAuthenticated}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onLogout={handleLogout}
      >
        <AppRoutes />
      </MainLayout>

      <AuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
