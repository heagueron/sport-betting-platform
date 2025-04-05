import { MainLayout } from '../../layout/MainLayout/MainLayout';
import { Hero } from './Hero/Hero';
import { FeaturedEvents } from './FeaturedEvents/FeaturedEvents';
import { SportsList } from './SportsList/SportsList';
import { FloatingIcons } from '../../common/FloatingIcons/FloatingIcons';
import styles from './HomePage.module.css';

export const HomePage = () => {
  return (
    <MainLayout>
      <div className={styles.homePage}>
        <FloatingIcons />
        <Hero />
        <FeaturedEvents />
        <SportsList />
      </div>
    </MainLayout>
  );
};
