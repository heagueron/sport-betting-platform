import React from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { useAuth } from '../../../contexts/AuthContext';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
  onLogin?: () => void;
  onSignup?: () => void;
  onLogout?: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  isAuthenticated = false,
  onLogin,
  onSignup,
  onLogout,
}) => {
  const { user } = useAuth();
  return (
    <div className="main-layout">
      <Header
        isAuthenticated={isAuthenticated}
        isAdmin={user?.role === 'ADMIN'}
        onLogin={onLogin}
        onSignup={onSignup}
        onLogout={onLogout}
      />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
