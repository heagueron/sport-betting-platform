import { ReactNode } from 'react';
import { Header } from '../Header/Header';
import { Navigation } from '../Navigation/Navigation';
import { Sidebar } from '../Sidebar/Sidebar';
import { Footer } from '../Footer/Footer';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: ReactNode;
  hideSidebar?: boolean;
}

export const MainLayout = ({ children, hideSidebar = false }: MainLayoutProps) => {
  return (
    <div className={styles.layout}>
      <Header />
      <Navigation />
      <div className={styles.main}>
        {!hideSidebar && <Sidebar />}
        <main className={styles.content}>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};
