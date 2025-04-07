import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import MainLayout from './components/layout/MainLayout/MainLayout';
import AppRoutes from './routes/AppRoutes';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    alert('Login clicked');
    // In a real app, this would open a login modal or redirect to a login page
  };

  const handleSignup = () => {
    alert('Sign up clicked');
    // In a real app, this would open a signup modal or redirect to a signup page
  };

  const handleLogout = () => {
    alert('Logout clicked');
    // In a real app, this would handle the logout process
  };

  return (
    <BrowserRouter>
      <MainLayout
        isAuthenticated={isAuthenticated}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onLogout={handleLogout}
      >
        <AppRoutes />
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
