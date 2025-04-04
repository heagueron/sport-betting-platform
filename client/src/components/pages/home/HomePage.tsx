import { MainLayout } from '../../layout/MainLayout/MainLayout';
import { Hero } from './Hero/Hero';
import { FeaturedEvents } from './FeaturedEvents/FeaturedEvents';
import { SportsList } from './SportsList/SportsList';
import styles from './HomePage.module.css';

export const HomePage = () => {
  return (
    <MainLayout>
      <div className={styles.homePage}>
        <Hero />
        <FeaturedEvents />
        <SportsList />
      </div>
    </MainLayout>
  );
};
