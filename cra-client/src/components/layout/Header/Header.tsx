import React, { useState } from 'react';
import './Header.css';
import Button from '../../common/Button/Button';

interface HeaderProps {
  isAuthenticated?: boolean;
  onLogin?: () => void;
  onSignup?: () => void;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isAuthenticated = false,
  onLogin,
  onSignup,
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-logo">
            <a href="/">
              <h1>SBP</h1>
            </a>
          </div>

          <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <ul className="nav-list">
              <li className="nav-item">
                <a href="/" className="nav-link">Home</a>
              </li>
              <li className="nav-item">
                <a href="/sports" className="nav-link">Sports</a>
              </li>
              <li className="nav-item">
                <a href="/events" className="nav-link">Events</a>
              </li>
              <li className="nav-item">
                <a href="/about" className="nav-link">About</a>
              </li>
            </ul>
          </nav>

          <div className="header-actions">
            {isAuthenticated ? (
              <Button variant="outline" onClick={onLogout}>
                Logout
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={onLogin}>
                  Login
                </Button>
                <Button onClick={onSignup}>
                  Sign Up
                </Button>
              </>
            )}
          </div>

          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <span className="menu-icon"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
