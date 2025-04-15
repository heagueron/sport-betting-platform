import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Header.css';
import Button from '../../common/Button/Button';
import LanguageSelector from '../../common/LanguageSelector/LanguageSelector';

// Define a type for the t function
type TFunction = (key: string, options?: any) => string;

interface HeaderProps {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  onLogin?: () => void;
  onSignup?: () => void;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isAuthenticated = false,
  isAdmin = false,
  onLogin,
  onSignup,
  onLogout,
}) => {
  const { t } = useTranslation() as { t: TFunction };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Add scroll event listener to change header background on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          <div className="header-section left-section">
            <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
              <ul className="nav-list">
                <li className="nav-item">
                  <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>{t('header.home')}</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>{t('header.aboutUs')}</NavLink>
                </li>
                {isAuthenticated && isAdmin && (
                  <li className="nav-item">
                    <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Admin</NavLink>
                  </li>
                )}
                <li className="nav-item mobile-only">
                  {isAuthenticated ? (
                    <Button variant="outline" onClick={onLogout} className="modern-button mobile-button">
                      {t('header.logout')}
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={onLogin} className="modern-button mobile-button login-button">
                        {t('header.login')}
                      </Button>
                      <Button onClick={onSignup} className="modern-button mobile-button signup-button">
                        {t('header.signup')}
                      </Button>
                    </>
                  )}
                </li>
              </ul>
            </nav>
          </div>

          <div className="header-section center-section">
            <div className="header-logo">
              <Link to="/">
                <img src="/images/Logo_SBP_removed_bg.png" alt="SBP Logo" className="logo-image" />
              </Link>
            </div>
          </div>

          <div className="header-section right-section">
            <div className="header-actions">
              <LanguageSelector />
              {isAuthenticated ? (
                <Button variant="outline" onClick={onLogout} className="modern-button">
                  {t('header.logout')}
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={onLogin} className="modern-button login-button">
                    {t('header.login')}
                  </Button>
                  <Button onClick={onSignup} className="modern-button signup-button">
                    {t('header.signup')}
                  </Button>
                </>
              )}
            </div>
          </div>

          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <span className="menu-icon"></span>
          </button>
        </div>
    </header>
  );
};

export default Header;
