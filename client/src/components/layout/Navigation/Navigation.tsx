import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../../../contexts/AuthContext';
import styles from './Navigation.module.css';

export const Navigation = () => {
  const { isAuthenticated, isAdmin } = useAuthContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={styles.navigation}>
      <div className={styles.navContainer}>
        <button 
          className={styles.mobileMenuButton} 
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        <ul className={`${styles.navList} ${isMobileMenuOpen ? styles.navListOpen : ''}`}>
          <li className={styles.navItem}>
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
              }
              onClick={closeMobileMenu}
            >
              Home
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink 
              to="/sports" 
              className={({ isActive }) => 
                `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
              }
              onClick={closeMobileMenu}
            >
              Sports
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink 
              to="/live" 
              className={({ isActive }) => 
                `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
              }
              onClick={closeMobileMenu}
            >
              Live Events
            </NavLink>
          </li>
          {isAuthenticated && (
            <li className={styles.navItem}>
              <NavLink 
                to="/bets" 
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
                }
                onClick={closeMobileMenu}
              >
                My Bets
              </NavLink>
            </li>
          )}
          {isAdmin && (
            <li className={styles.navItem}>
              <NavLink 
                to="/admin" 
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
                }
                onClick={closeMobileMenu}
              >
                Admin
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};
