import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';
import styles from './AdminLayout.module.css';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.main}>
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Admin Dashboard</h2>
          <nav>
            <ul className={styles.navList}>
              <li className={styles.navItem}>
                <NavLink 
                  to="/admin" 
                  end
                  className={({ isActive }) => 
                    `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
                  }
                >
                  Dashboard
                </NavLink>
              </li>
              <li className={styles.navItem}>
                <NavLink 
                  to="/admin/users" 
                  className={({ isActive }) => 
                    `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
                  }
                >
                  Users
                </NavLink>
              </li>
              <li className={styles.navItem}>
                <NavLink 
                  to="/admin/sports" 
                  className={({ isActive }) => 
                    `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
                  }
                >
                  Sports
                </NavLink>
              </li>
              <li className={styles.navItem}>
                <NavLink 
                  to="/admin/events" 
                  className={({ isActive }) => 
                    `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
                  }
                >
                  Events
                </NavLink>
              </li>
              <li className={styles.navItem}>
                <NavLink 
                  to="/admin/bets" 
                  className={({ isActive }) => 
                    `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
                  }
                >
                  Bets
                </NavLink>
              </li>
            </ul>
          </nav>
        </aside>
        <main className={styles.content}>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};
