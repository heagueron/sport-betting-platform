import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../contexts/AuthContext';
import styles from './Header.module.css';

export const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuthContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.logo}>
          <Link to="/">
            <img 
              src="/logo.svg" 
              alt="BetMaster Logo" 
              className={styles.logoImage} 
            />
          </Link>
          <span className={styles.logoText}>BetMaster</span>
        </div>

        <div className={styles.userSection}>
          {isAuthenticated ? (
            <>
              <div className={styles.balance}>
                Balance: <span className={styles.balanceAmount}>${user?.balance.toFixed(2)}</span>
              </div>
              
              <div className={styles.userMenu} onClick={toggleMenu}>
                <span className={styles.userName}>
                  {user?.name}
                  {isAdmin && <span className={styles.adminBadge}>Admin</span>}
                </span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6"/>
                </svg>
                
                {isMenuOpen && (
                  <div className={styles.userMenuDropdown}>
                    <ul className={styles.userMenuList}>
                      <li className={styles.userMenuItem}>
                        <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                          My Profile
                        </Link>
                      </li>
                      <li className={styles.userMenuItem}>
                        <Link to="/bets" onClick={() => setIsMenuOpen(false)}>
                          My Bets
                        </Link>
                      </li>
                      {isAdmin && (
                        <li className={styles.userMenuItem}>
                          <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                            Admin Dashboard
                          </Link>
                        </li>
                      )}
                      <li className={styles.userMenuItem}>
                        <button onClick={handleLogout}>
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.authButtons}>
              <Link to="/login" className={styles.loginButton}>
                Login
              </Link>
              <Link to="/register" className={styles.registerButton}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
